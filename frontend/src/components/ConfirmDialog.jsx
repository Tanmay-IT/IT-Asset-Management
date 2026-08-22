import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export function ConfirmDialog({ title, message, confirmLabel = 'Remove', onConfirm, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen onClose={onCancel} title={title}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={18} />
          </div>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            type="button"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            type="button"
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Removing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
