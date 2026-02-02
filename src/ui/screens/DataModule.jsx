import React from 'react';
import { Card, LineChart, Table, Stat, Button } from '../components.jsx';
import { exportToCsv, formatCurrency, formatNumber } from '../../core/utils.js';

const buildStatementRows = (income, balance, cash) =>
  income.map((row, index) => ({
    id: row.date,
    date: row.date,
    revenue: formatCurrency(row.revenue),
    ebitda: formatCurrency(row.ebitda),
    netIncome: formatCurrency(row.netIncome),
    cash: formatCurrency(balance[index]?.cash),
    debt: formatCurrency(balance[index]?.totalDebt),
    fcf: formatCurrency(cash[index]?.freeCashFlow),
  }));

export default function DataModule({ data, period }) {
  const income = period === 'annual' ? data.years : data.quarters;
  const balance = period === 'annual' ? data.balanceYears : data.balanceQuarters;
  const cash = period === 'annual' ? data.cashYears : data.cashQuarters;
  const rows = buildStatementRows(income, balance, cash);

  const labels = income.map((row) => row.date).reverse();
  const revenueSeries = income.map((row) => row.revenue).reverse();
  const ebitdaSeries = income.map((row) => row.ebitda).reverse();
  const netIncomeSeries = income.map((row) => row.netIncome).reverse();
  const fcfSeries = cash.map((row) => row.freeCashFlow).reverse();

  const exportStatements = () => {
    exportToCsv('statements.csv', [
      ['Period', 'Revenue', 'EBITDA', 'Net Income', 'Cash', 'Total Debt', 'Free Cash Flow'],
      ...rows.map((row) => [row.date, row.revenue, row.ebitda, row.netIncome, row.cash, row.debt, row.fcf]),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Latest Revenue" value={formatCurrency(income[0]?.revenue)} />
        <Stat label="Latest EBITDA" value={formatCurrency(income[0]?.ebitda)} />
        <Stat label="Latest Net Income" value={formatCurrency(income[0]?.netIncome)} />
        <Stat label="Latest FCF" value={formatCurrency(cash[0]?.freeCashFlow)} />
      </div>
      <Card title="Statement Snapshot">
        <div className="flex justify-end mb-2">
          <Button className="bg-slate-700 hover:bg-slate-600" onClick={exportStatements}>
            Export CSV
          </Button>
        </div>
        <Table
          columns={[
            { key: 'date', label: 'Period' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'ebitda', label: 'EBITDA' },
            { key: 'netIncome', label: 'Net Income' },
            { key: 'cash', label: 'Cash' },
            { key: 'debt', label: 'Total Debt' },
            { key: 'fcf', label: 'Free Cash Flow' },
          ]}
          rows={rows}
        />
      </Card>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Revenue">
          <LineChart
            labels={labels}
            datasets={[
              {
                label: 'Revenue',
                data: revenueSeries,
                borderColor: '#38bdf8',
              },
            ]}
          />
        </Card>
        <Card title="EBITDA">
          <LineChart
            labels={labels}
            datasets={[
              {
                label: 'EBITDA',
                data: ebitdaSeries,
                borderColor: '#22c55e',
              },
            ]}
          />
        </Card>
        <Card title="Net Income">
          <LineChart
            labels={labels}
            datasets={[
              {
                label: 'Net Income',
                data: netIncomeSeries,
                borderColor: '#f97316',
              },
            ]}
          />
        </Card>
        <Card title="Free Cash Flow">
          <LineChart
            labels={labels}
            datasets={[
              {
                label: 'FCF',
                data: fcfSeries,
                borderColor: '#a855f7',
              },
            ]}
          />
        </Card>
      </div>
      <Card title="Price History">
        <LineChart
          labels={data.prices.map((row) => row.date)}
          datasets={[
            {
              label: 'Price',
              data: data.prices.map((row) => row.close),
              borderColor: '#facc15',
            },
          ]}
          height={160}
        />
        <p className="text-xs text-slate-400 mt-2">
          Latest close: {formatNumber(data.prices[data.prices.length - 1]?.close, 2)}
        </p>
      </Card>
    </div>
  );
}
