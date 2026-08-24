function getMeterColor(pct) {
  if (pct < 40) return { fill: 'bg-red-500', track: 'bg-red-100' };
  if (pct < 75) return { fill: 'bg-amber-500', track: 'bg-amber-100' };
  return { fill: 'bg-green-500', track: 'bg-green-100' };
}

/** A ratio-against-a-limit meter per device/entry — color reads as severity (low coverage = risk). */
export function MeterRow({ title, subtitle, meters }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4">
        {meters.map((meter) => {
          const pct = meter.total > 0 ? Math.round((meter.value / meter.total) * 100) : 0;
          const { fill, track } = getMeterColor(pct);
          return (
            <div key={meter.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{meter.label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {meter.value} / {meter.total} · {pct}%
                </span>
              </div>
              <div className={`h-2 w-full overflow-hidden rounded-r ${track}`}>
                <div
                  className={`h-full rounded-r ${fill} transition-[width] duration-300`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
