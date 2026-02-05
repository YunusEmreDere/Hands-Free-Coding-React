# VoiceCode AI - React Dashboard

Modern, glassmorphism tasarımlı AI chat arayüzü. Streamlit'ten React'a geçirilmiş versiyon.

## 🚀 Teknolojiler

- **React 18** + **TypeScript**
- **Vite** (super fast build tool)
- **Tailwind CSS** (utility-first styling)
- **Zustand** (lightweight state management)

## 📦 Kurulum

```bash
# Dependencies'i yükle
npm install

# Development server'ı başlat (http://localhost:3000)
npm run dev

# Production build
npm run build

# Production preview
npm run preview
```

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Sidebar.tsx          # Sol menü (chat geçmişi, yeni chat, çıkış)
│   ├── Header.tsx           # Üst header (logo, navigation)
│   ├── Visualizer.tsx       # Ses visualizer (sol kolon)
│   ├── ChatInterface.tsx    # Chat arayüzü (sağ kolon)
│   └── Footer.tsx           # Alt footer (sistem bilgileri)
├── store/
│   └── chatStore.ts         # Zustand store (global state)
├── types/
│   └── index.ts             # TypeScript type definitions
├── styles/
│   └── globals.css          # Global styles + Tailwind
├── App.tsx                  # Ana uygulama
└── main.tsx                 # Entry point
```

## ✨ Özellikler

- ✅ **Glassmorphism UI** - Modern, blur efektli tasarım
- ✅ **Chat Geçmişi** - Birden fazla chat oturumu yönetimi
- ✅ **Ses Visualizer** - Animasyonlu ses barları
- ✅ **Responsive** - Mobil uyumlu
- ✅ **TypeScript** - Type-safe kod
- ✅ **Zustand** - Lightweight state management
- ✅ **Auto-scroll** - Yeni mesajlara otomatik kaydırma

## 🎨 Renk Paleti

- **Background**: `#0a0a12`
- **Panel**: `#0f0f1a`
- **Border**: `#1a1a2e`
- **Purple**: `#7c3aed`
- **Cyan**: `#06b6d4`

## 🔧 Geliştirme

```bash
# Lint check
npm run lint

# Type check
npx tsc --noEmit
```

## 📝 Notlar

- Chat mesajları browser session'ında saklanır (localStorage yok, refresh'te silinir)
- AI yanıtları şu an simüle edilmiş (gerçek API entegrasyonu için `ChatInterface.tsx` güncellenebilir)
- Tailwind CSS kullanıldı, custom CSS minimal

## 🚧 TODO

- [ ] LocalStorage ile chat geçmişi kalıcılığı
- [ ] Gerçek AI API entegrasyonu
- [ ] Markdown rendering (AI yanıtları için)
- [ ] Dark/Light mode toggle
- [ ] Ses kaydı özelliği
- [ ] Export chat history

---

**Önceki versiyon**: Streamlit (Python) → `/pages/dashboard.py`
**Yeni versiyon**: React + Vite + TypeScript 🎉
