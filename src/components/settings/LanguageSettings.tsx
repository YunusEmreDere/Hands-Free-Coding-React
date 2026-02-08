import useSettingsStore from '../../store/settingsStore';
import { useTranslation } from '../../i18n/useTranslation';
import type { Language } from '../../types/settings';

export default function LanguageSettings() {
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();

  const options: { value: Language; label: string; flag: string }[] = [
    { value: 'tr', label: t('settings.language.tr'), flag: '🇹🇷' },
    { value: 'en', label: t('settings.language.en'), flag: '🇬🇧' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-theme-text">{t('settings.language')}</h2>
      <div className="flex gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLanguage(opt.value)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-medium transition-all ${
              language === opt.value
                ? 'bg-purple-primary/20 border-2 border-purple-primary/60 text-theme-text'
                : 'bg-theme-surface border-2 border-theme-border text-theme-text-muted hover:border-purple-primary/30'
            }`}
          >
            <span className="text-2xl">{opt.flag}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
