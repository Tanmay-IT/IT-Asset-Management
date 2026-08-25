/** A donut/ring stat — a different chart shape from the bars/meters elsewhere, for a genuinely mixed "different types" dashboard rather than repeating the same bar pattern. Pure CSS conic-gradient, no chart library. */
export function RadialStat({ title, subtitle, value, total, color = '#dc2626' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <div className="w-full">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <p className="py-6 text-sm text-gray-400">No data yet.</p>
      ) : (
        <>
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="absolute inset-0 rounded-full transition-[background] duration-500"
              style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, transparent ${pct * 3.6}deg)` }}
            />
            <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900" />
            <span className="relative text-xl font-bold text-gray-900 dark:text-gray-100">{pct}%</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {value} / {total}
          </p>
        </>
      )}
    </div>
  );
}
