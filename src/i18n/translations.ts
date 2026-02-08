const translations = {
  tr: {
    // Settings
    'settings.title': 'Ayarlar',
    'settings.models': 'Model Yönetimi',
    'settings.models.empty': 'Henüz model eklenmedi. Bilgisayarınıza indirdiğiniz modelleri buradan ekleyebilirsiniz.',
    'settings.models.add': 'Model Ekle',
    'settings.models.name': 'Model Adı (ör: Llama 3.1 70B)',
    'settings.models.path': 'Model Yolu (ör: /models/llama-3.1-70b)',
    'settings.models.delete': 'Sil',
    'settings.models.active': 'Aktif',
    'settings.models.setActive': 'Aktif Yap',
    'settings.language': 'Dil',
    'settings.language.tr': 'Türkçe',
    'settings.language.en': 'English',
    'settings.fontSize': 'Yazı Boyutu',
    'settings.fontSize.preview': 'Bu metin seçilen yazı boyutunda görünür.',
    'settings.theme': 'Tema',
    'settings.theme.dark': 'Karanlık',
    'settings.theme.light': 'Aydınlık',
    'settings.theme.system': 'Sistem',
    'settings.account': 'Hesap',
    'settings.account.displayName': 'Görünen Ad',
    'settings.account.email': 'E-Posta',
    'settings.account.password': 'Şifre Değiştir',
    'settings.account.currentPassword': 'Mevcut Şifre',
    'settings.account.newPassword': 'Yeni Şifre',
    'settings.account.save': 'Kaydet',
    'settings.account.saved': 'Kaydedildi!',

    // Sidebar
    'sidebar.newChat': 'Yeni Chat Başlat',
    'sidebar.chats': 'Mevcut Chatler',
    'sidebar.noChats': 'Henüz chat yok',
    'sidebar.settings': 'Ayarlar',
    'sidebar.logout': 'Çıkış Yap',

    // Chat
    'chat.placeholder': 'Mesajınızı yazın...',
    'chat.send': 'Gönder',
  },
  en: {
    // Settings
    'settings.title': 'Settings',
    'settings.models': 'Model Management',
    'settings.models.empty': 'No models added yet. You can add models you\'ve downloaded to your computer here.',
    'settings.models.add': 'Add Model',
    'settings.models.name': 'Model Name (e.g. Llama 3.1 70B)',
    'settings.models.path': 'Model Path (e.g. /models/llama-3.1-70b)',
    'settings.models.delete': 'Delete',
    'settings.models.active': 'Active',
    'settings.models.setActive': 'Set Active',
    'settings.language': 'Language',
    'settings.language.tr': 'Türkçe',
    'settings.language.en': 'English',
    'settings.fontSize': 'Font Size',
    'settings.fontSize.preview': 'This text previews the selected font size.',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.theme.system': 'System',
    'settings.account': 'Account',
    'settings.account.displayName': 'Display Name',
    'settings.account.email': 'Email',
    'settings.account.password': 'Change Password',
    'settings.account.currentPassword': 'Current Password',
    'settings.account.newPassword': 'New Password',
    'settings.account.save': 'Save',
    'settings.account.saved': 'Saved!',

    // Sidebar
    'sidebar.newChat': 'New Chat',
    'sidebar.chats': 'Existing Chats',
    'sidebar.noChats': 'No chats yet',
    'sidebar.settings': 'Settings',
    'sidebar.logout': 'Log Out',

    // Chat
    'chat.placeholder': 'Type your message here...',
    'chat.send': 'Send',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['tr'];
export default translations;
