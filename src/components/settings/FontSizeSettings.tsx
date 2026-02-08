import useSettingsStore from '../../store/settingsStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function FontSizeSettings() {
  const { fontSize, setFontSize } = useSettingsStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-theme-text">{t('settings.fontSize')}</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-theme-text-muted">
          <span className="text-sm">14px</span>
          <span className="text-2xl font-bold text-purple-primary">{fontSize}px</span>
          <span className="text-sm">22px</span>
        </div>
        <input
          type="range"
          min={14}
          max={22}
          step={1}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full h-2 bg-theme-border rounded-lg appearance-none cursor-pointer accent-purple-primary"
        />
        {/* Preview */}
        <div className="bg-theme-surface border border-theme-border rounded-xl p-4 mt-4">
          <p className="text-theme-text-muted" style={{ fontSize: `${fontSize}px` }}>
            {t('settings.fontSize.preview')}
          </p>
        </div>
      </div>
    </div>
  );
}
