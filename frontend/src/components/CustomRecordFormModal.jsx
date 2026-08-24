import { useState } from 'react';
import { Modal } from './Modal';

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';

/**
 * Renders one field per the module's current `columns` — the form itself is
 * fully dynamic. `columnTypes` (from `lib/detectColumnType.js`, inferred from
 * existing data) picks a nicer input per field: a Yes/No select for boolean
 * columns, a number input for numeric ones, email/url input types for those
 * — but every value is still saved as a plain string, so nothing about the
 * underlying data changes because of this.
 */
export function CustomRecordFormModal({ columns, columnTypes, onClose, onSubmit, initialValues }) {
  const [form, setForm] = useState(() => {
    const base = {};
    for (const col of columns) base[col.key] = initialValues?.[col.key] ?? '';
    return base;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
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

  function renderField(col, index) {
    const type = columnTypes?.[col.key] || 'text';
    if (type === 'boolean') {
      return (
        <select value={form[col.key] ?? ''} onChange={handleChange(col.key)} autoFocus={index === 0} className={INPUT_CLASS}>
          <option value="">—</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }
    const inputType = type === 'number' ? 'number' : type === 'email' ? 'email' : type === 'url' ? 'url' : 'text';
    return (
      <input
        type={inputType}
        value={form[col.key] ?? ''}
        onChange={handleChange(col.key)}
        autoFocus={index === 0}
        className={INPUT_CLASS}
      />
    );
  }

  return (
    <Modal isOpen onClose={onClose} title={initialValues ? 'Edit Record' : 'Add Record'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {columns.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This module has no columns yet — use "Add Column" first, or import a spreadsheet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {columns.map((col, index) => (
              <label key={col.key} className="text-sm text-gray-600 dark:text-gray-400">
                {col.label}
                {renderField(col, index)}
              </label>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || columns.length === 0}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </Modal>
  );
}
