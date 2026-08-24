import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, FileUp, Monitor, Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { Tag } from '../components/Tag';
import { ComputerFormModal } from '../components/ComputerFormModal';
import { ImportModal } from '../components/ImportModal';
import { DetailModal } from '../components/DetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ColumnVisibilityMenu } from '../components/ColumnVisibilityMenu';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { useComputers } from '../hooks/useComputers';
import { useToast } from '../hooks/useToast';
import { exportToCsv } from '../lib/exportCsv';

const typeFilters = ['All', 'Laptop', 'Desktop'];
const statusFilters = ['All', 'Active', 'In Repair', 'Retired'];

const statusColor = {
  Active: 'green',
  'In Repair': 'amber',
  Retired: 'gray',
};

const importPreviewColumns = [
  { key: 'computerName', header: 'Computer Name', render: (row) => row.data.computerName || '—' },
  { key: 'serialNo', header: 'Serial No', render: (row) => row.data.serialNo || '—' },
  {
    key: 'user',
    header: 'User',
    render: (row) => [row.data.firstName, row.data.lastName].filter(Boolean).join(' ') || '—',
  },
  { key: 'type', header: 'Type', render: (row) => row.data.type || '—' },
];

const EXPORT_FIELDS = [
  { key: 'computerName', label: 'Computer Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
  { key: 'branch', label: 'Branch' },
  { key: 'type', label: 'Type' },
  { key: 'modelMake', label: 'Model/Make' },
  { key: 'serialNo', label: 'Serial No' },
  { key: 'operatingSystem', label: 'Operating System' },
  { key: 'edition', label: 'Edition' },
  { key: 'catoInstalled', label: 'CATO Installed', value: (row) => (row.catoInstalled ? 'Yes' : 'No') },
  { key: 'antivirus', label: 'Antivirus', value: (row) => (row.antivirus ? 'Yes' : 'No') },
  { key: 'sophosMdr', label: 'Sophos MDR', value: (row) => (row.sophosMdr ? 'Yes' : 'No') },
  { key: 'status', label: 'Status' },
];

const TOGGLEABLE_COLUMNS = [
  { key: 'department', label: 'Department' },
  { key: 'branch', label: 'Branch' },
  { key: 'type', label: 'Type' },
  { key: 'os', label: 'OS' },
  { key: 'security', label: 'Security' },
];

function securityTag(enabled) {
  return <Tag color={enabled ? 'green' : 'gray'}>{enabled ? 'Yes' : 'No'}</Tag>;
}

export function Computers() {
  const { computers, isLoading, error, addComputer, editComputer, deleteComputer, refetch } = useComputers();
  const location = useLocation();
  const toast = useToast();
  const [search, setSearch] = useState(() => location.state?.initialQuery || '');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formState, setFormState] = useState(() => (location.state?.openAdd ? { mode: 'add' } : null));
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [detailComputer, setDetailComputer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState(() => new Set());
  const [highlightedId, setHighlightedId] = useState(null);

  function flashHighlight(id) {
    setHighlightedId(id);
    setTimeout(() => setHighlightedId((current) => (current === id ? null : current)), 1800);
  }

  const filtered = useMemo(
    () =>
      computers.filter((computer) => {
        const matchesType = typeFilter === 'All' || computer.type === typeFilter;
        const matchesStatus = statusFilter === 'All' || computer.status === statusFilter;
        const haystack = [
          computer.computerName,
          computer.firstName,
          computer.lastName,
          computer.email,
          computer.serialNo,
          computer.department,
          computer.branch,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return matchesType && matchesStatus && haystack.includes(search.toLowerCase());
      }),
    [computers, search, typeFilter, statusFilter]
  );

  async function confirmDelete() {
    await deleteComputer(deleteTarget._id);
    toast.success(`${deleteTarget.computerName || 'Computer'} removed.`);
    setDeleteTarget(null);
  }

  async function confirmBulkDelete() {
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => deleteComputer(id)));
    toast.success(`${ids.length} computer${ids.length === 1 ? '' : 's'} removed.`);
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
      await editComputer(formState.computer._id, data);
      flashHighlight(formState.computer._id);
    } else {
      const created = await addComputer(data);
      if (created?._id) flashHighlight(created._id);
    }
  }

  function handleImported(insertedCount) {
    setIsImportOpen(false);
    refetch();
    toast.success(`Imported ${insertedCount} computer${insertedCount === 1 ? '' : 's'}.`);
  }

  function handleExport() {
    exportToCsv('computers', filtered, EXPORT_FIELDS);
    toast.success(`Exported ${filtered.length} computer${filtered.length === 1 ? '' : 's'}.`);
  }

  const allColumns = [
    {
      key: 'computerName',
      header: 'Device',
      sortable: true,
      sortValue: (row) => row.computerName || '',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.computerName || '—'}</p>
          <p className="text-xs text-gray-400">{row.serialNo}</p>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'User',
      sortable: true,
      sortValue: (row) => [row.firstName, row.lastName].filter(Boolean).join(' '),
      render: (row) => (
        <div>
          <p>{[row.firstName, row.lastName].filter(Boolean).join(' ') || 'Unassigned'}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'branch', header: 'Branch', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    {
      key: 'os',
      header: 'OS',
      sortable: true,
      sortValue: (row) => row.operatingSystem || '',
      render: (row) => [row.operatingSystem, row.edition].filter(Boolean).join(' ') || '—',
    },
    {
      key: 'security',
      header: 'Security',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Tag color={row.catoInstalled ? 'green' : 'gray'}>CATO</Tag>
          <Tag color={row.antivirus ? 'green' : 'gray'}>AV</Tag>
          <Tag color={row.sophosMdr ? 'green' : 'gray'}>Sophos</Tag>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <Tag color={statusColor[row.status]}>{row.status}</Tag>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFormState({ mode: 'edit', computer: row });
            }}
            aria-label={`Edit ${row.computerName}`}
            className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label={`Delete ${row.computerName}`}
            className="rounded-md border border-gray-200 p-1.5 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const columns = allColumns.filter((col) => !hiddenColumns.has(col.key));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Computers</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search device, user, serial..." />
          <div className="flex flex-wrap gap-2">
            <ColumnVisibilityMenu columns={TOGGLEABLE_COLUMNS} hiddenKeys={hiddenColumns} onChange={setHiddenColumns} />
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <FileUp size={16} /> Import Excel
            </button>
            <button
              onClick={() => setFormState({ mode: 'add' })}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Plus size={16} /> Add Computer
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Type</span>
          {typeFilters.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === type ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
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
      </div>

      <BulkActionsBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        actions={[{ label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => setBulkDeleteOpen(true) }]}
      />

      {error && <p className="text-sm text-red-600">Could not load computers: {error.message}</p>}
      {!error && (
        <DataTable
          columns={columns}
          rows={filtered}
          isLoading={isLoading}
          emptyMessage="No computers yet. Add one manually or import an Excel sheet."
          onRowClick={setDetailComputer}
          selectable
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          highlightedId={highlightedId}
        />
      )}

      {formState && (
        <ComputerFormModal
          onClose={() => setFormState(null)}
          initialValues={formState.mode === 'edit' ? formState.computer : null}
          onSubmit={handleFormSubmit}
        />
      )}

      {isImportOpen && (
        <ImportModal
          title="Import Computers from Excel"
          importUrl="/api/computers/import"
          previewColumns={importPreviewColumns}
          onClose={() => setIsImportOpen(false)}
          onImported={handleImported}
        />
      )}

      {detailComputer && (
        <DetailModal
          icon={Monitor}
          name={detailComputer.computerName || 'Computer'}
          subtitle={[detailComputer.firstName, detailComputer.lastName].filter(Boolean).join(' ') || 'Unassigned'}
          badge={
            detailComputer.status ? { label: detailComputer.status, color: statusColor[detailComputer.status] } : null
          }
          onClose={() => setDetailComputer(null)}
          onEdit={() => {
            setFormState({ mode: 'edit', computer: detailComputer });
            setDetailComputer(null);
          }}
          sections={[
            {
              title: 'Assignment',
              fields: [
                { label: 'Assigned To', value: [detailComputer.firstName, detailComputer.lastName].filter(Boolean).join(' ') },
                { label: 'Email', value: detailComputer.email },
                { label: 'Department', value: detailComputer.department },
                { label: 'Branch', value: detailComputer.branch },
                { label: 'Country', value: detailComputer.country },
                { label: 'Working Location', value: detailComputer.workingLocation },
              ],
            },
            {
              title: 'Hardware',
              fields: [
                { label: 'Type', value: detailComputer.type },
                { label: 'Model / Make', value: detailComputer.modelMake },
                { label: 'Serial No', value: detailComputer.serialNo, mono: true },
                { label: 'Operating System', value: detailComputer.operatingSystem },
                { label: 'Edition', value: detailComputer.edition },
              ],
            },
            {
              title: 'Security',
              fields: [
                { label: 'CATO Installed', value: securityTag(detailComputer.catoInstalled) },
                { label: 'Antivirus', value: securityTag(detailComputer.antivirus) },
                { label: 'Sophos MDR', value: securityTag(detailComputer.sophosMdr) },
              ],
            },
          ]}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove computer?"
          message={`Remove ${deleteTarget.computerName || 'this computer'}? This can't be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {bulkDeleteOpen && (
        <ConfirmDialog
          title="Remove selected computers?"
          message={`Remove ${selectedIds.size} selected computer${selectedIds.size === 1 ? '' : 's'}? This can't be undone.`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
        />
      )}
    </div>
  );
}
