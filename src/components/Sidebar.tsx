import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/chatStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const {
    chatHistory,
    currentChatId,
    createNewChat,
    switchChat,
    clearSession
  } = useChatStore();

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-theme-panel to-theme-bg border-r border-purple-primary/20 flex flex-col transition-all duration-300 z-20 ${
        collapsed ? 'w-16 p-2' : 'w-64 p-4'
      }`}
    >
      {/* Top: Logo + Toggle */}
      <div className={`mb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <h1 className="text-xl font-semibold flex items-center gap-2 text-theme-text">
            <span>VoiceCode AI</span>
          </h1>
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-theme-border border border-purple-primary/30 text-theme-text-muted hover:text-theme-text hover:border-purple-primary/60 transition-all"
          title={collapsed ? 'Sidebar Aç' : 'Sidebar Kapat'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {!collapsed && <hr className="mb-4 border-purple-primary/10" />}

      {/* Collapsed: only icons */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-3 flex-1">
          <button
            onClick={createNewChat}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-primary/30 to-cyan-primary/30 border border-purple-primary/50 text-white hover:from-purple-primary/40 hover:to-cyan-primary/40 transition-all"
            title="Yeni Chat Başlat"
          >
            ➕
          </button>
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs transition-all ${
                chat.id === currentChatId
                  ? 'bg-purple-primary/20 border border-purple-primary/60 text-white'
                  : 'bg-theme-border/60 border border-purple-primary/30 text-theme-text-muted hover:bg-purple-primary/10'
              }`}
              title={chat.title}
            >
              💬
            </button>
          ))}

          {/* Bottom icons */}
          <div className="mt-auto space-y-2">
            <button
              onClick={() => navigate('/ide')}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-theme-border/60 border border-purple-primary/30 text-theme-text-muted hover:text-theme-text hover:border-purple-primary/60 transition-all"
              title="Unified IDE"
            >
              🖥️
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-theme-border/60 border border-theme-text-faint/40 text-theme-text-muted hover:text-theme-text transition-all"
              title="Ayarlar"
            >
              ⚙️
            </button>
            <button
              onClick={clearSession}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/15 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all"
              title="Çıkış Yap"
            >
              🚪
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Section */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-xs text-theme-text-muted uppercase tracking-wider mb-3">
               Chat
            </h3>

            {/* New Chat Button */}
            <button
              onClick={createNewChat}
              className="w-full mb-4 px-4 py-2.5 bg-gradient-to-r from-purple-primary/30 to-cyan-primary/30 border border-purple-primary/50 text-theme-text rounded-lg hover:from-purple-primary/40 hover:to-cyan-primary/40 transition-all font-medium text-sm"
            >
               Yeni Chat Başlat
            </button>

            {/* Chat History */}
            <h3 className="text-xs text-theme-text-muted uppercase tracking-wider mb-3 mt-6">
               Mevcut Chatler
            </h3>

            {chatHistory.length === 0 ? (
              <p className="text-xs text-theme-text-faint">Henüz chat yok</p>
            ) : (
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => switchChat(chat.id)}
                    className={`w-full px-4 py-2 rounded-lg text-left text-sm transition-all ${
                      chat.id === currentChatId
                        ? 'bg-purple-primary/20 border border-purple-primary/60 text-theme-text'
                        : 'bg-theme-border/60 border border-purple-primary/30 text-theme-text-secondary hover:bg-purple-primary/10'
                    }`}
                  >
                    {chat.id === currentChatId && '🔵 '}
                    {chat.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto pt-4 space-y-2 border-t border-purple-primary/10">
            <button
              onClick={() => navigate('/ide')}
              className="w-full px-4 py-2 bg-theme-border/60 border border-purple-primary/30 text-theme-text-secondary rounded-lg hover:bg-purple-primary/10 hover:border-purple-primary/60 transition-all text-sm"
            >
              🖥️ Unified IDE
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full px-4 py-2 bg-theme-border/60 border border-theme-text-faint/40 text-theme-text-secondary rounded-lg hover:bg-purple-primary/10 hover:border-purple-primary/60 transition-all text-sm"
            >
              ⚙️ Ayarlar
            </button>

            <button
              onClick={clearSession}
              className="w-full px-4 py-2 bg-red-500/15 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 hover:border-red-500 hover:text-white transition-all text-sm font-semibold"
            >
              🚪 Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}
