import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, AlertTriangle, Wrench, Server, Printer, HardDrive, ArrowRight, Database } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { BarList } from '../components/charts/BarList';
import { StatusBar } from '../components/charts/StatusBar';
import { MeterRow } from '../components/charts/MeterRow';
import { useComputers } from '../hooks/useComputers';
import { useServerRoomItems } from '../hooks/useServerRoomItems';
import { useTonerInward } from '../hooks/useTonerInward';
import { useTonerOutward } from '../hooks/useTonerOutward';
import { useHddDashboard } from '../hooks/useHddDashboard';
import { useHddInventory } from '../hooks/useHddInventory';
import { computeTonerStock } from '../lib/tonerStock';
import { getFilterBucket } from '../lib/hddStatus';
import { classifyServerRoomStatus } from '../lib/serverRoomStatus';

const QUICK_LINKS = [
  { to: '/computers', label: 'Computers', icon: Monitor, description: 'Laptops & desktops inventory' },
  { to: '/server-room', label: 'Server Room', icon: Server, description: 'Racked equipment & bins' },
  { to: '/toners', label: 'Toners', icon: Printer, description: 'Inward / outward stock log' },
  { to: '/hdd', label: 'HDD Archive', icon: HardDrive, description: 'Inventory & data archive' },
];

function groupCount(items, getKey, fallbackLabel = 'Unassigned') {
  const counts = new Map();
  for (const item of items) {
    const raw = getKey(item);
    const key = (raw || '').toString().trim();
    const label = key || fallbackLabel;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value }));
}

/** Groups by trimmed+uppercased key but keeps the most frequent original casing as the label. */
function groupCountCaseInsensitive(items, getKey, fallbackLabel = 'Unknown') {
  const byNormalized = new Map();
  for (const item of items) {
    const raw = (getKey(item) || '').toString().trim();
    const label = raw || fallbackLabel;
    const normKey = label.toUpperCase();
    const entry = byNormalized.get(normKey) || { label, value: 0 };
    entry.value += 1;
    byNormalized.set(normKey, entry);
  }
  return [...byNormalized.values()];
}

export function Dashboard() {
  const navigate = useNavigate();
  const { computers, isLoading: computersLoading } = useComputers();
  const { items: serverRoomItems, isLoading: serverRoomLoading } = useServerRoomItems();
  const { inward, isLoading: inwardLoading } = useTonerInward();
  const { outward, isLoading: outwardLoading } = useTonerOutward();
  const { stats: hddStats } = useHddDashboard();
  const { entities: hddEntities } = useHddInventory();

  const repairCount = serverRoomItems.filter((item) => item.problem?.trim()).length;
  const tonerStock = useMemo(() => computeTonerStock(inward, outward), [inward, outward]);
  const lowTonerCount = tonerStock.filter((entry) => entry.isLow).length;
  const tonerLoading = inwardLoading || outwardLoading;

  const departmentBars = useMemo(
    () => groupCount(computers, (c) => c.department, 'Unassigned'),
    [computers]
  );
  const branchBars = useMemo(() => groupCount(computers, (c) => c.branch, 'Unassigned'), [computers]);
  const serverRoomStatusBars = useMemo(
    () => groupCountCaseInsensitive(serverRoomItems, (i) => i.status, 'Unknown'),
    [serverRoomItems]
  );

  const security = useMemo(() => {
    const total = computers.length;
    return {
      cato: computers.filter((c) => c.catoInstalled).length,
      antivirus: computers.filter((c) => c.antivirus).length,
      sophos: computers.filter((c) => c.sophosMdr).length,
      total,
    };
  }, [computers]);

  const hddVerificationSegments = useMemo(() => {
    let confirmed = 0;
    let needsVerification = 0;
    let inventoryOnly = 0;
    for (const entity of hddEntities) {
      const bucket = getFilterBucket(entity);
      if (bucket === 'Detailed Record Available') confirmed += 1;
      else if (bucket === 'Needs Verification') needsVerification += 1;
      else inventoryOnly += 1;
    }
    return [
      { label: 'Detailed & Confirmed', value: confirmed, color: 'green' },
      { label: 'Needs Verification', value: needsVerification, color: 'amber' },
      { label: 'Inventory Only', value: inventoryOnly, color: 'gray' },
    ];
  }, [hddEntities]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Dashboard</h1>
        <p className="text-sm text-gray-500">A live overview across every IT asset module.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Total Computers"
          value={computersLoading ? '—' : computers.length}
          icon={Monitor}
          tone="default"
        />
        <MetricCard
          label="Server Room Repairs"
          value={serverRoomLoading ? '—' : repairCount}
          icon={Wrench}
          tone="danger"
        />
        <MetricCard
          label="Low Toner Stock Alerts"
          value={tonerLoading ? '—' : lowTonerCount}
          icon={AlertTriangle}
          tone="warning"
        />
        <MetricCard
          label="HDDs Needing Verification"
          value={hddStats ? hddStats.recordsRequiringVerification : '—'}
          icon={HardDrive}
          tone="warning"
        />
        <MetricCard
          label="Total HDD Capacity"
          value={hddStats ? `${(hddStats.totalListedCapacityGb / 1024).toFixed(1)} TB` : '—'}
          icon={Database}
          tone="default"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarList
          title="Computers by Department"
          subtitle="Top departments by device count — click a bar to view"
          bars={departmentBars}
          onBarClick={(bar) => navigate('/computers', { state: { initialQuery: bar.label } })}
        />
        <BarList
          title="Computers by Branch"
          subtitle="Top branches by device count — click a bar to view"
          bars={branchBars}
          onBarClick={(bar) => navigate('/computers', { state: { initialQuery: bar.label } })}
        />

        <MeterRow
          title="Security Software Coverage"
          subtitle={`Across ${security.total} computers`}
          meters={[
            { label: 'CATO Installed', value: security.cato, total: security.total },
            { label: 'Antivirus', value: security.antivirus, total: security.total },
            { label: 'Sophos MDR', value: security.sophos, total: security.total },
          ]}
        />
        <BarList
          title="Toner Stock Levels"
          subtitle="Current stock by toner type — low stock highlighted, click to view"
          bars={tonerStock.map((entry) => ({ label: entry.tonerType, value: entry.currentStock }))}
          colorFor={(bar) => (tonerStock.find((entry) => entry.tonerType === bar.label)?.isLow ? 'red' : 'gray')}
          onBarClick={(bar) => navigate('/toners', { state: { initialQuery: bar.label } })}
        />

        <StatusBar
          title="HDD Archive Verification"
          subtitle={`${hddStats?.totalHddRecords ?? '—'} total HDD records`}
          segments={hddVerificationSegments}
        />
        <BarList
          title="Server Room by Status"
          subtitle="As recorded in the source data — non-active in orange, click to view"
          bars={serverRoomStatusBars}
          colorFor={(bar) => {
            const state = classifyServerRoomStatus(bar.label);
            if (state === 'active') return 'green';
            if (state === 'inactive') return 'orange';
            return 'gray';
          }}
          onBarClick={(bar) => navigate('/server-room', { state: { initialQuery: bar.label } })}
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ to, label, icon: Icon, description }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 ring-4 ring-red-100">
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{label}</p>
                <p className="truncate text-xs text-gray-500">{description}</p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
