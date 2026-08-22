import { X } from 'lucide-react';

const sizes = {
  sm: 'max-w-sm',
  lg: 'max-w-3xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'sm' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`flex max-h-[85vh] w-full ${sizes[size]} flex-col rounded-xl bg-white shadow-lg`}>
        <div className="flex items-center justify-between border-b border-gray-100 p-5 pb-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 pt-4">{children}</div>
      </div>
    </div>
  );
}
