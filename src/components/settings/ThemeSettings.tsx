import useSettingsStore from '../../store/settingsStore';
import { useTranslation } from '../../i18n/useTranslation';
import type { Theme } from '../../types/settings';

export default function ThemeSettings() {
  const { theme, setTheme } = useSettingsStore();
  const { t } = useTranslation();

  const options: { value: Theme; label: string; icon: string; desc: string }[] = [
    { value: 'dark', label: t('settings.theme.dark'), icon: '🌙', desc: '' },
    { value: 'light', label: t('settings.theme.light'), icon: '☀️', desc: '' },
    { value: 'system', label: t('settings.theme.system'), icon: '💻', desc: '' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-theme-text">{t('settings.theme')}</h2>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl text-sm font-medium transition-all ${
              theme === opt.value
                ? 'bg-purple-primary/20 border-2 border-purple-primary/60 text-theme-text'
                : 'bg-theme-surface border-2 border-theme-border text-theme-text-muted hover:border-purple-primary/30'
            }`}
          >
            <span className="text-3xl">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
