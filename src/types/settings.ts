export type Theme = 'dark' | 'light' | 'system';
export type Language = 'tr' | 'en';

export interface AIModel {
  id: string;
  name: string;
  path: string;
  addedAt: number;
}

export interface AccountInfo {
  displayName: string;
  email: string;
}

export interface SettingsState {
  models: AIModel[];
  activeModelId: string | null;
  theme: Theme;
  fontSize: number;
  language: Language;
  account: AccountInfo;
}

export interface SettingsActions {
  addModel: (name: string, path: string) => void;
  removeModel: (id: string) => void;
  setActiveModel: (id: string) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setLanguage: (lang: Language) => void;
  updateAccount: (info: Partial<AccountInfo>) => void;
}

export type SettingsStore = SettingsState & SettingsActions;
