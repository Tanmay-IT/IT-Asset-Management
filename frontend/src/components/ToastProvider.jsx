import { useCallback, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { ToastContext } from '../hooks/useToast';

const VARIANTS = {
  success: { icon: CheckCircle2, ring: 'ring-green-100', iconColor: 'text-green-600', bar: 'bg-green-500' },
  error: { icon: XCircle, ring: 'ring-red-100', iconColor: 'text-red-600', bar: 'bg-red-500' },
  info: { icon: Info, ring: 'ring-gray-100', iconColor: 'text-gray-600', bar: 'bg-gray-400' },
};

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, variant = 'success', duration = 4000) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (message, duration) => show(message, 'success', duration),
    error: (message, duration) => show(message, 'error', duration),
    info: (message, duration) => show(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end">
        {toasts.map((t) => {
          const variant = VARIANTS[t.variant] || VARIANTS.info;
          const Icon = variant.icon;
          return (
            <div
              key={t.id}
              className={`animate-toast-in pointer-events-auto relative flex w-[calc(100vw-2rem)] max-w-sm items-start gap-2.5 overflow-hidden rounded-2xl bg-white p-3.5 pr-9 shadow-2xl ring-1 dark:bg-gray-800 dark:ring-white/10 ${variant.ring}`}
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${variant.bar}`} />
              <Icon size={18} className={`mt-0.5 shrink-0 ${variant.iconColor}`} />
              <p className="text-sm text-gray-800 dark:text-gray-100">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="absolute right-2 top-2 rounded-full p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
