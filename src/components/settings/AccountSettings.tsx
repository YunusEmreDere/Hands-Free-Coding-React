import { useState } from 'react';
import useSettingsStore from '../../store/settingsStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function AccountSettings() {
  const { account, updateAccount } = useSettingsStore();
  const { t } = useTranslation();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setCurrentPw('');
    setNewPw('');
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass =
    'w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text placeholder-theme-text-faint focus:outline-none focus:border-purple-primary/60 transition-colors';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-theme-text">{t('settings.account')}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-theme-text-muted mb-1.5">
            {t('settings.account.displayName')}
          </label>
          <input
            type="text"
            value={account.displayName}
            onChange={(e) => updateAccount({ displayName: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-theme-text-muted mb-1.5">
            {t('settings.account.email')}
          </label>
          <input
            type="email"
            value={account.email}
            onChange={(e) => updateAccount({ email: e.target.value })}
            className={inputClass}
          />
        </div>

        <hr className="border-theme-border" />

        <h3 className="text-sm font-semibold text-theme-text">{t('settings.account.password')}</h3>
        <div>
          <label className="block text-sm text-theme-text-muted mb-1.5">
            {t('settings.account.currentPassword')}
          </label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-theme-text-muted mb-1.5">
            {t('settings.account.newPassword')}
          </label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-purple-cyan text-white rounded-lg hover:opacity-80 transition-opacity font-medium text-sm"
          >
            {t('settings.account.save')}
          </button>

          {saved && (
            <span className="text-sm text-green-400 font-medium">
              {t('settings.account.saved')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
