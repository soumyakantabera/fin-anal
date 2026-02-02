import React from 'react';
import { Card, LineChart, Table, Button } from '../components.jsx';
import { buildForecast } from '../../modules/forecast.js';
import { exportToCsv, formatCurrency } from '../../core/utils.js';

export default function ForecastModule({ data, assumptions }) {
  const forecast = buildForecast({ baseIncome: data.years, assumptions });

  const exportForecast = () => {
    exportToCsv('forecast.csv', [
      ['Year', 'Revenue', 'EBITDA', 'EBIT', 'D&A', 'Capex', 'NWC'],
      ...forecast.map((row) => [row.year, row.revenue, row.ebitda, row.ebit, row.dAndA, row.capex, row.nwc]),
    ]);
  };
  return (
    <div className="space-y-6">
      <Card title="Forecast (5-Year)">
        <LineChart
          labels={forecast.map((row) => row.year)}
          datasets={[
            {
              label: 'Revenue',
              data: forecast.map((row) => row.revenue),
              borderColor: '#38bdf8',
            },
            {
              label: 'EBITDA',
              data: forecast.map((row) => row.ebitda),
              borderColor: '#22c55e',
            },
          ]}
        />
      </Card>
      <Card title="Forecast Table">
        <div className="flex justify-end mb-2">
          <Button className="bg-slate-700 hover:bg-slate-600" onClick={exportForecast}>
            Export CSV
          </Button>
        </div>
        <Table
          columns={[
            { key: 'year', label: 'Year' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'ebitda', label: 'EBITDA' },
            { key: 'ebit', label: 'EBIT' },
            { key: 'capex', label: 'Capex' },
          ]}
          rows={forecast.map((row) => ({
            id: row.year,
            year: row.year,
            revenue: formatCurrency(row.revenue),
            ebitda: formatCurrency(row.ebitda),
            ebit: formatCurrency(row.ebit),
            capex: formatCurrency(row.capex),
          }))}
        />
      </Card>
    </div>
  );
}
