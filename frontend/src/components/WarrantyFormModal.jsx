import { useState } from 'react';
import { Modal } from './Modal';

const emptyForm = {
  srNo: '',
  brand: '',
  model: '',
  serialNo: '',
  invoiceNo: '',
  purchaseDate: '',
  warrantyDate: '',
  status: '',
};

const textFields = [
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'serialNo', label: 'Serial No' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'purchaseDate', label: 'Purchase Date', placeholder: 'dd-mm-yyyy' },
  { key: 'warrantyDate', label: 'Warranty Date', placeholder: 'dd-mm-yyyy' },
  { key: 'status', label: 'Status' },
];

export function WarrantyFormModal({ onClose, onSubmit, initialValues }) {
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
        srNo: form.srNo === '' ? null : Number(form.srNo),
      });
      onClose();
    } catch (err) {
      setError(err);
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={initialValues ? 'Edit Warranty Record' : 'Add Warranty Record'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Sr No
            <input
              type="number"
              value={form.srNo}
              onChange={handleChange('srNo')}
              autoFocus
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          {textFields.map(({ key, label, placeholder }) => (
            <label key={key} className="text-sm text-gray-600 dark:text-gray-400">
              {label}
              <input
                type="text"
                value={form[key]}
                onChange={handleChange(key)}
                placeholder={placeholder}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
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
