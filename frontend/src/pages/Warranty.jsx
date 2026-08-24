import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, FileUp, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { Tag } from '../components/Tag';
import { WarrantyFormModal } from '../components/WarrantyFormModal';
import { ImportModal } from '../components/ImportModal';
import { DetailModal } from '../components/DetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { useWarranty } from '../hooks/useWarranty';
import { useToast } from '../hooks/useToast';
import { exportToCsv } from '../lib/exportCsv';
import { getWarrantyExpiry } from '../lib/warrantyExpiry';

const importPreviewColumns = [
  { key: 'srNo', header: 'Sr No', render: (row) => row.data.srNo ?? '—' },
  { key: 'brand', header: 'Brand', render: (row) => row.data.brand || '—' },
  { key: 'model', header: 'Model', render: (row) => row.data.model || '—' },
  { key: 'serialNo', header: 'Serial No', render: (row) => row.data.serialNo || '—' },
  { key: 'warrantyDate', header: 'Warranty Date', render: (row) => row.data.warrantyDate || '—' },
];

const EXPORT_FIELDS = [
  { key: 'srNo', label: 'Sr No' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'serialNo', label: 'Serial No' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'purchaseDate', label: 'Purchase Date' },
  { key: 'warrantyDate', label: 'Warranty Date' },
  { key: 'status', label: 'Status' },
];

export function Warranty() {
  const { warranties, isLoading, error, addWarranty, editWarranty, deleteWarranty, refetch } = useWarranty();
  const location = useLocation();
  const toast = useToast();
  const [search, setSearch] = useState(() => location.state?.initialQuery || '');
  const [formState, setFormState] = useState(() => (location.state?.openAdd ? { mode: 'add' } : null));
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);

  function flashHighlight(id) {
    setHighlightedId(id);
    setTimeout(() => setHighlightedId((current) => (current === id ? null : current)), 1800);
  }

  const filtered = useMemo(
    () =>
      warranties.filter((row) => {
        const haystack = [row.brand, row.model, row.serialNo, row.invoiceNo, row.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [warranties, search]
  );

  async function confirmDelete() {
    await deleteWarranty(deleteTarget._id);
    toast.success(`${deleteTarget.model || deleteTarget.serialNo || 'Record'} removed.`);
    setDeleteTarget(null);
  }

  async function confirmBulkDelete() {
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => deleteWarranty(id)));
    toast.success(`${ids.length} record${ids.length === 1 ? '' : 's'} removed.`);
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
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
      await editWarranty(formState.item._id, data);
      flashHighlight(formState.item._id);
    } else {
      const created = await addWarranty(data);
      if (created?._id) flashHighlight(created._id);
    }
  }

  function handleImported(insertedCount) {
    setIsImportOpen(false);
    refetch();
    toast.success(`Imported ${insertedCount} record${insertedCount === 1 ? '' : 's'}.`);
  }

  function handleExport() {
    exportToCsv('warranty', filtered, EXPORT_FIELDS);
    toast.success(`Exported ${filtered.length} record${filtered.length === 1 ? '' : 's'}.`);
  }

  const columns = [
    { key: 'srNo', header: 'Sr No', sortable: true, render: (row) => row.srNo ?? '—' },
    {
      key: 'brand',
      header: 'Brand',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{row.brand || '—'}</p>
          <p className="text-xs text-gray-400">{row.model}</p>
        </div>
      ),
    },
    { key: 'serialNo', header: 'Serial No', sortable: true, render: (row) => row.serialNo || '—' },
    { key: 'invoiceNo', header: 'Invoice No', render: (row) => row.invoiceNo || '—' },
    { key: 'purchaseDate', header: 'Purchase Date', sortable: true, render: (row) => row.purchaseDate || '—' },
    {
      key: 'warrantyDate',
      header: 'Warranty Date',
      sortable: true,
      render: (row) => {
        const expiry = getWarrantyExpiry(row.warrantyDate);
        return (
          <div className="flex items-center gap-1.5">
            <span>{row.warrantyDate || '—'}</span>
            {expiry && <Tag color={expiry.color}>{expiry.label}</Tag>}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (row.status ? <Tag color="gray">{row.status}</Tag> : '—'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFormState({ mode: 'edit', item: row });
            }}
            aria-label={`Edit ${row.model || row.serialNo}`}
            className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label={`Delete ${row.model || row.serialNo}`}
            className="rounded-md border border-gray-200 p-1.5 text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">Warranty</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search brand, model, serial, invoice..." />
          <div className="no-print flex flex-wrap gap-2">
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
              className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Plus size={16} /> Add Warranty
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

      {error && <p className="text-sm text-red-600 dark:text-red-400">Could not load warranty records: {error.message}</p>}
      {!error && (
        <DataTable
          columns={columns}
          rows={filtered}
          isLoading={isLoading}
          emptyMessage="No warranty records yet. Add one manually or import an Excel sheet."
          emptyIcon={ShieldCheck}
          onRowClick={setDetailItem}
          selectable
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          highlightedId={highlightedId}
        />
      )}

      {formState && (
        <WarrantyFormModal
          onClose={() => setFormState(null)}
          initialValues={formState.mode === 'edit' ? formState.item : null}
          onSubmit={handleFormSubmit}
        />
      )}

      {isImportOpen && (
        <ImportModal
          title="Import Warranty Records from Excel"
          importUrl="/api/warranty/import"
          previewColumns={importPreviewColumns}
          onClose={() => setIsImportOpen(false)}
          onImported={handleImported}
        />
      )}

      {detailItem && (
        <DetailModal
          icon={ShieldCheck}
          name={detailItem.model || detailItem.serialNo || 'Warranty Record'}
          subtitle={detailItem.brand}
          badge={detailItem.status ? { label: detailItem.status, color: 'gray' } : null}
          onClose={() => setDetailItem(null)}
          onEdit={() => {
            setFormState({ mode: 'edit', item: detailItem });
            setDetailItem(null);
          }}
          sections={[
            {
              fields: [
                { label: 'Sr No', value: detailItem.srNo },
                { label: 'Brand', value: detailItem.brand },
                { label: 'Model', value: detailItem.model },
                { label: 'Serial No', value: detailItem.serialNo, mono: true },
                { label: 'Invoice No', value: detailItem.invoiceNo },
                { label: 'Purchase Date', value: detailItem.purchaseDate },
                { label: 'Warranty Date', value: detailItem.warrantyDate },
                { label: 'Status', value: detailItem.status },
              ],
            },
          ]}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove warranty record?"
          message={`Remove ${deleteTarget.model || deleteTarget.serialNo || 'this record'}? This can't be undone.`}
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
    </div>
  );
}
