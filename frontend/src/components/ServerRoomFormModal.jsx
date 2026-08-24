import { useState } from 'react';
import { Modal } from './Modal';

const emptyForm = {
  tagNumber: '',
  item: '',
  model: '',
  serialNumber: '',
  status: '',
  problem: '',
};

const fields = [
  { key: 'tagNumber', label: 'Tag Number' },
  { key: 'item', label: 'Item' },
  { key: 'model', label: 'Model' },
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'status', label: 'Status' },
];

export function ServerRoomFormModal({ onClose, onSubmit, initialValues }) {
  const [form, setForm] = useState(() => ({ ...emptyForm, ...initialValues }));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err);
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={initialValues ? 'Edit Server Room Item' : 'Add Server Room Item'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map(({ key, label }) => (
            <label key={key} className="text-sm text-gray-600 dark:text-gray-400">
              {label}
              <input
                type="text"
                value={form[key]}
                onChange={handleChange(key)}
                autoFocus={key === 'tagNumber'}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
          ))}
        </div>

        <label className="text-sm text-gray-600 dark:text-gray-400">
          Problem
          <textarea
            value={form.problem}
            onChange={handleChange('problem')}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600">
            {error.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </Modal>
  );
}
