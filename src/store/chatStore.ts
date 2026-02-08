import { create } from 'zustand';
import { ChatStore, Message, Chat } from '../types'; // Types dosyanın doğru yerde olduğundan emin ol

const useChatStore = create<ChatStore>((set, get) => ({
  // Başlangıç Durumu
  messages: [],
  chatHistory: [],
  currentChatId: null,

  // 1. Yeni Mesaj Ekleme (Kullanıcı gönderdiğinde veya AI cevap bitince)
  addMessage: (message: Message) => {
    set((state) => {
      const newMessages = [...state.messages, message];

      // Eğer aktif bir sohbet varsa, geçmişi de güncelle (Sidebar için)
      let updatedHistory = state.chatHistory;
      if (state.currentChatId !== null) {
        updatedHistory = state.chatHistory.map((chat) =>
          chat.id === state.currentChatId
            ? { ...chat, messages: newMessages }
            : chat
        );
      }

      return {
        messages: newMessages,
        chatHistory: updatedHistory,
      };
    });
  },

  // 2. [ÖNEMLİ] Akış Halindeki Mesajı Güncelleme (WebSocket için)
  updateLastMessage: (content: string) => {
    set((state) => {
      const newMessages = [...state.messages];
      const lastIndex = newMessages.length - 1;

      // Eğer hiç mesaj yoksa işlem yapma
      if (lastIndex < 0) return {};

      // Son mesajın içeriğine yeni gelen harfi/parçayı ekle
      const lastMessage = newMessages[lastIndex];
      newMessages[lastIndex] = {
        ...lastMessage,
        content: lastMessage.content + content,
      };

      // Bu değişikliği anında geçmişe de yansıt (Sohbet değiştirsen bile kaybolmaz)
      let updatedHistory = state.chatHistory;
      if (state.currentChatId !== null) {
        updatedHistory = state.chatHistory.map((chat) =>
          chat.id === state.currentChatId
            ? { ...chat, messages: newMessages }
            : chat
        );
      }

      return {
        messages: newMessages,
        chatHistory: updatedHistory,
      };
    });
  },

  // 3. Yeni Sohbet Oluşturma
  createNewChat: () => {
    const { chatHistory } = get();
    
    // Benzersiz bir ID oluştur (Timestamp en güvenlisidir)
    const newChatId = Date.now(); 
    
    // Yeni sohbetin başlangıç mesajı
    const initialMessage: Message = {
      role: 'assistant',
      content: 'Merhaba! Yeni bir oturum başlattınız. Kodunuzla ilgili ne sormak istersiniz?'
    };

    const newChat: Chat = {
      id: newChatId,
      title: `Chat ${chatHistory.length + 1}`, // Örn: Chat 1, Chat 2
      messages: [initialMessage]
    };

    set({
      chatHistory: [...chatHistory, newChat], // Listeye ekle
      currentChatId: newChatId,              // Aktif yap
      messages: newChat.messages             // Ekrana bas
    });
  },

  // 4. Sohbetler Arası Geçiş
  switchChat: (chatId: number) => {
    const { chatHistory } = get();
    const targetChat = chatHistory.find((c) => c.id === chatId);

    if (targetChat) {
      set({
        currentChatId: chatId,
        messages: targetChat.messages // O sohbetin mesajlarını yükle
      });
    }
  },

  // 5. Oturumu Temizle (Opsiyonel: Ayarlar sayfası için)
  clearSession: () => {
    set({
      messages: [],
      chatHistory: [],
      currentChatId: null
    });
  }
}));

export default useChatStore;