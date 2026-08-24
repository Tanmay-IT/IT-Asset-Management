export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
      {Icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          <Icon size={20} />
        </div>
      )}
      <div>
        {title && <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>}
        {message && <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">{message}</p>}
      </div>
      {action}
    </div>
  );
}
