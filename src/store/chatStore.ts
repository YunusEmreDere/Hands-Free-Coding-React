import { create } from 'zustand';
import { ChatStore, Message, Chat } from '../types';

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [
    {
      role: 'assistant',
      content: 'Merhaba! Kodunuz veya projeniz hakkında bir şey sormak ister misiniz?'
    }
  ],
  chatHistory: [],
  currentChatId: null,

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));

    // Auto-save to current chat
    const { currentChatId, chatHistory, messages } = get();
    if (currentChatId !== null) {
      const updatedHistory = chatHistory.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...messages, message] }
          : chat
      );
      set({ chatHistory: updatedHistory });
    }
  },

  createNewChat: () => {
    const { chatHistory, currentChatId, messages } = get();

    // Save current chat before creating new one
    if (currentChatId !== null) {
      const updatedHistory = chatHistory.map((chat) =>
        chat.id === currentChatId ? { ...chat, messages } : chat
      );
      set({ chatHistory: updatedHistory });
    }

    // Create new chat
    const newChatId = chatHistory.length;
    const newChat: Chat = {
      id: newChatId,
      title: `Chat ${newChatId + 1}`,
      messages: [
        {
          role: 'assistant',
          content: 'Merhaba! Kodunuz veya projeniz hakkında bir şey sormak ister misiniz?'
        }
      ]
    };

    set({
      chatHistory: [...chatHistory, newChat],
      currentChatId: newChatId,
      messages: newChat.messages
    });
  },

  switchChat: (chatId: number) => {
    const { chatHistory } = get();
    const chat = chatHistory.find((c) => c.id === chatId);

    if (chat) {
      set({
        currentChatId: chatId,
        messages: chat.messages
      });
    }
  },

  clearSession: () => {
    set({
      messages: [
        {
          role: 'assistant',
          content: 'Merhaba! Kodunuz veya projeniz hakkında bir şey sormak ister misiniz?'
        }
      ],
      chatHistory: [],
      currentChatId: null
    });
  }
}));

export default useChatStore;
