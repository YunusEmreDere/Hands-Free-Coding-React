import { useCallback } from 'react';
import useSettingsStore from '../store/settingsStore';
import translations, { type TranslationKey } from './translations';

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] ?? key;
    },
    [language]
  );

  return { t, language };
}
