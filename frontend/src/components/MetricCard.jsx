const tones = {
  default: { icon: 'bg-red-50 text-red-600 ring-red-100', accent: 'bg-red-500' },
  warning: { icon: 'bg-amber-50 text-amber-600 ring-amber-100', accent: 'bg-amber-500' },
  danger: { icon: 'bg-red-50 text-red-600 ring-red-100', accent: 'bg-red-500' },
};

export function MetricCard({ label, value, icon: Icon, tone = 'default' }) {
  const t = tones[tone];

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <span className={`absolute inset-x-0 top-0 h-1 ${t.accent}`} />
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-4 ${t.icon}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{value}</p>
        </div>
      </div>
    </div>
  );
}
