import { useMemo } from 'react';
import { Monitor, AlertTriangle, Wrench } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { useComputers } from '../hooks/useComputers';
import { useServerRoomItems } from '../hooks/useServerRoomItems';
import { useTonerInward } from '../hooks/useTonerInward';
import { useTonerOutward } from '../hooks/useTonerOutward';
import { computeTonerStock } from '../lib/tonerStock';

export function Dashboard() {
  const { computers, isLoading: computersLoading } = useComputers();
  const { items: serverRoomItems, isLoading: serverRoomLoading } = useServerRoomItems();
  const { inward, isLoading: inwardLoading } = useTonerInward();
  const { outward, isLoading: outwardLoading } = useTonerOutward();

  const repairCount = serverRoomItems.filter((item) => item.problem).length;
  const tonerStock = useMemo(() => computeTonerStock(inward, outward), [inward, outward]);
  const lowTonerCount = tonerStock.filter((entry) => entry.isLow).length;
  const tonerLoading = inwardLoading || outwardLoading;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total Devices"
          value={computersLoading ? '—' : computers.length}
          icon={Monitor}
          tone="default"
        />
        <MetricCard
          label="Low Toner Stock Alerts"
          value={tonerLoading ? '—' : lowTonerCount}
          icon={AlertTriangle}
          tone="warning"
        />
        <MetricCard
          label="Server Room Repairs"
          value={serverRoomLoading ? '—' : repairCount}
          icon={Wrench}
          tone="danger"
        />
      </div>
    </div>
  );
}
