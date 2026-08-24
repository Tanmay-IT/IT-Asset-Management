import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../lib/api';
import { useCustomModules } from '../hooks/useCustomModules';

/**
 * Creates a brand-new user-defined module (Sidebar entry + table) with no
 * code change: name it, optionally attach a spreadsheet right away — its
 * headers become the columns and every row is imported immediately. Skip
 * the file and the module starts empty; columns can be added later (the
 * page's own "+ Add Column", or importing a spreadsheet at any time).
 */
export function AddModuleModal({ onClose, onCreated }) {
  const { createModule } = useCustomModules();
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const module = await createModule(name.trim());

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const { data: preview } = await api.post(`/api/custom-modules/${module.slug}/import/preview`, formData);
        if (preview.rows.length > 0) {
          await api.post(`/api/custom-modules/${module.slug}/import/confirm`, {
            rows: preview.rows.map((row) => row.data),
            columns: preview.columns,
          });
        }
      }

      onCreated(module);
    } catch (err) {
      setError(err);
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Add Module">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creates a new item in the sidebar with its own table — no need to ask for a code change. Give it a name,
          and optionally attach a spreadsheet now to seed its columns and data straight away.
        </p>

        <label className="text-sm text-gray-600 dark:text-gray-400">
          Module Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Licenses, Vendors, SIM Cards..."
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 hover:border-red-400 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-500 dark:hover:text-red-400">
          <Upload size={22} />
          {file ? file.name : 'Optional: attach an Excel file to seed columns & data'}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || !name.trim()}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isSaving ? 'Creating...' : 'Create Module'}
        </button>
      </form>
    </Modal>
  );
}
