import { Menu, Search } from 'lucide-react';

export function Header({ onMenuClick, onSearchClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <h1 className="text-base font-semibold text-gray-900 sm:text-lg">IT Asset Management</h1>

      <button
        onClick={onSearchClick}
        className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Search everything...</span>
        <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-xs sm:inline">Ctrl K</kbd>
      </button>
    </header>
  );
}
