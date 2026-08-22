import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Monitor,
  Server,
  Printer,
  HardDrive,
  Plus,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import { useComputers } from '../hooks/useComputers';
import { useServerRoomItems } from '../hooks/useServerRoomItems';
import { useTonerInward } from '../hooks/useTonerInward';
import { useTonerOutward } from '../hooks/useTonerOutward';
import { useHddSearch } from '../hooks/useHddSearch';

const NAV_ITEMS = [
  { label: 'Go to Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Go to Computers', to: '/computers', icon: Monitor },
  { label: 'Go to Server Room', to: '/server-room', icon: Server },
  { label: 'Go to Toners', to: '/toners', icon: Printer },
  { label: 'Go to HDD Archive', to: '/hdd', icon: HardDrive },
];

const QUICK_ACTIONS = [
  { label: 'Add Computer', to: '/computers', icon: Plus, openAdd: true },
  { label: 'Add Server Room Item', to: '/server-room', icon: Plus, openAdd: true },
  { label: 'Log Inward Toner', to: '/toners', icon: Plus, openAdd: 'inward' },
  { label: 'Log Outward Toner', to: '/toners', icon: Plus, openAdd: 'outward' },
];

function matchesQuery(haystackParts, query) {
  return haystackParts.filter(Boolean).join(' ').toLowerCase().includes(query);
}

export function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { computers } = useComputers();
  const { items: serverRoomItems } = useServerRoomItems();
  const { inward } = useTonerInward();
  const { outward } = useTonerOutward();
  const { results: hddResults, isLoading: hddLoading } = useHddSearch(query);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const groups = useMemo(() => {
    if (!isSearching) {
      return [
        { title: 'Navigate', items: NAV_ITEMS.map((item) => ({ ...item, kind: 'nav' })) },
        { title: 'Quick Actions', items: QUICK_ACTIONS.map((item) => ({ ...item, kind: 'action' })) },
      ];
    }

    const computerMatches = computers
      .filter((c) =>
        matchesQuery([c.computerName, c.firstName, c.lastName, c.email, c.serialNo, c.department], normalizedQuery)
      )
      .slice(0, 5)
      .map((c) => ({
        kind: 'computer',
        label: c.computerName || [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Computer',
        sublabel: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.serialNo,
        icon: Monitor,
        to: '/computers',
        query: c.serialNo || c.computerName,
      }));

    const serverRoomMatches = serverRoomItems
      .filter((i) => matchesQuery([i.tagNumber, i.item, i.model, i.serialNumber], normalizedQuery))
      .slice(0, 5)
      .map((i) => ({
        kind: 'server-room',
        label: i.item || i.tagNumber || 'Server room item',
        sublabel: i.tagNumber,
        icon: Server,
        to: '/server-room',
        query: i.serialNumber || i.tagNumber,
      }));

    const tonerMatches = [
      ...inward.map((row) => ({ ...row, direction: 'Inward' })),
      ...outward.map((row) => ({ ...row, direction: 'Outward' })),
    ]
      .filter((row) => matchesQuery([row.tonerType, row.deliveredTo, row.note], normalizedQuery))
      .slice(0, 5)
      .map((row) => ({
        kind: 'toner',
        label: `${row.tonerType || 'Toner'} — ${row.direction}`,
        sublabel: row.deliveredTo || row.note || row.dateOfOrder,
        icon: Printer,
        to: '/toners',
        query: row.tonerType,
      }));

    const hddMatches = (hddResults || []).slice(0, 5).map((result) => {
      const recordId = result.main?._id
        ? { kind: 'main', id: result.main._id }
        : result.detail?._id
          ? { kind: 'detail', id: result.detail._id }
          : null;
      return {
        kind: 'hdd',
        label: result.title,
        sublabel: result.serialNumber || result.matches?.[0]?.value,
        icon: HardDrive,
        to: recordId ? `/hdd/record/${recordId.kind}/${recordId.id}` : '/hdd',
      };
    });

    const navMatches = NAV_ITEMS.filter((item) => matchesQuery([item.label], normalizedQuery)).map((item) => ({
      ...item,
      kind: 'nav',
    }));

    return [
      { title: 'Navigate', items: navMatches },
      { title: 'Computers', items: computerMatches },
      { title: 'Server Room', items: serverRoomMatches },
      { title: 'Toners', items: tonerMatches },
      { title: 'HDD Archive', items: hddMatches },
    ].filter((group) => group.items.length > 0);
  }, [isSearching, normalizedQuery, computers, serverRoomItems, inward, outward, hddResults]);

  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function activate(item) {
    if (!item) return;
    if (item.kind === 'action') {
      navigate(item.to, { state: { openAdd: item.openAdd } });
    } else if (item.kind === 'nav') {
      navigate(item.to);
    } else {
      navigate(item.to, item.query ? { state: { initialQuery: item.query } } : undefined);
    }
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate(flatItems[selectedIndex]);
    }
  }

  let runningIndex = -1;

  return (
    <div
      onClick={onClose}
      className="animate-modal-backdrop fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-palette-in flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Search size={18} className="shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search computers, server room, toners, HDD archive, or jump somewhere..."
            className="min-w-0 flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-400 sm:block">
            Esc
          </kbd>
        </div>

        <div className="overflow-y-auto p-2">
          {isSearching && hddLoading && <p className="px-3 py-2 text-xs text-gray-400">Searching HDD archive...</p>}

          {flatItems.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-400">No matches for "{query}".</p>
          ) : (
            groups.map((group) => (
              <div key={group.title} className="mb-2 last:mb-0">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={`${group.title}-${item.label}-${index}`}
                      onClick={() => activate(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isSelected ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-red-600' : 'text-gray-400'} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.sublabel && <span className="shrink-0 truncate text-xs text-gray-400">{item.sublabel}</span>}
                      {isSelected && <CornerDownLeft size={13} className="shrink-0 text-red-400" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <ArrowRight size={12} className="rotate-90" /> <ArrowRight size={12} className="-rotate-90" /> Navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft size={12} /> Select
          </span>
        </div>
      </div>
    </div>
  );
}
