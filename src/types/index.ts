export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
}

export interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

export interface ChatStore {
  messages: Message[];
  chatHistory: Chat[];
  currentChatId: number | null;

  // Actions
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  createNewChat: () => void;
  switchChat: (chatId: number) => void;
  clearSession: () => void;
}
