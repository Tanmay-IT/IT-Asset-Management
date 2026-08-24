import { useEffect, useRef, useState } from 'react';
import { Columns3 } from 'lucide-react';

/** columns: [{ key, label }]. hiddenKeys: Set. onChange(nextSet). */
export function ColumnVisibilityMenu({ columns, hiddenKeys, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function toggle(key) {
    const next = new Set(hiddenKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        <Columns3 size={16} /> Columns
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Show columns</p>
          <div className="flex max-h-64 flex-col overflow-y-auto">
            {columns.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={!hiddenKeys.has(col.key)}
                  onChange={() => toggle(col.key)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {col.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
