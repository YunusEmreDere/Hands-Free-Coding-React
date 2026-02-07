import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Visualizer from '../components/Visualizer';
import ChatInterface from '../components/ChatInterface';
import Footer from '../components/Footer';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <Header sidebarCollapsed={sidebarCollapsed} />

        {/* Content - fills between header (h-16) and footer (h-12) */}
        <main className="pt-16 pb-12 px-8 grid grid-cols-2 gap-8 h-screen">
          {/* Left Half - Visualizer (vertically centered) */}
          <div className="flex items-center justify-center">
            <Visualizer />
          </div>

          {/* Right Half - Chat Interface (stretches full height, bottom touches footer) */}
          <div className="flex flex-col py-4">
            <ChatInterface />
          </div>
        </main>

        {/* Footer */}
        <Footer sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  );
}
