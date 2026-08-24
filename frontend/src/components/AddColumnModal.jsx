import { useState } from 'react';
import { Modal } from './Modal';

export function AddColumnModal({ onClose, onSubmit }) {
  const [label, setLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(label.trim());
      onClose();
    } catch (err) {
      setError(err);
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Add Column">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm text-gray-600 dark:text-gray-400">
          Column Name
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
            placeholder="e.g. Vendor Contact"
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || !label.trim()}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isSaving ? 'Adding...' : 'Add Column'}
        </button>
      </form>
    </Modal>
  );
}
