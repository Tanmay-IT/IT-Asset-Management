import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileUp, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { MetricCard } from '../components/MetricCard';
import { TonerInwardFormModal } from '../components/TonerInwardFormModal';
import { TonerOutwardFormModal } from '../components/TonerOutwardFormModal';
import { ImportModal } from '../components/ImportModal';
import { DetailModal } from '../components/DetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useTonerInward } from '../hooks/useTonerInward';
import { useTonerOutward } from '../hooks/useTonerOutward';
import { computeTonerStock } from '../lib/tonerStock';
import { useToast } from '../hooks/useToast';

const inwardImportColumns = [
  { key: 'dateOfOrder', header: 'Date', render: (row) => row.data.dateOfOrder || '—' },
  { key: 'tonerType', header: 'Toner Type', render: (row) => row.data.tonerType || '—' },
  { key: 'inwardQty', header: 'Qty', render: (row) => row.data.inwardQty ?? '—' },
];

const outwardImportColumns = [
  { key: 'dateOfOrder', header: 'Date', render: (row) => row.data.dateOfOrder || '—' },
  { key: 'tonerType', header: 'Toner Type', render: (row) => row.data.tonerType || '—' },
  { key: 'deliveredTo', header: 'Delivered To', render: (row) => row.data.deliveredTo || '—' },
];

export function Toners() {
  const {
    inward,
    isLoading: inwardLoading,
    error: inwardError,
    addInward,
    editInward,
    deleteInward,
    refetch: refetchInward,
  } = useTonerInward();
  const {
    outward,
    isLoading: outwardLoading,
    error: outwardError,
    addOutward,
    editOutward,
    deleteOutward,
    refetch: refetchOutward,
  } = useTonerOutward();

  const location = useLocation();
  const toast = useToast();
  const [search, setSearch] = useState(() => location.state?.initialQuery || '');
  const [inwardForm, setInwardForm] = useState(() => (location.state?.openAdd === 'inward' ? { mode: 'add' } : null));
  const [outwardForm, setOutwardForm] = useState(() =>
    location.state?.openAdd === 'outward' ? { mode: 'add' } : null
  );
  const [importMode, setImportMode] = useState(null); // 'inward' | 'outward' | null
  const [detailInward, setDetailInward] = useState(null);
  const [detailOutward, setDetailOutward] = useState(null);
  const [deleteInwardTarget, setDeleteInwardTarget] = useState(null);
  const [deleteOutwardTarget, setDeleteOutwardTarget] = useState(null);

  const stock = useMemo(() => computeTonerStock(inward, outward), [inward, outward]);

  const filteredInward = useMemo(
    () =>
      inward.filter((row) =>
        [row.dateOfOrder, row.tonerType, row.note]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [inward, search]
  );
  const filteredOutward = useMemo(
    () =>
      outward.filter((row) =>
        [row.dateOfOrder, row.tonerType, row.deliveredTo, row.dateDelivered]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [outward, search]
  );

  async function confirmDeleteInward() {
    await deleteInward(deleteInwardTarget._id);
    toast.success(`${deleteInwardTarget.tonerType || 'Inward entry'} removed.`);
    setDeleteInwardTarget(null);
  }
  async function confirmDeleteOutward() {
    await deleteOutward(deleteOutwardTarget._id);
    toast.success(`${deleteOutwardTarget.tonerType || 'Outward entry'} removed.`);
    setDeleteOutwardTarget(null);
  }

  function handleImported(insertedCount, direction) {
    setImportMode(null);
    if (direction === 'inward') refetchInward();
    else refetchOutward();
    toast.success(`Imported ${insertedCount} ${direction} entr${insertedCount === 1 ? 'y' : 'ies'}.`);
  }

  const inwardColumns = [
    { key: 'dateOfOrder', header: 'Date of Order', render: (row) => row.dateOfOrder || '—' },
    {
      key: 'tonerType',
      header: 'Toner Type',
      render: (row) => <span className="font-medium text-gray-900">{row.tonerType || '—'}</span>,
    },
    { key: 'inwardQty', header: 'Inward Qty', render: (row) => row.inwardQty ?? '—' },
    { key: 'balance', header: 'Balance', render: (row) => (row.balance != null ? row.balance : '—') },
    { key: 'note', header: 'Note', render: (row) => row.note || '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInwardForm({ mode: 'edit', row });
            }}
            className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
            aria-label="Edit inward entry"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteInwardTarget(row);
            }}
            className="rounded-md border border-gray-200 p-1.5 text-red-500 hover:bg-red-50"
            aria-label="Delete inward entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const outwardColumns = [
    { key: 'dateOfOrder', header: 'Date of Order', render: (row) => row.dateOfOrder || '—' },
    {
      key: 'tonerType',
      header: 'Toner Type',
      render: (row) => <span className="font-medium text-gray-900">{row.tonerType || '—'}</span>,
    },
    { key: 'deliveredTo', header: 'Delivered To', render: (row) => row.deliveredTo || '—' },
    { key: 'qtyDelivered', header: 'Qty', render: (row) => row.qtyDelivered || '—' },
    { key: 'dateDelivered', header: 'Date Delivered', render: (row) => row.dateDelivered || '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOutwardForm({ mode: 'edit', row });
            }}
            className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
            aria-label="Edit outward entry"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOutwardTarget(row);
            }}
            className="rounded-md border border-gray-200 p-1.5 text-red-500 hover:bg-red-50"
            aria-label="Delete outward entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Toner Stock</h1>
        <p className="text-sm text-gray-500">Inward (received) and outward (delivered/used) printer toner tracking.</p>
      </div>

      {stock.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stock.map((entry) => (
            <MetricCard
              key={entry.tonerType}
              label={entry.tonerType}
              value={entry.currentStock}
              icon={Printer}
              tone={entry.isLow ? 'warning' : 'default'}
            />
          ))}
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search toner type, location, date..." />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Inward Log</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setImportMode('inward')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <FileUp size={14} /> Import Excel
            </button>
            <button
              onClick={() => setInwardForm({ mode: 'add' })}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
            >
              <Plus size={14} /> Add Inward
            </button>
          </div>
        </div>
        {inwardLoading && <p className="text-sm text-gray-500">Loading inward log...</p>}
        {inwardError && <p className="text-sm text-red-600">Could not load inward log: {inwardError.message}</p>}
        {!inwardLoading && !inwardError && (
          <DataTable
            columns={inwardColumns}
            rows={filteredInward}
            emptyMessage="No inward toner entries yet."
            onRowClick={setDetailInward}
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Outward Log</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setImportMode('outward')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <FileUp size={14} /> Import Excel
            </button>
            <button
              onClick={() => setOutwardForm({ mode: 'add' })}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
            >
              <Plus size={14} /> Add Outward
            </button>
          </div>
        </div>
        {outwardLoading && <p className="text-sm text-gray-500">Loading outward log...</p>}
        {outwardError && <p className="text-sm text-red-600">Could not load outward log: {outwardError.message}</p>}
        {!outwardLoading && !outwardError && (
          <DataTable
            columns={outwardColumns}
            rows={filteredOutward}
            emptyMessage="No outward toner entries yet."
            onRowClick={setDetailOutward}
          />
        )}
      </div>

      {inwardForm && (
        <TonerInwardFormModal
          onClose={() => setInwardForm(null)}
          initialValues={inwardForm.mode === 'edit' ? inwardForm.row : null}
          onSubmit={(data) => (inwardForm.mode === 'edit' ? editInward(inwardForm.row._id, data) : addInward(data))}
        />
      )}

      {outwardForm && (
        <TonerOutwardFormModal
          onClose={() => setOutwardForm(null)}
          initialValues={outwardForm.mode === 'edit' ? outwardForm.row : null}
          onSubmit={(data) => (outwardForm.mode === 'edit' ? editOutward(outwardForm.row._id, data) : addOutward(data))}
        />
      )}

      {importMode === 'inward' && (
        <ImportModal
          title="Import Inward Toner Log from Excel"
          importUrl="/api/toners/inward/import"
          previewColumns={inwardImportColumns}
          onClose={() => setImportMode(null)}
          onImported={(count) => handleImported(count, 'inward')}
        />
      )}
      {importMode === 'outward' && (
        <ImportModal
          title="Import Outward Toner Log from Excel"
          importUrl="/api/toners/outward/import"
          previewColumns={outwardImportColumns}
          onClose={() => setImportMode(null)}
          onImported={(count) => handleImported(count, 'outward')}
        />
      )}

      {detailInward && (
        <DetailModal
          icon={Printer}
          name={detailInward.tonerType || 'Inward Entry'}
          subtitle={detailInward.dateOfOrder}
          onClose={() => setDetailInward(null)}
          onEdit={() => {
            setInwardForm({ mode: 'edit', row: detailInward });
            setDetailInward(null);
          }}
          sections={[
            {
              fields: [
                { label: 'Date of Order', value: detailInward.dateOfOrder },
                { label: 'Toner Type', value: detailInward.tonerType },
                { label: 'Inward Qty', value: detailInward.inwardQty },
                { label: 'Balance', value: detailInward.balance },
                { label: 'Note', value: detailInward.note, fullWidth: true },
              ],
            },
          ]}
        />
      )}

      {detailOutward && (
        <DetailModal
          icon={Printer}
          name={detailOutward.tonerType || 'Outward Entry'}
          subtitle={detailOutward.deliveredTo}
          onClose={() => setDetailOutward(null)}
          onEdit={() => {
            setOutwardForm({ mode: 'edit', row: detailOutward });
            setDetailOutward(null);
          }}
          sections={[
            {
              fields: [
                { label: 'Date of Order', value: detailOutward.dateOfOrder },
                { label: 'Toner Type', value: detailOutward.tonerType },
                { label: 'Delivered To', value: detailOutward.deliveredTo, fullWidth: true },
                { label: 'Qty Delivered / Used', value: detailOutward.qtyDelivered },
                { label: 'Date Delivered', value: detailOutward.dateDelivered },
              ],
            },
          ]}
        />
      )}

      {deleteInwardTarget && (
        <ConfirmDialog
          title="Remove inward entry?"
          message={`Remove this inward entry (${deleteInwardTarget.tonerType || 'toner'})? This can't be undone.`}
          onConfirm={confirmDeleteInward}
          onCancel={() => setDeleteInwardTarget(null)}
        />
      )}
      {deleteOutwardTarget && (
        <ConfirmDialog
          title="Remove outward entry?"
          message={`Remove this outward entry (${deleteOutwardTarget.tonerType || 'toner'})? This can't be undone.`}
          onConfirm={confirmDeleteOutward}
          onCancel={() => setDeleteOutwardTarget(null)}
        />
      )}
    </div>
  );
}
