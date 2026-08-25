import { Pencil } from 'lucide-react';
import { Modal } from './Modal';
import { Tag } from './Tag';

const ACCENT_BADGE = {
  red: 'from-red-500 to-red-700',
  gold: 'from-gold-400 to-gold-600',
  blue: 'from-sky-500 to-blue-600',
  green: 'from-emerald-500 to-green-600',
  purple: 'from-violet-500 to-purple-600',
  slate: 'from-slate-500 to-slate-700',
};

/**
 * A read-only "everything about this record" card, opened by clicking a
 * table row. `sections` is [{ title?, fields: [{ label, value, mono? }] }] —
 * `value` may be any node (a Tag, a colored dot, plain text). `accent`
 * matches the owning page's `PageHeader` accent so the detail card visually
 * belongs to that module.
 */
export function DetailModal({ icon: Icon, name, subtitle, badge, sections, onClose, onEdit, accent = 'red' }) {
  return (
    <Modal isOpen onClose={onClose} title="Details" size="lg">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40">
          {Icon && (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${ACCENT_BADGE[accent] || ACCENT_BADGE.red}`}
            >
              <Icon size={22} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
              {badge && <Tag color={badge.color}>{badge.label}</Tag>}
            </div>
            {subtitle && <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title || section.fields[0]?.label}>
            {section.title && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{section.title}</p>
            )}
            <dl className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-2 dark:border-gray-800 dark:bg-gray-800/40">
              {section.fields.map((field) => (
                <div key={field.label} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{field.label}</dt>
                  <dd className={`text-sm text-gray-900 dark:text-gray-100 ${field.mono ? 'break-all font-mono' : ''}`}>
                    {field.value === undefined || field.value === null || field.value === '' ? (
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                    ) : (
                      field.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        {onEdit && (
          <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              onClick={onEdit}
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Pencil size={14} /> Edit
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
