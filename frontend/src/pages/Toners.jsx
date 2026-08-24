import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, FileUp, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { MetricCard } from '../components/MetricCard';
import { TonerInwardFormModal } from '../components/TonerInwardFormModal';
import { TonerOutwardFormModal } from '../components/TonerOutwardFormModal';
import { ImportModal } from '../components/ImportModal';
import { DetailModal } from '../components/DetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { useTonerInward } from '../hooks/useTonerInward';
import { useTonerOutward } from '../hooks/useTonerOutward';
import { computeTonerStock } from '../lib/tonerStock';
import { useToast } from '../hooks/useToast';
import { exportToCsv } from '../lib/exportCsv';
import { parseLooseDate } from '../lib/parseLooseDate';

const TREND_WINDOW_DAYS = 30;

// Net change within the trend window, computed only from entries whose date
// actually parses — never a fabricated or estimated figure. Returns null
// when no entry of this toner type has a parseable date, so the UI can omit
// the badge instead of implying "no recent activity" when it just couldn't tell.
function computeRecentTrend(tonerType, inwardRows, outwardRows) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TREND_WINDOW_DAYS);

  let hasParseableDate = false;
  let net = 0;

  for (const row of inwardRows) {
    if ((row.tonerType || '').trim().toUpperCase() !== tonerType.toUpperCase()) continue;
    const date = parseLooseDate(row.dateOfOrder);
    if (!date) continue;
    hasParseableDate = true;
    if (date >= cutoff) net += row.inwardQty || 0;
  }

  for (const row of outwardRows) {
    if ((row.tonerType || '').trim().toUpperCase() !== tonerType.toUpperCase()) continue;
    const date = parseLooseDate(row.dateDelivered || row.dateOfOrder);
    if (!date) continue;
    hasParseableDate = true;
    if (date >= cutoff) {
      const match = String(row.qtyDelivered || '').match(/^\s*(\d+(\.\d+)?)/);
      net -= match ? Number(match[1]) : 0;
    }
  }

  if (!hasParseableDate) return null;
  return net;
}

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

const INWARD_EXPORT_FIELDS = [
  { key: 'dateOfOrder', label: 'Date of Order' },
  { key: 'tonerType', label: 'Toner Type' },
  { key: 'inwardQty', label: 'Inward Qty' },
  { key: 'balance', label: 'Balance' },
  { key: 'note', label: 'Note' },
];

const OUTWARD_EXPORT_FIELDS = [
  { key: 'dateOfOrder', label: 'Date of Order' },
  { key: 'tonerType', label: 'Toner Type' },
  { key: 'deliveredTo', label: 'Delivered To' },
  { key: 'qtyDelivered', label: 'Qty Delivered/Used' },
  { key: 'dateDelivered', label: 'Date Delivered' },
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
  const [selectedInwardIds, setSelectedInwardIds] = useState(() => new Set());
  const [selectedOutwardIds, setSelectedOutwardIds] = useState(() => new Set());
  const [bulkDeleteInwardOpen, setBulkDeleteInwardOpen] = useState(false);
  const [bulkDeleteOutwardOpen, setBulkDeleteOutwardOpen] = useState(false);
  const [highlightedInwardId, setHighlightedInwardId] = useState(null);
  const [highlightedOutwardId, setHighlightedOutwardId] = useState(null);

  function flashInward(id) {
    setHighlightedInwardId(id);
    setTimeout(() => setHighlightedInwardId((current) => (current === id ? null : current)), 1800);
  }
  function flashOutward(id) {
    setHighlightedOutwardId(id);
    setTimeout(() => setHighlightedOutwardId((current) => (current === id ? null : current)), 1800);
  }

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

  async function confirmBulkDeleteInward() {
    const ids = [...selectedInwardIds];
    await Promise.all(ids.map((id) => deleteInward(id)));
    toast.success(`${ids.length} inward entr${ids.length === 1 ? 'y' : 'ies'} removed.`);
    setSelectedInwardIds(new Set());
    setBulkDeleteInwardOpen(false);
  }
  async function confirmBulkDeleteOutward() {
    const ids = [...selectedOutwardIds];
    await Promise.all(ids.map((id) => deleteOutward(id)));
    toast.success(`${ids.length} outward entr${ids.length === 1 ? 'y' : 'ies'} removed.`);
    setSelectedOutwardIds(new Set());
    setBulkDeleteOutwardOpen(false);
  }

  function toggleInwardRow(id) {
    setSelectedInwardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleInwardAll(visibleIds) {
    setSelectedInwardIds((prev) => {
      const allSelected = visibleIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(visibleIds);
    });
  }
  function toggleOutwardRow(id) {
    setSelectedOutwardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleOutwardAll(visibleIds) {
    setSelectedOutwardIds((prev) => {
      const allSelected = visibleIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(visibleIds);
    });
  }

  async function handleInwardSubmit(data) {
    if (inwardForm.mode === 'edit') {
      await editInward(inwardForm.row._id, data);
      flashInward(inwardForm.row._id);
    } else {
      const created = await addInward(data);
      if (created?._id) flashInward(created._id);
    }
  }
  async function handleOutwardSubmit(data) {
    if (outwardForm.mode === 'edit') {
      await editOutward(outwardForm.row._id, data);
      flashOutward(outwardForm.row._id);
    } else {
      const created = await addOutward(data);
      if (created?._id) flashOutward(created._id);
    }
  }

  function handleImported(insertedCount, direction) {
    setImportMode(null);
    if (direction === 'inward') refetchInward();
    else refetchOutward();
    toast.success(`Imported ${insertedCount} ${direction} entr${insertedCount === 1 ? 'y' : 'ies'}.`);
  }

  function handleExportInward() {
    exportToCsv('toner-inward', filteredInward, INWARD_EXPORT_FIELDS);
    toast.success(`Exported ${filteredInward.length} inward entr${filteredInward.length === 1 ? 'y' : 'ies'}.`);
  }
  function handleExportOutward() {
    exportToCsv('toner-outward', filteredOutward, OUTWARD_EXPORT_FIELDS);
    toast.success(`Exported ${filteredOutward.length} outward entr${filteredOutward.length === 1 ? 'y' : 'ies'}.`);
  }

  const inwardColumns = [
    { key: 'dateOfOrder', header: 'Date of Order', sortable: true, render: (row) => row.dateOfOrder || '—' },
    {
      key: 'tonerType',
      header: 'Toner Type',
      sortable: true,
      render: (row) => <span className="font-medium text-gray-900">{row.tonerType || '—'}</span>,
    },
    { key: 'inwardQty', header: 'Inward Qty', sortable: true, render: (row) => row.inwardQty ?? '—' },
    { key: 'balance', header: 'Balance', render: (row) => (row.balance != null ? row.balance : '—') },
    { key: 'note', header: 'Note', mobileFullWidth: true, render: (row) => row.note || '—' },
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
    { key: 'dateOfOrder', header: 'Date of Order', sortable: true, render: (row) => row.dateOfOrder || '—' },
    {
      key: 'tonerType',
      header: 'Toner Type',
      sortable: true,
      render: (row) => <span className="font-medium text-gray-900">{row.tonerType || '—'}</span>,
    },
    { key: 'deliveredTo', header: 'Delivered To', sortable: true, mobileFullWidth: true, render: (row) => row.deliveredTo || '—' },
    { key: 'qtyDelivered', header: 'Qty', render: (row) => row.qtyDelivered || '—' },
    { key: 'dateDelivered', header: 'Date Delivered', sortable: true, render: (row) => row.dateDelivered || '—' },
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
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">Toner Stock</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Inward (received) and outward (delivered/used) printer toner tracking.</p>
      </div>

      {stock.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stock.map((entry) => {
            const net = computeRecentTrend(entry.tonerType, inward, outward);
            const trend =
              net === null
                ? undefined
                : {
                    direction: net > 0 ? 'up' : net < 0 ? 'down' : 'flat',
                    label: `${net > 0 ? '+' : ''}${net} (${TREND_WINDOW_DAYS}d)`,
                  };
            return (
              <MetricCard
                key={entry.tonerType}
                label={entry.tonerType}
                value={entry.currentStock}
                icon={Printer}
                tone={entry.isLow ? 'warning' : 'default'}
                trend={trend}
              />
            );
          })}
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search toner type, location, date..." />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Inward Log</h2>
          <div className="no-print flex flex-wrap gap-2">
            <button
              onClick={handleExportInward}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => setImportMode('inward')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
        <div className="no-print sticky top-14 z-20 -mx-4 bg-gray-50 px-4 py-1 sm:-mx-6 sm:px-6 dark:bg-gray-950">
          <BulkActionsBar
            count={selectedInwardIds.size}
            onClear={() => setSelectedInwardIds(new Set())}
            actions={[{ label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => setBulkDeleteInwardOpen(true) }]}
          />
        </div>
        {inwardError && <p className="text-sm text-red-600 dark:text-red-400">Could not load inward log: {inwardError.message}</p>}
        {!inwardError && (
          <DataTable
            columns={inwardColumns}
            rows={filteredInward}
            isLoading={inwardLoading}
            emptyMessage="No inward toner entries yet."
            emptyIcon={Printer}
            onRowClick={setDetailInward}
            selectable
            selectedIds={selectedInwardIds}
            onToggleRow={toggleInwardRow}
            onToggleAll={toggleInwardAll}
            highlightedId={highlightedInwardId}
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Outward Log</h2>
          <div className="no-print flex flex-wrap gap-2">
            <button
              onClick={handleExportOutward}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => setImportMode('outward')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
        <div className="no-print sticky top-14 z-20 -mx-4 bg-gray-50 px-4 py-1 sm:-mx-6 sm:px-6 dark:bg-gray-950">
          <BulkActionsBar
            count={selectedOutwardIds.size}
            onClear={() => setSelectedOutwardIds(new Set())}
            actions={[{ label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => setBulkDeleteOutwardOpen(true) }]}
          />
        </div>
        {outwardError && <p className="text-sm text-red-600 dark:text-red-400">Could not load outward log: {outwardError.message}</p>}
        {!outwardError && (
          <DataTable
            columns={outwardColumns}
            rows={filteredOutward}
            isLoading={outwardLoading}
            emptyMessage="No outward toner entries yet."
            emptyIcon={Printer}
            onRowClick={setDetailOutward}
            selectable
            selectedIds={selectedOutwardIds}
            onToggleRow={toggleOutwardRow}
            onToggleAll={toggleOutwardAll}
            highlightedId={highlightedOutwardId}
          />
        )}
      </div>

      {inwardForm && (
        <TonerInwardFormModal
          onClose={() => setInwardForm(null)}
          initialValues={inwardForm.mode === 'edit' ? inwardForm.row : null}
          onSubmit={handleInwardSubmit}
        />
      )}

      {outwardForm && (
        <TonerOutwardFormModal
          onClose={() => setOutwardForm(null)}
          initialValues={outwardForm.mode === 'edit' ? outwardForm.row : null}
          onSubmit={handleOutwardSubmit}
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
      {bulkDeleteInwardOpen && (
        <ConfirmDialog
          title="Remove selected inward entries?"
          message={`Remove ${selectedInwardIds.size} selected inward entr${selectedInwardIds.size === 1 ? 'y' : 'ies'}? This can't be undone.`}
          onConfirm={confirmBulkDeleteInward}
          onCancel={() => setBulkDeleteInwardOpen(false)}
        />
      )}
      {bulkDeleteOutwardOpen && (
        <ConfirmDialog
          title="Remove selected outward entries?"
          message={`Remove ${selectedOutwardIds.size} selected outward entr${selectedOutwardIds.size === 1 ? 'y' : 'ies'}? This can't be undone.`}
          onConfirm={confirmBulkDeleteOutward}
          onCancel={() => setBulkDeleteOutwardOpen(false)}
        />
      )}
    </div>
  );
}
