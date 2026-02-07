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
        <div className="w-8 h-8 bg-gradient-purple-cyan rounded-lg flex items-center justify-center">
          <span className="text-lg">🛡️</span>
        </div>
        <span className="text-lg font-semibold">VoiceCode AI</span>
      </div>

      {/* Explorer Button */}
      <button
        onClick={() => navigate('/explorer')}
        className="flex items-center gap-2 px-4 py-2 bg-[#15151e] border border-purple-primary/30 rounded-lg text-sm text-gray-300 hover:border-purple-primary/60 hover:text-white transition-all"
      >
        <span className="text-[#7c3aed]">📊</span>
        Project Explorer
      </button>
    </header>
  );
}
