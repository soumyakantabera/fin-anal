import React, { useState } from 'react';
import { Card, Table, Button } from '../components.jsx';
import { buildComps, summarizeComps } from '../../modules/comps.js';
import { formatNumber } from '../../core/utils.js';

const defaultPeers = [
  { name: 'Peer A', ev: 120000, revenue: 60000, ebitda: 16000, marketCap: 80000, netIncome: 9000 },
  { name: 'Peer B', ev: 95000, revenue: 52000, ebitda: 13000, marketCap: 65000, netIncome: 7000 },
  { name: 'Peer C', ev: 110000, revenue: 58000, ebitda: 15000, marketCap: 76000, netIncome: 8500 },
];

export default function CompsModule() {
  const [peers, setPeers] = useState(defaultPeers);
  const multiples = buildComps(peers);
  const summary = summarizeComps(multiples);

  const exportPeers = () => {
    const rows = [
      ['Name', 'EV', 'Revenue', 'EBITDA', 'Market Cap', 'Net Income'],
      ...peers.map((peer) => [peer.name, peer.ev, peer.revenue, peer.ebitda, peer.marketCap, peer.netIncome]),
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'comps.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card title="Trading Comps">
        <Table
          columns={[
            { key: 'name', label: 'Company' },
            { key: 'evRevenue', label: 'EV/Revenue' },
            { key: 'evEbitda', label: 'EV/EBITDA' },
            { key: 'pe', label: 'P/E' },
          ]}
          rows={multiples.map((row) => ({
            id: row.name,
            name: row.name,
            evRevenue: formatNumber(row.evRevenue, 2),
            evEbitda: formatNumber(row.evEbitda, 2),
            pe: formatNumber(row.pe, 2),
          }))}
        />
        <div className="mt-4 flex gap-2">
          <Button onClick={exportPeers}>Export CSV</Button>
        </div>
      </Card>
      <Card title="Comps Summary">
        <Table
          columns={[
            { key: 'metric', label: 'Metric' },
            { key: 'min', label: 'Min' },
            { key: 'median', label: 'Median' },
            { key: 'max', label: 'Max' },
          ]}
          rows={Object.entries(summary).map(([metric, values]) => ({
            id: metric,
            metric,
            min: formatNumber(values.min, 2),
            median: formatNumber(values.median, 2),
            max: formatNumber(values.max, 2),
          }))}
        />
      </Card>
    </div>
  );
}
