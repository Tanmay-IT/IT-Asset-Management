/**
 * Derives which kinds of data are present on an HDD purely by scanning the
 * detail sheet's own recorded text (item type / description / format /
 * notes / year-date). Nothing here is invented — a category only appears if
 * matching text is actually present in the source.
 */
const CATEGORY_DEFINITIONS = [
  { label: 'Emails', test: (text) => /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text) },
  { label: 'PST Files', test: (text) => /\bpst\b/i.test(text) },
  { label: 'Excel Files', test: (text) => /\.xlsx?\b|\bxslx\b|\bexcel\b/i.test(text) },
  { label: 'PDF Files', test: (text) => /\bpdf\b/i.test(text) },
  { label: 'Word Files', test: (text) => /\.docx?\b|\bword\b/i.test(text) },
  { label: 'User Data', test: (text) => /\buser\s*data\b/i.test(text) },
  { label: 'Documents', test: (text) => /\bdocuments?\b|\bdocs?\b/i.test(text) },
];

export function deriveDataCategories(detail) {
  if (!detail?.drives) return [];

  const text = detail.drives
    .flatMap((drive) => drive.entries || [])
    .flatMap((entry) => [entry.nameDescription, entry.formatExtension, entry.itemType, entry.notes, entry.yearDate])
    .filter(Boolean)
    .join(' ');

  if (!text) return [];

  return CATEGORY_DEFINITIONS.filter((category) => category.test(text)).map((category) => category.label);
}
