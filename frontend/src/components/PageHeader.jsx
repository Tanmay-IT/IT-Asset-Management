const ACCENTS = {
  red: 'from-red-500 to-red-700',
  gold: 'from-gold-400 to-gold-600',
  blue: 'from-sky-500 to-blue-600',
  green: 'from-emerald-500 to-green-600',
  purple: 'from-violet-500 to-purple-600',
  slate: 'from-slate-500 to-slate-700',
};

/** Consistent page banner — icon badge + title/subtitle + a right-side actions slot — used by every module page. The icon badge carries the module's accent color; the banner itself stays neutral so the accent reads as identity, not decoration. */
export function PageHeader({ icon: Icon, title, subtitle, accent = 'red', actions }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${ACCENTS[accent] || ACCENTS.red}`}
        >
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">{title}</h1>
          {subtitle && <p className="truncate text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div>}
    </div>
  );
}
