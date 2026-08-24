import { useEffect } from 'react';
import { X } from 'lucide-react';

const sizes = {
  sm: 'max-w-sm',
  lg: 'max-w-3xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'sm' }) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="animate-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`animate-modal-panel flex max-h-[85vh] w-full ${sizes[size]} flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-5 pb-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 pt-4">{children}</div>
      </div>
    </div>
  );
}
