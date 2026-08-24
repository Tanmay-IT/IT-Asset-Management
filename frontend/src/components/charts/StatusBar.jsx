const STATUS_FILL = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-300',
};

/**
 * Single stacked bar for a part-to-whole status breakdown (never used for
 * arbitrary series identity — only when the color genuinely means a status).
 */
export function StatusBar({ title, subtitle, segments }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <div className="flex flex-1 flex-col justify-center">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            {segments
              .filter((segment) => segment.value > 0)
              .map((segment, index) => (
                <div
                  key={segment.label}
                  title={`${segment.label}: ${segment.value}`}
                  className={`h-full ${STATUS_FILL[segment.color]} transition-opacity hover:opacity-80 ${
                    index > 0 ? 'ml-0.5' : ''
                  }`}
                  style={{ width: `${(segment.value / total) * 100}%` }}
                />
              ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {segments.map((segment) => (
              <div key={segment.label} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className={`h-2 w-2 rounded-full ${STATUS_FILL[segment.color]}`} />
                {segment.label} <span className="font-medium text-gray-900 dark:text-gray-100">{segment.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
