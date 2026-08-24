export function TopProgressBar({ active }) {
  if (!active) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden bg-red-100 dark:bg-red-950">
      <div className="animate-progress-bar h-full w-1/3 rounded-full bg-red-600" />
    </div>
  );
}
