import React from 'react';
import { Card, LineChart, Table, Button } from '../components.jsx';
import { computeRatios } from '../../modules/ratios.js';
import { exportToCsv, formatNumber, formatPercent } from '../../core/utils.js';

export default function RatiosModule({ data, period }) {
  const income = period === 'annual' ? data.years : data.quarters;
  const balance = period === 'annual' ? data.balanceYears : data.balanceQuarters;
  const cash = period === 'annual' ? data.cashYears : data.cashQuarters;

  const ratios = computeRatios({ income, balance, cash });
  const labels = ratios.map((row) => row.date).reverse();
  const exportRatios = () => {
    exportToCsv('ratios.csv', [
      ['Period', 'EBITDA Margin', 'Gross Margin', 'ROE', 'Debt/EBITDA', 'Current Ratio'],
      ...ratios.map((row) => [row.date, row.ebitdaMargin, row.grossMargin, row.roe, row.debtToEbitda, row.currentRatio]),
    ]);
  };

  return (
    <div className="space-y-6">
      <Card title="Profitability Ratios">
        <LineChart
          labels={labels}
          datasets={[
            {
              label: 'EBITDA Margin',
              data: ratios.map((row) => row.ebitdaMargin).reverse(),
              borderColor: '#22c55e',
            },
            {
              label: 'EBIT Margin',
              data: ratios.map((row) => row.ebitMargin).reverse(),
              borderColor: '#38bdf8',
            },
            {
              label: 'FCF Margin',
              data: ratios.map((row) => row.fcfMargin).reverse(),
              borderColor: '#f97316',
            },
          ]}
        />
      </Card>
      <Card title="Leverage & Liquidity">
        <LineChart
          labels={labels}
          datasets={[
            {
              label: 'Debt / EBITDA',
              data: ratios.map((row) => row.debtToEbitda).reverse(),
              borderColor: '#a855f7',
            },
            {
              label: 'Current Ratio',
              data: ratios.map((row) => row.currentRatio).reverse(),
              borderColor: '#facc15',
            },
          ]}
        />
      </Card>
      <Card title="Ratio Table">
        <div className="flex justify-end mb-2">
          <Button className="bg-slate-700 hover:bg-slate-600" onClick={exportRatios}>
            Export CSV
          </Button>
        </div>
        <Table
          columns={[
            { key: 'date', label: 'Period' },
            { key: 'ebitdaMargin', label: 'EBITDA Margin' },
            { key: 'grossMargin', label: 'Gross Margin' },
            { key: 'roe', label: 'ROE' },
            { key: 'debtToEbitda', label: 'Debt/EBITDA' },
            { key: 'currentRatio', label: 'Current Ratio' },
          ]}
          rows={ratios.map((row) => ({
            id: row.date,
            date: row.date,
            ebitdaMargin: formatPercent(row.ebitdaMargin),
            grossMargin: formatPercent(row.grossMargin),
            roe: formatPercent(row.roe),
            debtToEbitda: formatNumber(row.debtToEbitda, 2),
            currentRatio: formatNumber(row.currentRatio, 2),
          }))}
        />
      </Card>
    </div>
  );
}
