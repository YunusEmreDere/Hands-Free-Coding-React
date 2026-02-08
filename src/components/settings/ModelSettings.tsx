import { useState } from 'react';
import useSettingsStore from '../../store/settingsStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function ModelSettings() {
  const { models, activeModelId, addModel, removeModel, setActiveModel } = useSettingsStore();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [path, setPath] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !path.trim()) return;
    addModel(name.trim(), path.trim());
    setName('');
    setPath('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-theme-text">{t('settings.models')}</h2>

      {/* Add model form */}
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('settings.models.name')}
          className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text placeholder-theme-text-faint focus:outline-none focus:border-purple-primary/60 transition-colors"
        />
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder={t('settings.models.path')}
          className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text placeholder-theme-text-faint focus:outline-none focus:border-purple-primary/60 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || !path.trim()}
          className="px-6 py-2.5 bg-gradient-purple-cyan text-white rounded-lg hover:opacity-80 transition-opacity font-medium text-sm disabled:opacity-40"
        >
          {t('settings.models.add')}
        </button>
      </div>

      {/* Model list */}
      {models.length === 0 ? (
        <div className="bg-theme-surface border border-theme-border rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">🤖</div>
          <p className="text-theme-text-muted text-sm">{t('settings.models.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((model) => (
            <div
              key={model.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                model.id === activeModelId
                  ? 'bg-purple-primary/10 border-purple-primary/50'
                  : 'bg-theme-surface border-theme-border'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-theme-text">{model.name}</div>
                <div className="text-xs text-theme-text-muted font-mono truncate">{model.path}</div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {model.id === activeModelId ? (
                  <span className="text-xs text-purple-primary font-semibold px-3 py-1 bg-purple-primary/10 rounded-full">
                    {t('settings.models.active')}
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveModel(model.id)}
                    className="text-xs px-3 py-1.5 border border-theme-border rounded-lg text-theme-text-muted hover:border-purple-primary/60 hover:text-theme-text transition-colors"
                  >
                    {t('settings.models.setActive')}
                  </button>
                )}
                <button
                  onClick={() => removeModel(model.id)}
                  className="text-xs px-3 py-1.5 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  {t('settings.models.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
