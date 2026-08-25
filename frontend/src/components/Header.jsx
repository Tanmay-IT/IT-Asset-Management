import { Menu, Search, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Header({ onMenuClick, onSearchClick, isDark, onToggleDark }) {
  const { user, logout } = useAuth();

  return (
    <header className="no-print sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 transition-colors sm:px-6 dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <h1 className="text-base font-semibold sm:text-lg">
        <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent dark:from-red-400 dark:to-red-600">
          IT
        </span>{' '}
        <span className="text-gray-900 dark:text-gray-100">Asset Management</span>
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-600 dark:hover:text-gray-300"
        >
          <Search size={15} />
          <span className="hidden sm:inline">Search everything...</span>
          <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-xs sm:inline dark:border-gray-700">
            Ctrl K
          </kbd>
        </button>
        <button
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {user && (
          <span className="hidden max-w-[10rem] truncate text-xs text-gray-400 dark:text-gray-500 sm:inline">
            {user.name || user.email}
          </span>
        )}
        <button
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
