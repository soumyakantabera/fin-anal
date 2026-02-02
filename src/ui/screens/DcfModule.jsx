import React from 'react';
import { Card, LineChart, Table, Stat, Button } from '../components.jsx';
import { buildForecast } from '../../modules/forecast.js';
import { computeDcf, computeEquityValue } from '../../modules/dcf.js';
import { exportToCsv, formatCurrency, formatNumber } from '../../core/utils.js';

export default function DcfModule({ data, assumptions }) {
  const forecast = buildForecast({ baseIncome: data.years, assumptions });
  const dcf = computeDcf({ forecast, assumptions });
  const latestBalance = data.balanceYears[0] || {};
  const netDebt = (latestBalance.totalDebt || 0) - (latestBalance.cash || 0);
  const equity = computeEquityValue({
    enterpriseValue: dcf.enterpriseValue,
    netDebt,
    sharesOutstanding: latestBalance.sharesOutstanding,
  });

  const exportDcf = () => {
    exportToCsv('dcf.csv', [
      ['Year', 'Unlevered FCF', 'PV'],
      ...dcf.discounted.map((row) => [row.year, row.unleveredFcf, row.pv]),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Enterprise Value" value={formatCurrency(dcf.enterpriseValue)} />
        <Stat label="Net Debt" value={formatCurrency(netDebt)} />
        <Stat label="Equity Value" value={formatCurrency(equity.equityValue)} />
        <Stat label="Implied Price" value={formatNumber(equity.impliedPrice, 2)} />
      </div>
      <Card title="DCF Cashflows">
        <LineChart
          labels={dcf.cashflows.map((row) => row.year)}
          datasets={[
            {
              label: 'Unlevered FCF',
              data: dcf.cashflows.map((row) => row.unleveredFcf),
              borderColor: '#38bdf8',
            },
          ]}
        />
      </Card>
      <Card title="DCF Table">
        <div className="flex justify-end mb-2">
          <Button className="bg-slate-700 hover:bg-slate-600" onClick={exportDcf}>
            Export CSV
          </Button>
        </div>
        <Table
          columns={[
            { key: 'year', label: 'Year' },
            { key: 'unleveredFcf', label: 'Unlevered FCF' },
            { key: 'pv', label: 'Present Value' },
          ]}
          rows={dcf.discounted.map((row) => ({
            id: row.year,
            year: row.year,
            unleveredFcf: formatCurrency(row.unleveredFcf),
            pv: formatCurrency(row.pv),
          }))}
        />
      </Card>
    </div>
  );
}
