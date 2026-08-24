import { useState } from 'react';
import { Modal } from './Modal';

const emptyForm = { dateOfOrder: '', tonerType: '', inwardQty: '', balance: '', note: '' };

export function TonerInwardFormModal({ onClose, onSubmit, initialValues }) {
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
      await onSubmit({
        ...form,
        inwardQty: form.inwardQty === '' ? null : Number(form.inwardQty),
        balance: form.balance === '' ? null : Number(form.balance),
      });
      onClose();
    } catch (err) {
      setError(err);
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={initialValues ? 'Edit Inward Entry' : 'Log Inward Toner'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Date of Order
            <input
              type="text"
              value={form.dateOfOrder}
              onChange={handleChange('dateOfOrder')}
              placeholder="dd-mm-yyyy"
              autoFocus
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Toner Type
            <input
              type="text"
              value={form.tonerType}
              onChange={handleChange('tonerType')}
              placeholder="e.g. 12A"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Inward Qty
            <input
              type="number"
              value={form.inwardQty}
              onChange={handleChange('inwardQty')}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Balance (optional)
            <input
              type="number"
              value={form.balance}
              onChange={handleChange('balance')}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        </div>

        <label className="text-sm text-gray-600 dark:text-gray-400">
          Note (optional)
          <input
            type="text"
            value={form.note}
            onChange={handleChange('note')}
            placeholder="e.g. FOR HR"
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
