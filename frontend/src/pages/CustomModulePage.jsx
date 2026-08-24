import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Columns3, Download, ExternalLink, FileUp, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { ImportModal } from '../components/ImportModal';
import { DetailModal } from '../components/DetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { CustomRecordFormModal } from '../components/CustomRecordFormModal';
import { AddColumnModal } from '../components/AddColumnModal';
import { Tag } from '../components/Tag';
import { useCustomModuleRecords } from '../hooks/useCustomModuleRecords';
import { useCustomModules } from '../hooks/useCustomModules';
import { useToast } from '../hooks/useToast';
import { exportToCsv } from '../lib/exportCsv';
import { detectColumnTypes, formatBoolean } from '../lib/detectColumnType';

function formatValue(rawValue, type) {
  const value = rawValue ?? '';
  if (!value) return '—';
  if (type === 'boolean') return <Tag color={formatBoolean(value) ? 'green' : 'gray'}>{formatBoolean(value) ? 'Yes' : 'No'}</Tag>;
  if (type === 'email') {
    return (
      <a href={`mailto:${value}`} onClick={(e) => e.stopPropagation()} className="text-red-600 hover:underline dark:text-red-400">
        {value}
      </a>
    );
  }
  if (type === 'url') {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-red-600 hover:underline dark:text-red-400"
      >
        {value} <ExternalLink size={11} />
      </a>
    );
  }
  return value;
}

export function CustomModulePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { module, records, isLoading, error, addRecord, editRecord, removeRecord, addColumn, refetch } =
    useCustomModuleRecords(slug);
  const { deleteModule } = useCustomModules();

  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);

  const columnTypes = useMemo(
    () => (module ? detectColumnTypes(module.columns, records) : {}),
    [module, records]
  );

  function flashHighlight(id) {
    setHighlightedId(id);
    setTimeout(() => setHighlightedId((current) => (current === id ? null : current)), 1800);
  }

  const filtered = useMemo(
    () =>
      records.filter((record) =>
        Object.values(record.data || {}).join(' ').toLowerCase().includes(search.toLowerCase())
      ),
    [records, search]
  );

  async function confirmDelete() {
    await removeRecord(deleteTarget._id);
    toast.success('Record removed.');
    setDeleteTarget(null);
  }

  async function confirmBulkDelete() {
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => removeRecord(id)));
    toast.success(`${ids.length} record${ids.length === 1 ? '' : 's'} removed.`);
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
  }

  async function confirmDeleteModule() {
    await deleteModule(slug);
    toast.success(`"${module.name}" module removed.`);
    navigate('/');
  }

  function toggleRow(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(visibleIds) {
    setSelectedIds((prev) => {
      const allSelected = visibleIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(visibleIds);
    });
  }

  async function handleFormSubmit(data) {
    if (formState.mode === 'edit') {
      const updated = await editRecord(formState.record._id, data);
      flashHighlight(formState.record._id);
      if (detailItem?._id === formState.record._id) setDetailItem(updated);
    } else {
      const created = await addRecord(data);
      if (created?._id) flashHighlight(created._id);
    }
  }

  async function handleAddColumn(label) {
    await addColumn(label);
    toast.success(`Column "${label}" added.`);
  }

  function handleImported(insertedCount) {
    setIsImportOpen(false);
    refetch();
    toast.success(`Imported ${insertedCount} record${insertedCount === 1 ? '' : 's'}.`);
  }

  function handleExport() {
    if (!module) return;
    exportToCsv(
      module.slug,
      filtered,
      module.columns.map((col) => ({ key: col.key, label: col.label, value: (row) => row.data[col.key] || '' }))
    );
    toast.success(`Exported ${filtered.length} record${filtered.length === 1 ? '' : 's'}.`);
  }

  if (isLoading && !module) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading module...</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">Could not load this module: {error.message}</p>;
  }
  if (!module) return null;

  const columns = [
    ...module.columns.map((col) => ({
      key: col.key,
      header: col.label,
      sortable: true,
      sortValue: (row) => row.data[col.key] || '',
      render: (row) => formatValue(row.data[col.key], columnTypes[col.key]),
    })),
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFormState({ mode: 'edit', record: row });
            }}
            aria-label="Edit record"
            className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label="Delete record"
            className="rounded-md border border-gray-200 p-1.5 text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const importPreviewColumns = module.columns.map((col) => ({
    key: col.key,
    header: col.label,
    render: (row) => row.data[col.key] || '—',
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">{module.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">A custom module you created — fully self-service.</p>
        </div>
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search this module..." />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAddColumnOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Columns3 size={16} /> Add Column
            </button>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <FileUp size={16} /> Import Excel
            </button>
            <button
              onClick={() => setFormState({ mode: 'add' })}
              disabled={module.columns.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Plus size={16} /> Add Record
            </button>
            <button
              onClick={() => setDeleteModuleOpen(true)}
              aria-label="Delete this module"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/40"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="no-print sticky top-14 z-20 -mx-4 bg-gray-50 px-4 py-1 sm:-mx-6 sm:px-6 dark:bg-gray-950">
        <BulkActionsBar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          actions={[{ label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => setBulkDeleteOpen(true) }]}
        />
      </div>

      {module.columns.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <Layers size={28} className="text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">This module has no columns yet</p>
          <p className="max-w-sm text-sm text-gray-400 dark:text-gray-500">
            Import a spreadsheet (its headers become the columns) or add one manually.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          isLoading={isLoading}
          emptyMessage="No records yet. Add one manually or import an Excel sheet."
          emptyIcon={Layers}
          onRowClick={setDetailItem}
          selectable
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          highlightedId={highlightedId}
        />
      )}

      {formState && (
        <CustomRecordFormModal
          columns={module.columns}
          columnTypes={columnTypes}
          onClose={() => setFormState(null)}
          initialValues={formState.mode === 'edit' ? formState.record.data : null}
          onSubmit={handleFormSubmit}
        />
      )}

      {isAddColumnOpen && <AddColumnModal onClose={() => setIsAddColumnOpen(false)} onSubmit={handleAddColumn} />}

      {isImportOpen && (
        <ImportModal
          title={`Import into "${module.name}" from Excel`}
          importUrl={`/api/custom-modules/${module.slug}/import`}
          previewColumns={module.columns.length > 0 ? importPreviewColumns : undefined}
          onClose={() => setIsImportOpen(false)}
          onImported={handleImported}
        />
      )}

      {detailItem && (
        <DetailModal
          icon={Layers}
          name={module.columns[0] ? detailItem.data[module.columns[0].key] || 'Record' : 'Record'}
          subtitle={module.columns[1] ? detailItem.data[module.columns[1].key] : undefined}
          onClose={() => setDetailItem(null)}
          onEdit={() => {
            setFormState({ mode: 'edit', record: detailItem });
            setDetailItem(null);
          }}
          sections={[
            {
              fields: module.columns.map((col) => ({
                label: col.label,
                value: formatValue(detailItem.data[col.key], columnTypes[col.key]),
              })),
            },
          ]}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove record?"
          message="Remove this record? This can't be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {bulkDeleteOpen && (
        <ConfirmDialog
          title="Remove selected records?"
          message={`Remove ${selectedIds.size} selected record${selectedIds.size === 1 ? '' : 's'}? This can't be undone.`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
        />
      )}

      {deleteModuleOpen && (
        <ConfirmDialog
          title="Delete this module?"
          message={`Delete "${module.name}" and all ${records.length} of its records? This can't be undone.`}
          onConfirm={confirmDeleteModule}
          onCancel={() => setDeleteModuleOpen(false)}
        />
      )}
    </div>
  );
}
