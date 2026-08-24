const styles = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
  gold: 'bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300',
};

export function Tag({ children, color = 'gray', title }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[color]}`}
    >
      {children}
    </span>
  );
}
