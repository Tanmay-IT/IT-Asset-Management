const BAR_FILL = {
  red: 'bg-red-500 group-hover:bg-red-600',
  gray: 'bg-gray-300 group-hover:bg-gray-400',
  green: 'bg-green-500 group-hover:bg-green-600',
  orange: 'bg-orange-500 group-hover:bg-orange-600',
};

/**
 * Horizontal magnitude bars — bar length is the encoding; color is uniform
 * per the dataviz rules unless `colorFor` is given a real reason to vary it
 * (emphasis: the point vs context, or a genuine status meaning — never rank).
 */
export function BarList({ title, subtitle, bars, maxItems = 7, colorFor }) {
  const sorted = [...bars].sort((a, b) => b.value - a.value);
  const shown = sorted.slice(0, maxItems);
  const hiddenCount = sorted.length - shown.length;
  const max = Math.max(...shown.map((bar) => bar.value), 1);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-3">
          {shown.map((bar) => {
            const widthPct = Math.max((bar.value / max) * 100, 3);
            const color = colorFor ? colorFor(bar) : 'red';
            return (
              <div key={bar.label} className="group" title={`${bar.label}: ${bar.value}`}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-gray-600">{bar.label}</span>
                  <span className="shrink-0 font-medium text-gray-900">{bar.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-r bg-gray-100">
                  <div
                    className={`h-full rounded-r transition-[width] duration-300 ${BAR_FILL[color] || BAR_FILL.red}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hiddenCount > 0 && <p className="mt-3 text-xs text-gray-400">+ {hiddenCount} more</p>}
    </div>
  );
}
