import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, FileUp, Pencil, Plus, Server, Trash2 } from 'lucide-react';
import { StatusInlineSelect } from '../components/StatusInlineSelect';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { PageHeader } from '../components/PageHeader';
import { ServerRoomFormModal } from '../components/ServerRoomFormModal';
import { ImportModal } from '../components/ImportModal';
import { DetailModal } from '../components/DetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { useServerRoomItems } from '../hooks/useServerRoomItems';
import { getServerRoomStatusColor } from '../lib/serverRoomStatus';
import { useToast } from '../hooks/useToast';
import { exportToCsv } from '../lib/exportCsv';

const importPreviewColumns = [
  { key: 'tagNumber', header: 'Tag Number', render: (row) => row.data.tagNumber || '—' },
  { key: 'item', header: 'Item', render: (row) => row.data.item || '—' },
  { key: 'serialNumber', header: 'Serial Number', render: (row) => row.data.serialNumber || '—' },
  { key: 'rawStatus', header: 'Status', render: (row) => row.data.status || '—' },
];

const EXPORT_FIELDS = [
  { key: 'tagNumber', label: 'Tag Number' },
  { key: 'item', label: 'Item' },
  { key: 'model', label: 'Model' },
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'status', label: 'Status' },
  { key: 'problem', label: 'Problem' },
];

export function ServerRoom() {
  const { items, isLoading, error, addItem, editItem, deleteItem, refetch } = useServerRoomItems();
  const location = useLocation();
  const toast = useToast();
  const [search, setSearch] = useState(() => location.state?.initialQuery || '');
  const [statusFilter, setStatusFilter] = useState('All');
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

  const statusFilters = useMemo(
    () => ['All', ...new Set(items.map((item) => item.status).filter(Boolean))],
    [items]
  );

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const haystack = [item.tagNumber, item.item, item.model, item.serialNumber, item.problem]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return matchesStatus && haystack.includes(search.toLowerCase());
      }),
    [items, search, statusFilter]
  );

  async function confirmDelete() {
    await deleteItem(deleteTarget._id);
    toast.success(`${deleteTarget.item || 'Item'} removed.`);
    setDeleteTarget(null);
  }

  async function confirmBulkDelete() {
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => deleteItem(id)));
    toast.success(`${ids.length} item${ids.length === 1 ? '' : 's'} removed.`);
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
      await editItem(formState.item._id, data);
      flashHighlight(formState.item._id);
    } else {
      const created = await addItem(data);
      if (created?._id) flashHighlight(created._id);
    }
  }

  function handleImported(insertedCount) {
    setIsImportOpen(false);
    refetch();
    toast.success(`Imported ${insertedCount} item${insertedCount === 1 ? '' : 's'}.`);
  }

  function handleExport() {
    exportToCsv('server-room-items', filtered, EXPORT_FIELDS);
    toast.success(`Exported ${filtered.length} item${filtered.length === 1 ? '' : 's'}.`);
  }

  const columns = [
    { key: 'tagNumber', header: 'Tag Number', sortable: true, render: (row) => row.tagNumber || '—' },
    {
      key: 'item',
      header: 'Item',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.item || '—'}</p>
          <p className="text-xs text-gray-400">{row.model}</p>
        </div>
      ),
    },
    { key: 'serialNumber', header: 'Serial Number', sortable: true, render: (row) => row.serialNumber || '—' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) =>
        row.status ? (
          <StatusInlineSelect
            value={row.status}
            options={statusFilters.filter((s) => s !== 'All')}
            colorFor={getServerRoomStatusColor}
            onChange={async (next) => {
              await editItem(row._id, { ...row, status: next });
              toast.success(`Status set to "${next}".`);
            }}
          />
        ) : (
          '—'
        ),
    },
    {
      key: 'problem',
      header: 'Problem',
      mobileFullWidth: true,
      render: (row) => <span className="text-gray-600">{row.problem || '—'}</span>,
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
            aria-label={`Edit ${row.item}`}
            className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label={`Delete ${row.item}`}
            className="rounded-md border border-gray-200 p-1.5 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Server}
        title="Server Room"
        subtitle="Racked equipment & bins"
        accent="slate"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Search item, tag, serial..." />
            <div className="flex flex-wrap gap-2">
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
                <Plus size={16} /> Add Item
              </button>
            </div>
          </>
        }
      />

      {statusFilters.length > 1 && (
        <div className="no-print flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Status</span>
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      <div className="no-print sticky top-14 z-20 -mx-4 bg-gray-50 px-4 py-1 sm:-mx-6 sm:px-6 dark:bg-gray-950">
        <BulkActionsBar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          actions={[{ label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => setBulkDeleteOpen(true) }]}
        />
      </div>

      {error && <p className="text-sm text-red-600">Could not load server room items: {error.message}</p>}
      {!error && (
        <DataTable
          columns={columns}
          rows={filtered}
          isLoading={isLoading}
          emptyMessage="No server room items yet. Add one manually or import an Excel sheet."
          emptyIcon={Server}
          accent="slate"
          onRowClick={setDetailItem}
          selectable
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          highlightedId={highlightedId}
        />
      )}

      {formState && (
        <ServerRoomFormModal
          onClose={() => setFormState(null)}
          initialValues={formState.mode === 'edit' ? formState.item : null}
          onSubmit={handleFormSubmit}
        />
      )}

      {isImportOpen && (
        <ImportModal
          title="Import Server Room Items from Excel"
          importUrl="/api/server-room-items/import"
          previewColumns={importPreviewColumns}
          onClose={() => setIsImportOpen(false)}
          onImported={handleImported}
        />
      )}

      {detailItem && (
        <DetailModal
          icon={Server}
          accent="slate"
          name={detailItem.item || 'Server Room Item'}
          subtitle={detailItem.model}
          badge={detailItem.status ? { label: detailItem.status, color: getServerRoomStatusColor(detailItem.status) } : null}
          onClose={() => setDetailItem(null)}
          onEdit={() => {
            setFormState({ mode: 'edit', item: detailItem });
            setDetailItem(null);
          }}
          sections={[
            {
              fields: [
                { label: 'Tag Number', value: detailItem.tagNumber },
                { label: 'Item', value: detailItem.item },
                { label: 'Model', value: detailItem.model },
                { label: 'Serial Number', value: detailItem.serialNumber, mono: true },
                { label: 'Status', value: detailItem.status },
                { label: 'Problem', value: detailItem.problem, fullWidth: true },
              ],
            },
          ]}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove item?"
          message={`Remove ${deleteTarget.item || 'this item'}? This can't be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {bulkDeleteOpen && (
        <ConfirmDialog
          title="Remove selected items?"
          message={`Remove ${selectedIds.size} selected item${selectedIds.size === 1 ? '' : 's'}? This can't be undone.`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
        />
      )}
    </div>
  );
}
