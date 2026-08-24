import { Plus, Trash2 } from 'lucide-react';

const ENTRY_FIELDS = [
  { key: 'itemType', label: 'Item Type' },
  { key: 'nameDescription', label: 'Name / Description' },
  { key: 'formatExtension', label: 'Format / Extension' },
  { key: 'freeSpaceAvailable', label: 'Free Space' },
  { key: 'yearDate', label: 'Year / Date' },
  { key: 'notes', label: 'Notes' },
];

const emptyEntry = {
  number: '',
  itemType: '',
  nameDescription: '',
  formatExtension: '',
  freeSpaceAvailable: '',
  yearDate: '',
  notes: '',
};

const DRIVE_LETTER_OPTIONS = ['C', 'D', 'E', 'F', 'G'];

/**
 * Fully editable drives[] -> entries[] structure — lets a drive be renamed,
 * removed, or reduced from several drives down to one (e.g. an HDD that was
 * reformatted from C:/D:/E: into a single consolidated drive), and lets
 * individual content entries be added, edited, or removed.
 */
export function HddDriveEditor({ drives, onChange }) {
  function updateDrive(index, patch) {
    onChange(drives.map((drive, i) => (i === index ? { ...drive, ...patch } : drive)));
  }
  function removeDrive(index) {
    onChange(drives.filter((_, i) => i !== index));
  }
  function addDrive() {
    const usedLetters = drives.map((drive) => drive.driveLetter);
    const nextLetter = DRIVE_LETTER_OPTIONS.find((letter) => !usedLetters.includes(letter)) || 'C';
    onChange([...drives, { driveLetter: nextLetter, driveType: '', entries: [] }]);
  }

  function updateEntry(driveIndex, entryIndex, patch) {
    updateDrive(driveIndex, {
      entries: drives[driveIndex].entries.map((entry, i) => (i === entryIndex ? { ...entry, ...patch } : entry)),
    });
  }
  function removeEntry(driveIndex, entryIndex) {
    updateDrive(driveIndex, { entries: drives[driveIndex].entries.filter((_, i) => i !== entryIndex) });
  }
  function addEntry(driveIndex) {
    updateDrive(driveIndex, { entries: [...drives[driveIndex].entries, { ...emptyEntry }] });
  }

  return (
    <div className="flex flex-col gap-4">
      {drives.map((drive, driveIndex) => (
        <div key={driveIndex} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select
              value={drive.driveLetter}
              onChange={(e) => updateDrive(driveIndex, { driveLetter: e.target.value })}
              className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {DRIVE_LETTER_OPTIONS.map((letter) => (
                <option key={letter} value={letter}>
                  {letter}:\
                </option>
              ))}
            </select>
            <input
              type="text"
              value={drive.driveType}
              onChange={(e) => updateDrive(driveIndex, { driveType: e.target.value })}
              placeholder="Drive type (e.g. System Drive, Data Drive, Backup Drive)"
              className="min-w-[180px] flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={() => removeDrive(driveIndex)}
              type="button"
              className="shrink-0 rounded-md border border-gray-200 p-1.5 text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/40"
              aria-label={`Remove drive ${drive.driveLetter}`}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {drive.entries.map((entry, entryIndex) => (
              <div
                key={entryIndex}
                className="flex flex-wrap items-center gap-1.5 rounded-md border border-gray-100 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-800/60"
              >
                {ENTRY_FIELDS.map(({ key, label }) => (
                  <input
                    key={key}
                    type="text"
                    value={entry[key]}
                    onChange={(e) => updateEntry(driveIndex, entryIndex, { [key]: e.target.value })}
                    placeholder={label}
                    className="min-w-[110px] flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                ))}
                <button
                  onClick={() => removeEntry(driveIndex, entryIndex)}
                  type="button"
                  className="shrink-0 rounded-md border border-gray-200 bg-white p-1.5 text-red-500 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-red-950/40"
                  aria-label="Remove entry"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addEntry(driveIndex)}
              type="button"
              className="flex w-fit items-center gap-1 text-xs font-medium text-red-600 hover:underline dark:text-red-400"
            >
              <Plus size={13} /> Add entry
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addDrive}
        type="button"
        className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-500 dark:hover:text-red-400"
      >
        <Plus size={14} /> Add Drive
      </button>
    </div>
  );
}
