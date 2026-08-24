import { useState } from 'react';
import { Modal } from './Modal';

const emptyMain = {
  allotted: '',
  brand: '',
  type: '',
  capacity: '',
  serialNumber: '',
  date: '',
  information: 'Data File',
  note: '',
};

const emptyDetail = {
  userName: '',
  brand: '',
  type: '',
  capacity: '',
  serialNumber: '',
  dateAlloted: '',
};

const mainFields = [
  { key: 'allotted', label: 'HDD Allotted (Assigned To)' },
  { key: 'brand', label: 'Brand' },
  { key: 'type', label: 'Type' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'date', label: 'Date' },
  { key: 'information', label: 'Information' },
];

const detailFields = [
  { key: 'userName', label: 'User Name' },
  { key: 'brand', label: 'Brand' },
  { key: 'type', label: 'Type' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'dateAlloted', label: 'Date Allotted' },
];

/**
 * Handles both "Add HDD" (mode='add') and "Edit HDD" (mode='edit') for the
 * Main record and/or the detail sheet's identity fields. Drive/entry content
 * is edited separately, inline on the detail page — this modal never touches
 * `drives`.
 */
export function HddFormModal({ mode, main, detail, onClose, onSubmit }) {
  const showMainFields = mode === 'add' || main !== null;
  const [mainForm, setMainForm] = useState(() => ({ ...emptyMain, ...main }));
  const [detailForm, setDetailForm] = useState(() => ({ ...emptyDetail, ...detail }));
  const [includeDetail, setIncludeDetail] = useState(Boolean(detail));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleMainChange(field) {
    return (e) => setMainForm((prev) => ({ ...prev, [field]: e.target.value }));
  }
  function handleDetailChange(field) {
    return (e) => setDetailForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({
        main: showMainFields ? mainForm : null,
        detail: includeDetail ? detailForm : null,
      });
      onClose();
    } catch (err) {
      setError(err);
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={mode === 'add' ? 'Add HDD' : 'Edit HDD'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {showMainFields && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mainFields.map(({ key, label }) => (
              <label key={key} className="text-sm text-gray-600 dark:text-gray-400">
                {label}
                <input
                  type="text"
                  value={mainForm[key]}
                  onChange={handleMainChange(key)}
                  autoFocus={key === 'allotted'}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>
            ))}
          </div>
        )}

        {showMainFields && (
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Note
            <textarea
              value={mainForm.note}
              onChange={handleMainChange('note')}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        )}

        {!detail && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={includeDetail}
              onChange={(e) => setIncludeDetail(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
            />
            Also record a detailed drive sheet for this HDD
          </label>
        )}

        {includeDetail && (
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Detail Sheet Identity</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {detailFields.map(({ key, label }) => (
                <label key={key} className="text-sm text-gray-600 dark:text-gray-400">
                  {label}
                  <input
                    type="text"
                    value={detailForm[key]}
                    onChange={handleDetailChange(key)}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </label>
              ))}
            </div>
            {!detail && (
              <p className="text-xs text-gray-400">
                Drive contents (C:/D:/E: and their entries) can be added once this HDD is saved, from its detail
                page.
              </p>
            )}
          </div>
        )}

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
