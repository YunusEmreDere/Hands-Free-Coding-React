interface FooterProps {
  sidebarCollapsed: boolean;
}

export default function Footer({ sidebarCollapsed }: FooterProps) {
  const currentTime = new Date().toUTCString().split(' ')[4];

  return (
    <footer className={`fixed bottom-0 right-0 h-12 bg-dark-bg border-t border-dark-border px-8 flex items-center justify-between text-xs text-theme-text-muted font-mono z-10 transition-all duration-300 ${
      sidebarCollapsed ? 'left-16' : 'left-64'
    }`}>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>SYSTEM READY</span>
        </div>
        <span>📶 latency: 12ms</span>
      </div>

      <div className="flex items-center gap-8">
        <span>workspace: main_branch/ui-core</span>
        <span>UTC: {currentTime}</span>
      </div>
    </footer>
  );
}
