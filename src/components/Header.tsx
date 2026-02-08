import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 right-0 h-16 bg-dark-bg border-b border-dark-border px-8 flex items-center justify-between z-10 transition-all duration-300 ${
      sidebarCollapsed ? 'left-16' : 'left-64'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold">VoiceCode AI</span>
      </div>

      {/* Explorer Button */}
      <button
        onClick={() => navigate('/explorer')}
        className="flex items-center gap-2 px-4 py-2 bg-theme-surface border border-purple-primary/30 rounded-lg text-sm text-theme-text-secondary hover:border-purple-primary/60 hover:text-theme-text transition-all"
      >
        Project Explorer
      </button>
    </header>
  );
}
