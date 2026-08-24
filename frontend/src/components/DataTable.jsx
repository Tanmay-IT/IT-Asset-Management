import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';

function defaultGetRowId(row, index) {
  return row._id ?? row.id ?? index;
}

function SkeletonCell({ seed }) {
  const width = 55 + (seed % 35);
  return (
    <div className="h-4 animate-pulse rounded bg-gray-100 dark:bg-gray-800" style={{ width: `${width}%` }} />
  );
}

export function DataTable({
  columns,
  rows,
  emptyMessage = 'No results found.',
  emptyIcon,
  emptyAction,
  onRowClick,
  isLoading = false,
  skeletonRows = 5,
  getRowId = defaultGetRowId,
  selectable = false,
  selectedIds,
  onToggleRow,
  onToggleAll,
  highlightedId,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const getValue = col.sortValue || ((row) => row[col.key]);
    const sorted = [...rows].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
    });
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [rows, sortKey, sortDirection, columns]);

  function handleSort(col) {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDirection('asc');
    }
  }

  const visibleIds = sortedRows.map((row, i) => getRowId(row, i));
  const allSelected = selectable && visibleIds.length > 0 && visibleIds.every((id) => selectedIds?.has(id));
  const someSelected = selectable && visibleIds.some((id) => selectedIds?.has(id));

  const actionsColumn = columns.find((c) => c.key === 'actions');
  const cardColumns = columns.filter((c) => c.key !== 'actions' && !c.hideOnMobile);

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white sm:block dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-14 z-10 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => onToggleAll(visibleIds)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col) : undefined}
                  className={`whitespace-nowrap px-4 py-3 font-medium ${
                    col.sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      (sortKey === col.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} className="text-gray-300" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {selectable && <td className="px-4 py-3" />}
                  {columns.map((col, colIndex) => (
                    <td key={col.key} className="px-4 py-3">
                      <SkeletonCell seed={rowIndex * 7 + colIndex * 13} />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-6">
                  <EmptyState icon={emptyIcon} message={emptyMessage} action={emptyAction} />
                </td>
              </tr>
            ) : (
              sortedRows.map((row, index) => {
                const rowId = getRowId(row, index);
                return (
                  <tr
                    key={rowId}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/60 ${onRowClick ? 'cursor-pointer' : ''} ${
                      highlightedId === rowId ? 'animate-row-flash' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedIds?.has(rowId))}
                          onChange={() => onToggleRow(rowId)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {isLoading
          ? Array.from({ length: skeletonRows }).map((_, i) => (
              <div key={`skeleton-card-${i}`} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))
          : sortedRows.length === 0 ? (
              <EmptyState icon={emptyIcon} message={emptyMessage} action={emptyAction} />
            ) : (
              sortedRows.map((row, index) => {
                const rowId = getRowId(row, index);
                return (
                  <div
                    key={rowId}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`rounded-lg border bg-white p-3 dark:bg-gray-900 ${onRowClick ? 'cursor-pointer' : ''} ${
                      highlightedId === rowId ? 'animate-row-flash border-gray-200 dark:border-gray-800' : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {selectable && (
                      <input
                        type="checkbox"
                        checked={Boolean(selectedIds?.has(rowId))}
                        onChange={() => onToggleRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="mb-2 h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                        aria-label="Select row"
                      />
                    )}
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      {cardColumns.map((col) => (
                        <div key={col.key} className={col.mobileFullWidth ? 'col-span-2' : ''}>
                          <dt className="text-xs text-gray-400 dark:text-gray-500">{col.header || col.key}</dt>
                          <dd className="truncate text-gray-700 dark:text-gray-300">{col.render ? col.render(row) : row[col.key]}</dd>
                        </div>
                      ))}
                    </dl>
                    {actionsColumn && (
                      <div
                        className="mt-2 flex justify-end border-t border-gray-100 pt-2 dark:border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actionsColumn.render(row)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
      </div>
    </div>
  );
}
