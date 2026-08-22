import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HardDrive, FileCheck2, Archive, AlertTriangle, Database, StickyNote, Plus } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { FilterPillGroup } from '../components/FilterPillGroup';
import { Tag } from '../components/Tag';
import { CopyButton } from '../components/CopyButton';
import { HddFormModal } from '../components/HddFormModal';
import { useHddDashboard } from '../hooks/useHddDashboard';
import { useHddInventory } from '../hooks/useHddInventory';
import { useHddSearch } from '../hooks/useHddSearch';
import { useHddMutations } from '../hooks/useHddMutations';
import { getHddStatus, getRecordId } from '../lib/hddStatus';
import {
  buildBrandOptions,
  buildCapacityOptions,
  matchesBrand,
  matchesCapacity,
  matchesDataAvailability,
  matchesVerification,
} from '../lib/hddFilters';

const DATA_FILTERS = ['All', 'Has Detailed Data', 'Inventory Only'];
const VERIFICATION_FILTERS = ['All', 'No Issues', 'Needs Verification'];

const emptyFilters = { brand: '', capacity: '', data: 'All', verification: 'All' };

export function HddInventory() {
  const { stats } = useHddDashboard();
  const { entities, isLoading, error } = useHddInventory();
  const { createMain, createDetail } = useHddMutations();
  const location = useLocation();
  const [query, setQuery] = useState(() => location.state?.initialQuery || '');
  const [filters, setFilters] = useState(emptyFilters);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const navigate = useNavigate();

  const { results: searchResults, isLoading: isSearching } = useHddSearch(query);
  const isSearchMode = query.trim().length > 0;

  const brandOptions = useMemo(() => buildBrandOptions(entities), [entities]);
  const capacityOptions = useMemo(() => buildCapacityOptions(entities), [entities]);
  const hasActiveFilters =
    filters.brand || filters.capacity || filters.data !== 'All' || filters.verification !== 'All';

  const filtered = useMemo(
    () =>
      entities.filter(
        (entity) =>
          matchesBrand(entity, filters.brand) &&
          matchesCapacity(entity, filters.capacity) &&
          matchesDataAvailability(entity, filters.data) &&
          matchesVerification(entity, filters.verification)
      ),
    [entities, filters]
  );

  function goToRecord(entity) {
    const record = getRecordId(entity);
    if (record) navigate(`/hdd/record/${record.kind}/${record.id}`);
  }

  async function handleAddSubmit({ main, detail }) {
    const createdMain = await createMain(main);
    if (detail) await createDetail(createdMain._id, detail);
    navigate(`/hdd/record/main/${createdMain._id}`);
  }

  const columns = [
    { key: 'srNo', header: 'Sr. No.', render: (row) => row.main?.srNo ?? '—' },
    {
      key: 'allotted',
      header: 'HDD Allotted',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-900">{row.main?.allotted || row.detail?.userName || '—'}</span>
          {row.main?.note?.trim() && (
            <span title={row.main.note} className="text-gray-300">
              <StickyNote size={13} />
            </span>
          )}
        </div>
      ),
    },
    { key: 'brand', header: 'Brand', render: (row) => row.main?.brand || row.detail?.brand || '—' },
    { key: 'type', header: 'Type', render: (row) => row.main?.type || row.detail?.type || '—' },
    { key: 'capacity', header: 'Capacity', render: (row) => row.main?.capacity || row.detail?.capacity || '—' },
    {
      key: 'serialNumber',
      header: 'Serial Number',
      render: (row) => {
        const serial = row.main?.serialNumber || row.detail?.serialNumber;
        return serial ? (
          <div className="flex items-center gap-1.5">
            <span className="break-all font-mono text-xs">{serial}</span>
            <CopyButton value={serial} copiedLabel="Copied" />
          </div>
        ) : (
          <span className="text-xs text-gray-400">Not available</span>
        );
      },
    },
    { key: 'date', header: 'Date', render: (row) => row.main?.date || row.detail?.dateAlloted || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const status = getHddStatus(row);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={() => goToRecord(row)}
          className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">HDD Inventory</h1>
          <p className="text-sm text-gray-500">
            Centralized inventory and archive of company HDDs, assignments and stored data.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex w-fit items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <Plus size={16} /> Add HDD
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Total HDDs" value={stats.totalHddRecords} icon={HardDrive} tone="default" />
          <MetricCard label="Detailed HDDs" value={stats.detailedRecords} icon={FileCheck2} tone="default" />
          <MetricCard label="Backup Drives" value={stats.backupDrives} icon={Archive} tone="default" />
          <MetricCard
            label="Records Needing Verification"
            value={stats.recordsRequiringVerification}
            icon={AlertTriangle}
            tone="warning"
          />
          <MetricCard
            label="Total Listed Capacity"
            value={`${(stats.totalListedCapacityGb / 1024).toFixed(2)} TB`}
            icon={Database}
            tone="default"
          />
        </div>
      )}

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search name, serial number, email, PST, folder..."
      />

      {!isSearchMode && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-400">
            Brand
            <select
              value={filters.brand}
              onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            >
              <option value="">All Brands</option>
              {brandOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-400">
            Capacity
            <select
              value={filters.capacity}
              onChange={(e) => setFilters((prev) => ({ ...prev, capacity: e.target.value }))}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            >
              <option value="">All Capacities</option>
              {capacityOptions.map((capacity) => (
                <option key={capacity} value={capacity}>
                  {capacity}
                </option>
              ))}
            </select>
          </label>

          <FilterPillGroup
            label="Data"
            value={filters.data}
            options={DATA_FILTERS}
            onChange={(value) => setFilters((prev) => ({ ...prev, data: value }))}
          />
          <FilterPillGroup
            label="Verification"
            value={filters.verification}
            options={VERIFICATION_FILTERS}
            onChange={(value) => setFilters((prev) => ({ ...prev, verification: value }))}
          />

          {hasActiveFilters && (
            <button
              onClick={() => setFilters(emptyFilters)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {isSearchMode ? (
        <SearchResults results={searchResults} isLoading={isSearching} query={query} onSelect={goToRecord} />
      ) : (
        <>
          {isLoading && <p className="text-sm text-gray-500">Loading HDD inventory...</p>}
          {error && <p className="text-sm text-red-600">Could not load HDD inventory: {error.message}</p>}
          {!isLoading && !error && (
            <DataTable columns={columns} rows={filtered} emptyMessage="No HDD records match this filter." />
          )}
        </>
      )}

      {isAddOpen && (
        <HddFormModal mode="add" main={{}} detail={null} onClose={() => setIsAddOpen(false)} onSubmit={handleAddSubmit} />
      )}
    </div>
  );
}

function SearchResults({ results, isLoading, query, onSelect }) {
  if (isLoading) return <p className="text-sm text-gray-500">Searching...</p>;
  if (results.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        No HDD found matching "{query}".
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => {
        const status = getHddStatus(result);
        const title = result.main?.allotted || result.detail?.userName || 'Unnamed HDD';
        const subtitle = [result.main?.brand || result.detail?.brand, result.main?.capacity || result.detail?.capacity]
          .filter(Boolean)
          .join(' • ');

        return (
          <button
            key={`${result.main?._id || ''}-${result.detail?._id || ''}`}
            onClick={() => onSelect(result)}
            className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-red-300"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{title}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                {result.serialNumber && (
                  <p className="break-all font-mono text-xs text-gray-400">{result.serialNumber}</p>
                )}
              </div>
              <Tag color={status.color}>{status.label}</Tag>
            </div>

            <div className="flex flex-col gap-1 border-t border-gray-100 pt-2 text-xs">
              <p className="font-medium text-gray-400">Matched in:</p>
              {result.matches.slice(0, 4).map((match, index) => (
                <p key={index} className="text-gray-600">
                  {match.source} → <span className="text-gray-800">{match.value}</span>
                </p>
              ))}
              {result.matches.length > 4 && (
                <p className="text-gray-400">+ {result.matches.length - 4} more match(es)</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
