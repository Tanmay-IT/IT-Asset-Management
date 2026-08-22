export function FilterPillGroup({ label, value, options, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="text-xs font-medium text-gray-400">{label}</span>}
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          type="button"
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value === option ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
