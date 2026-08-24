export function BulkActionsBar({ count, onClear, actions }) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm dark:border-red-900/40 dark:bg-red-950/30">
      <span className="font-medium text-red-700 dark:text-red-400">{count} selected</span>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            type="button"
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
              action.variant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {action.icon && <action.icon size={13} />}
            {action.label}
          </button>
        ))}
      </div>
      <button onClick={onClear} type="button" className="ml-auto text-xs text-red-600 hover:underline dark:text-red-400">
        Clear selection
      </button>
    </div>
  );
}
