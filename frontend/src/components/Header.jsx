import { Menu } from 'lucide-react';

export function Header({ onMenuClick }) {
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
    </header>
  );
}
