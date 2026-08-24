import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from './Modal';
import { DataTable } from './DataTable';
import { Tag } from './Tag';
import { useResourceImport } from '../hooks/useResourceImport';

export function ImportModal({ title, importUrl, previewColumns, onClose, onImported }) {
  // previewColumns is optional: when the resource's fields aren't known ahead
  // of time (custom modules, whose columns are detected from the uploaded
  // file itself), the preview table falls back to whatever `preview.columns`
  // the server detected and returned.
  const { isUploading, isImporting, preview, error, uploadFile, confirmImport } = useResourceImport(importUrl);
  const [excluded, setExcluded] = useState(() => new Set());
  const [confirmError, setConfirmError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setConfirmError(null);
    const result = await uploadFile(file);
    if (result) {
      setExcluded(new Set(result.rows.filter((row) => row.duplicate).map((row) => row.rowNumber)));
    }
  }

  function toggleRow(rowNumber) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  }

  async function handleConfirm() {
    setConfirmError(null);
    try {
      const selectedRows = preview.rows.filter((row) => !excluded.has(row.rowNumber)).map((row) => row.data);
      const extra = preview.columns ? { columns: preview.columns } : {};
      const result = await confirmImport(selectedRows, extra);
      onImported(result.insertedCount);
    } catch (err) {
      setConfirmError(err);
    }
  }

  const selectedCount = preview ? preview.rows.filter((row) => !excluded.has(row.rowNumber)).length : 0;

  const resolvedPreviewColumns =
    previewColumns ||
    (preview?.columns || []).map((col) => ({
      key: col.key,
      header: col.label,
      render: (row) => row.data[col.key] || '—',
    }));

  const columns = [
    {
      key: 'include',
      header: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={!excluded.has(row.rowNumber)}
          onChange={() => toggleRow(row.rowNumber)}
          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
        />
      ),
    },
    { key: 'rowNumber', header: 'Row' },
    ...resolvedPreviewColumns,
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.status === 'ok' ? (
          <Tag color="green">OK</Tag>
        ) : (
          <Tag color="amber" title={row.issues.join('; ')}>
            Review
          </Tag>
        ),
    },
  ];

  return (
    <Modal isOpen onClose={onClose} title={title} size="lg">
      <div className="flex flex-col gap-4">
        {!preview && (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 hover:border-red-400 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-500 dark:hover:text-red-400">
            <Upload size={24} />
            {isUploading ? 'Reading file...' : 'Click to choose an .xlsx or .xls file'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}

        {error && (
          <p className="text-sm text-red-600">
            Could not read the file: {error.response?.data?.message || error.message}
          </p>
        )}

        {preview && (
          <>
            <div className="sticky top-0 z-10 -mx-5 -mt-4 flex flex-col gap-2 border-b border-gray-100 bg-white/95 px-5 pb-3 pt-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {preview.summary.total} rows found — {preview.summary.ok} ready, {preview.summary.warnings}{' '}
                  flagged for review
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedCount} selected</span>
              </div>

              {confirmError && (
                <p className="text-sm text-red-600">
                  Import failed: {confirmError.response?.data?.message || confirmError.message}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isImporting || selectedCount === 0}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {isImporting ? 'Importing...' : `Import ${selectedCount} row${selectedCount === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>

            {preview.unmappedHeaders.length > 0 && (
              <p className="text-xs text-gray-500">
                Columns not recognized and skipped: {preview.unmappedHeaders.join(', ')}
              </p>
            )}

            <DataTable columns={columns} rows={preview.rows} />
          </>
        )}
      </div>
    </Modal>
  );
}
