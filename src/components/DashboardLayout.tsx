import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import FugajiBot from './FugajiBot';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, CloudOff } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Network Status Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white px-6 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl animate-slideDown">
          <CloudOff className="w-4 h-4 animate-pulse" />
          <span>Local Mode Active — Synching paused until connectivity returns</span>
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72 transition-all duration-500">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className={`p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto ${!isOnline ? 'mt-12' : ''}`}>
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {children}
          </div>
        </main>
      </div>

      {/* AI Intelligence Layer */}
      <FugajiBot />
    </div>
  );
}
