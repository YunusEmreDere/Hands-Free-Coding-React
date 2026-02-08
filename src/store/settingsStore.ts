import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsStore, Theme } from '../types/settings';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

function applyFontSize(size: number) {
  document.documentElement.style.fontSize = `${size}px`;
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      models: [],
      activeModelId: null,
      theme: 'dark',
      fontSize: 16,
      language: 'tr',
      account: { displayName: '', email: '' },

      addModel: (name, path) => {
        const id = crypto.randomUUID();
        set((s) => ({
          models: [...s.models, { id, name, path, addedAt: Date.now() }],
        }));
      },
      removeModel: (id) =>
        set((s) => ({
          models: s.models.filter((m) => m.id !== id),
          activeModelId: s.activeModelId === id ? null : s.activeModelId,
        })),
      setActiveModel: (id) => set({ activeModelId: id }),

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      setFontSize: (fontSize) => {
        applyFontSize(fontSize);
        set({ fontSize });
      },

      setLanguage: (language) => set({ language }),
      updateAccount: (info) =>
        set((s) => ({ account: { ...s.account, ...info } })),
    }),
    {
      name: 'voicecode-settings',
      onRehydrate: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          applyFontSize(state.fontSize);
        }
      },
    }
  )
);

export default useSettingsStore;
