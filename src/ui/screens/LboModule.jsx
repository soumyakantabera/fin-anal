import React from 'react';
import { Card, LineChart, Stat, Button } from '../components.jsx';
import { buildForecast } from '../../modules/forecast.js';
import { computeLbo } from '../../modules/lbo.js';
import { exportToCsv, formatCurrency, formatPercent } from '../../core/utils.js';

export default function LboModule({ data, assumptions }) {
  const forecast = buildForecast({ baseIncome: data.years, assumptions });
  const lbo = computeLbo({ forecast, assumptions });

  const exportDebt = () => {
    exportToCsv('lbo-debt.csv', [
      ['Year', 'Debt Balance'],
      ...lbo.debtSchedule.map((row) => [row.year, row.debtBalance]),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Entry EV" value={formatCurrency(lbo.entryEnterpriseValue)} />
        <Stat label="Equity Invested" value={formatCurrency(lbo.equity)} />
        <Stat label="Equity IRR" value={formatPercent(lbo.irr)} />
      </div>
      <Card title="Debt Paydown">
        <div className="flex justify-end mb-2">
          <Button className="bg-slate-700 hover:bg-slate-600" onClick={exportDebt}>
            Export CSV
          </Button>
        </div>
        <LineChart
          labels={lbo.debtSchedule.map((row) => row.year)}
          datasets={[
            {
              label: 'Debt Balance',
              data: lbo.debtSchedule.map((row) => row.debtBalance),
              borderColor: '#f97316',
            },
          ]}
        />
      </Card>
    </div>
  );
}
