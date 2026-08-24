const tones = {
  default: { icon: 'bg-red-50 text-red-600 ring-red-100 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/40', accent: 'bg-red-500' },
  warning: { icon: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/40', accent: 'bg-amber-500' },
  danger: { icon: 'bg-red-50 text-red-600 ring-red-100 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/40', accent: 'bg-red-500' },
  gold: { icon: 'bg-gold-50 text-gold-600 ring-gold-100 dark:bg-gold-900/30 dark:text-gold-300 dark:ring-gold-800/40', accent: 'bg-gold-400' },
};

export function MetricCard({ label, value, icon: Icon, tone = 'default', trend, onClick }) {
  const t = tones[tone];
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md sm:p-5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none ${onClick ? 'cursor-pointer' : ''}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${t.accent}`} />
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-4 ${t.icon}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-50">{value}</p>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.direction === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : trend.direction === 'down'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-400'
                }`}
              >
                {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '–'} {trend.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
