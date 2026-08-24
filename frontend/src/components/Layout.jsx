import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { TopProgressBar } from './TopProgressBar';
import { useDarkMode } from '../hooks/useDarkMode';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isDark, setIsDark] = useDarkMode();
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    } catch {
      // ignore storage failures (e.g. private browsing)
    }
  }, [isCollapsed]);

  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => setIsNavigating(false), 420);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <TopProgressBar active={isNavigating} />

      <div className="no-print">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapsed={() => setIsCollapsed((prev) => !prev)}
        />
      </div>

      <div className={`flex flex-col transition-[padding] duration-300 ease-in-out ${isCollapsed ? 'md:pl-16' : 'md:pl-64'}`}>
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          onSearchClick={() => setIsPaletteOpen(true)}
          isDark={isDark}
          onToggleDark={() => setIsDark((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {isPaletteOpen && <CommandPalette onClose={() => setIsPaletteOpen(false)} />}
    </div>
  );
}
