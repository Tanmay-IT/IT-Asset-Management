import { useState } from 'react';
import { Modal } from './Modal';

const emptyForm = { dateOfOrder: '', tonerType: '', deliveredTo: '', qtyDelivered: '', dateDelivered: '' };

export function TonerOutwardFormModal({ onClose, onSubmit, initialValues }) {
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
    <Modal isOpen onClose={onClose} title={initialValues ? 'Edit Outward Entry' : 'Log Outward Toner'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-gray-600">
            Date of Order
            <input
              type="text"
              value={form.dateOfOrder}
              onChange={handleChange('dateOfOrder')}
              placeholder="dd-mm-yyyy"
              autoFocus
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </label>
          <label className="text-sm text-gray-600">
            Toner Type
            <input
              type="text"
              value={form.tonerType}
              onChange={handleChange('tonerType')}
              placeholder="e.g. 12A"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </label>
          <label className="text-sm text-gray-600 sm:col-span-2">
            Delivered To / Location
            <input
              type="text"
              value={form.deliveredTo}
              onChange={handleChange('deliveredTo')}
              placeholder="e.g. Snehal Joshi (JNPT)"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </label>
          <label className="text-sm text-gray-600">
            Qty Delivered / Used
            <input
              type="text"
              value={form.qtyDelivered}
              onChange={handleChange('qtyDelivered')}
              placeholder="e.g. 2, or 1 used in HO printer"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </label>
          <label className="text-sm text-gray-600">
            Date Delivered / Used
            <input
              type="text"
              value={form.dateDelivered}
              onChange={handleChange('dateDelivered')}
              placeholder="dd-mm-yyyy"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </label>
        </div>

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
