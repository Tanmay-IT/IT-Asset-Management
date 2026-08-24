import { useState } from 'react';
import { Modal } from './Modal';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  branch: '',
  department: '',
  workingLocation: '',
  type: 'Laptop',
  modelMake: '',
  serialNo: '',
  computerName: '',
  operatingSystem: '',
  edition: '',
  catoInstalled: false,
  antivirus: false,
  sophosMdr: false,
  status: 'Active',
};

const textFields = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email Address', type: 'email' },
  { key: 'country', label: 'Country' },
  { key: 'branch', label: 'Branch' },
  { key: 'department', label: 'Department' },
  { key: 'workingLocation', label: 'Working Location' },
  { key: 'modelMake', label: 'Model/Make' },
  { key: 'serialNo', label: 'Serial No' },
  { key: 'computerName', label: 'Computer Name' },
  { key: 'operatingSystem', label: 'Operating System' },
  { key: 'edition', label: 'Edition' },
];

const checkboxFields = [
  { key: 'catoInstalled', label: 'CATO Installed' },
  { key: 'antivirus', label: 'Antivirus' },
  { key: 'sophosMdr', label: 'Sophos MDR' },
];

export function ComputerFormModal({ onClose, onSubmit, initialValues }) {
  const [form, setForm] = useState(() => ({ ...emptyForm, ...initialValues }));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleCheckbox(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.checked }));
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
    <Modal isOpen onClose={onClose} title={initialValues ? 'Edit Computer' : 'Add Computer'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {textFields.map(({ key, label, type = 'text' }) => (
            <label key={key} className="text-sm text-gray-600 dark:text-gray-400">
              {label}
              <input
                type={type}
                value={form[key]}
                onChange={handleChange(key)}
                autoFocus={key === 'firstName'}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
          ))}

          <label className="text-sm text-gray-600 dark:text-gray-400">
            Desktop/Laptop
            <select
              value={form.type}
              onChange={handleChange('type')}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
            </select>
          </label>

          <label className="text-sm text-gray-600 dark:text-gray-400">
            Status
            <select
              value={form.status}
              onChange={handleChange('status')}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="Active">Active</option>
              <option value="In Repair">In Repair</option>
              <option value="Retired">Retired</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          {checkboxFields.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={handleCheckbox(key)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
              />
              {label}
            </label>
          ))}
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
