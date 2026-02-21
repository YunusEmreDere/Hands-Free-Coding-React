import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModelSettings from '../components/settings/ModelSettings';
import LanguageSettings from '../components/settings/LanguageSettings';
import FontSizeSettings from '../components/settings/FontSizeSettings';
import ThemeSettings from '../components/settings/ThemeSettings';
import AccountSettings from '../components/settings/AccountSettings';
import { useTranslation } from '../i18n/useTranslation';

type SettingsTab = 'models' | 'language' | 'fontSize' | 'theme' | 'account';

export default function Settings() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('models');
  const { t } = useTranslation();

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'models', label: t('settings.models'), icon: '🤖' },
    { key: 'language', label: t('settings.language'), icon: '🌐' },
    { key: 'fontSize', label: t('settings.fontSize'), icon: '🔤' },
    { key: 'theme', label: t('settings.theme'), icon: '🎨' },
    { key: 'account', label: t('settings.account'), icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-theme-bg">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header sidebarCollapsed={sidebarCollapsed} />

        <main className="pt-20 pb-16 px-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-theme-surface border border-theme-border text-theme-text-muted hover:text-theme-text hover:border-purple-primary/40 transition-all"
              title={t('settings.title')}
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-theme-text">{t('settings.title')}</h1>
          </div>

          <div className="flex gap-8">
            {/* Left: Tab navigation */}
            <nav className="w-56 flex-shrink-0 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                    activeTab === tab.key
                      ? 'bg-purple-primary/20 border border-purple-primary/60 text-theme-text font-medium'
                      : 'text-theme-text-muted hover:bg-theme-surface hover:text-theme-text-secondary'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right: Active section content */}
            <div className="flex-1 max-w-2xl bg-theme-panel border border-theme-border rounded-2xl p-8">
              {activeTab === 'models' && <ModelSettings />}
              {activeTab === 'language' && <LanguageSettings />}
              {activeTab === 'fontSize' && <FontSizeSettings />}
              {activeTab === 'theme' && <ThemeSettings />}
              {activeTab === 'account' && <AccountSettings />}
            </div>
          </div>
        </main>

        <Footer sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  );
}
