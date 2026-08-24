import { useState } from 'react';

const COLOR_STYLES = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
};

/**
 * A Tag-styled <select> for quick, click-free status edits directly in a
 * table cell. `options` are the distinct values already present in the
 * data (never free-typed here) so an inline edit can't introduce a new,
 * accidental status variant — full free-text editing stays in the Edit modal.
 */
export function StatusInlineSelect({ value, options, colorFor, onChange, disabled }) {
  const [isSaving, setIsSaving] = useState(false);
  const color = colorFor(value);

  async function handleChange(e) {
    const next = e.target.value;
    if (next === value) return;
    setIsSaving(true);
    try {
      await onChange(next);
    } finally {
      setIsSaving(false);
    }
  }

  const selectOptions = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <select
      value={value || ''}
      onClick={(e) => e.stopPropagation()}
      onChange={handleChange}
      disabled={disabled || isSaving}
      className={`cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-6 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-400 disabled:cursor-wait disabled:opacity-60 ${COLOR_STYLES[color] || COLOR_STYLES.gray}`}
    >
      {selectOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
