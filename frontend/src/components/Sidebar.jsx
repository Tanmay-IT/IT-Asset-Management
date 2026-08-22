import { LayoutDashboard, Monitor, Server, Printer, HardDrive, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/computers', label: 'Computers', icon: Monitor },
  { to: '/server-room', label: 'Server Room', icon: Server },
  { to: '/toners', label: 'Toners', icon: Printer },
  { to: '/hdd', label: 'HDD Archive', icon: HardDrive },
];

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2.5">
            <img src="/igl-logo.png" alt="IGL" className="h-9 w-9 shrink-0" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">IGL</p>
              <p className="text-xs text-gray-400">IT Asset Management</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 md:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
