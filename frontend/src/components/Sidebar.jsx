import { LayoutDashboard, Monitor, Server, Printer, HardDrive, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/computers', label: 'Computers', icon: Monitor },
  { to: '/server-room', label: 'Server Room', icon: Server },
  { to: '/toners', label: 'Toners', icon: Printer },
  { to: '/hdd', label: 'HDD Archive', icon: HardDrive },
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapsed }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 transform border-r border-gray-200 bg-white transition-all duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-64 md:w-16' : 'w-64'}`}
      >
        <div className={`flex items-center border-b border-gray-200 p-4 ${isCollapsed ? 'md:justify-center md:px-2' : 'justify-between'}`}>
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'md:hidden' : ''}`}>
            <img src="/igl-logo.png" alt="IGL" className="h-9 w-9 shrink-0" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">IGL</p>
              <p className="text-xs text-gray-400">IT Asset Management</p>
            </div>
          </div>
          {isCollapsed && <img src="/igl-logo.png" alt="IGL" className="hidden h-8 w-8 shrink-0 md:block" />}
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
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                } ${isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className={isCollapsed ? 'md:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={onToggleCollapsed}
          className={`absolute bottom-3 hidden items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:flex ${
            isCollapsed ? 'left-1/2 -translate-x-1/2 justify-center px-2' : 'left-3'
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!isCollapsed && 'Collapse'}
        </button>
      </aside>
    </>
  );
}
