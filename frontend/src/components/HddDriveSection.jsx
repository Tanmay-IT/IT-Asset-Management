import { ChevronDown, ChevronRight, HardDrive } from 'lucide-react';

export function HddDriveSection({ drive, isOpen, onToggle }) {
  const hasEntries = drive.entries && drive.entries.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={onToggle}
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
          <HardDrive size={16} className="text-gray-400" />
          {drive.driveLetter}:\ {drive.driveType && `— ${drive.driveType}`}
        </span>
        <span className="flex items-center gap-2 text-xs text-gray-400">
          {hasEntries
            ? `${drive.entries.length} entr${drive.entries.length === 1 ? 'y' : 'ies'}`
            : 'No detailed data recorded'}
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {isOpen && hasEntries && (
        <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Item Type</th>
                <th className="px-3 py-2 font-medium">Name / Description</th>
                <th className="px-3 py-2 font-medium">Format / Extension</th>
                <th className="px-3 py-2 font-medium">Free Space</th>
                <th className="px-3 py-2 font-medium">Year / Date</th>
                <th className="px-3 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {drive.entries.map((entry, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-gray-400">{entry.number || index + 1}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{entry.itemType || '—'}</td>
                  <td className="max-w-xs whitespace-normal break-words px-3 py-2 text-gray-900 dark:text-gray-100">
                    {entry.nameDescription || '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{entry.formatExtension || '—'}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{entry.freeSpaceAvailable || '—'}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{entry.yearDate || '—'}</td>
                  <td className="max-w-xs whitespace-normal break-words px-3 py-2 text-gray-700 dark:text-gray-300">{entry.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
