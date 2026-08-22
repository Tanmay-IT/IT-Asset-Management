import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ value, label = 'Copy', copiedLabel = 'Copied', size = 'sm' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — button just won't confirm.
    }
  }

  if (!value) return null;

  const padding = size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5';

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1 rounded-md border border-gray-200 ${padding} text-xs font-medium text-gray-500 hover:bg-gray-50`}
    >
      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
