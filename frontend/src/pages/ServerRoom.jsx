import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileUp, Pencil, Plus, Server, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { Tag } from '../components/Tag';
import { ServerRoomFormModal } from '../components/ServerRoomFormModal';
import { ImportModal } from '../components/ImportModal';
import { DetailModal } from '../components/DetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useServerRoomItems } from '../hooks/useServerRoomItems';
import { getServerRoomStatusColor } from '../lib/serverRoomStatus';
import { useToast } from '../hooks/useToast';

const importPreviewColumns = [
  { key: 'tagNumber', header: 'Tag Number', render: (row) => row.data.tagNumber || '—' },
  { key: 'item', header: 'Item', render: (row) => row.data.item || '—' },
  { key: 'serialNumber', header: 'Serial Number', render: (row) => row.data.serialNumber || '—' },
  { key: 'rawStatus', header: 'Status', render: (row) => row.data.status || '—' },
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

  function handleImported(insertedCount) {
    setIsImportOpen(false);
    refetch();
    toast.success(`Imported ${insertedCount} item${insertedCount === 1 ? '' : 's'}.`);
  }

  const columns = [
    { key: 'tagNumber', header: 'Tag Number', render: (row) => row.tagNumber || '—' },
    {
      key: 'item',
      header: 'Item',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.item || '—'}</p>
          <p className="text-xs text-gray-400">{row.model}</p>
        </div>
      ),
    },
    { key: 'serialNumber', header: 'Serial Number', render: (row) => row.serialNumber || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (row.status ? <Tag color={getServerRoomStatusColor(row.status)}>{row.status}</Tag> : '—'),
    },
    {
      key: 'problem',
      header: 'Problem',
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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Server Room</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search item, tag, serial..." />
          <div className="flex gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <FileUp size={16} /> Import Excel
            </button>
            <button
              onClick={() => setFormState({ mode: 'add' })}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>
      </div>

      {statusFilters.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Status</span>
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {isLoading && <p className="text-sm text-gray-500">Loading server room items...</p>}
      {error && <p className="text-sm text-red-600">Could not load server room items: {error.message}</p>}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          rows={filtered}
          emptyMessage="No server room items yet. Add one manually or import an Excel sheet."
          onRowClick={setDetailItem}
        />
      )}

      {formState && (
        <ServerRoomFormModal
          onClose={() => setFormState(null)}
          initialValues={formState.mode === 'edit' ? formState.item : null}
          onSubmit={(data) => (formState.mode === 'edit' ? editItem(formState.item._id, data) : addItem(data))}
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
    </div>
  );
}
