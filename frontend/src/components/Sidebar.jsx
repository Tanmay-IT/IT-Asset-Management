import { useState } from 'react';
import {
  LayoutDashboard,
  Monitor,
  Server,
  Printer,
  HardDrive,
  ShieldCheck,
  Layers,
  Plus,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AddModuleModal } from './AddModuleModal';
import { useCustomModules } from '../hooks/useCustomModules';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/computers', label: 'Computers', icon: Monitor },
  { to: '/server-room', label: 'Server Room', icon: Server },
  { to: '/toners', label: 'Toners', icon: Printer },
  { to: '/hdd', label: 'HDD Archive', icon: HardDrive },
  { to: '/warranty', label: 'Warranty', icon: ShieldCheck },
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapsed }) {
  const { modules } = useCustomModules();
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const navigate = useNavigate();

  async function handleModuleCreated(module) {
    setIsAddModuleOpen(false);
    navigate(`/modules/${module.slug}`);
    onClose();
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex transform flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out md:translate-x-0 dark:border-gray-800 dark:bg-gray-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-64 md:w-16' : 'w-64'}`}
      >
        <div
          className={`flex items-center border-b border-gray-200 p-4 dark:border-gray-800 ${isCollapsed ? 'md:justify-center md:px-2' : 'justify-between'}`}
        >
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'md:hidden' : ''}`}>
            <img src="/igl-logo.png" alt="IGL" className="h-9 w-9 shrink-0" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gold-600 dark:text-gold-400">IGL</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">IT Asset Management</p>
            </div>
          </div>
          {isCollapsed && <img src="/igl-logo.png" alt="IGL" className="hidden h-8 w-8 shrink-0 md:block" />}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 md:hidden dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
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
                } ${isActive ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className={isCollapsed ? 'md:hidden' : ''}>{label}</span>
            </NavLink>
          ))}

          {modules.length > 0 && (
            <>
              <p
                className={`mt-3 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-600 ${isCollapsed ? 'md:hidden' : ''}`}
              >
                Your Modules
              </p>
              {modules.map((module) => (
                <NavLink
                  key={module.slug}
                  to={`/modules/${module.slug}`}
                  onClick={onClose}
                  title={module.name}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isCollapsed ? 'md:justify-center md:px-0' : ''
                    } ${isActive ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`
                  }
                >
                  <Layers size={18} className="shrink-0" />
                  <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>{module.name}</span>
                </NavLink>
              ))}
            </>
          )}

          <button
            onClick={() => setIsAddModuleOpen(true)}
            type="button"
            title="Add Module"
            className={`mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 ${
              isCollapsed ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <Plus size={18} className="shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Add Module</span>
          </button>
        </nav>

        <button
          onClick={onToggleCollapsed}
          className={`hidden items-center gap-2 border-t border-gray-100 px-3 py-3 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:flex dark:border-gray-800 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!isCollapsed && 'Collapse'}
        </button>
      </aside>

      {isAddModuleOpen && (
        <AddModuleModal onClose={() => setIsAddModuleOpen(false)} onCreated={handleModuleCreated} />
      )}
    </>
  );
}
