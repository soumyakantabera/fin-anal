import React from 'react';
import { Card, Stat, Button } from '../components.jsx';
import { computeMA } from '../../modules/ma.js';
import { exportToCsv, formatCurrency, formatPercent } from '../../core/utils.js';

export default function MaModule({ data, assumptions }) {
  const acquirer = {
    ebitda: data.years[0]?.ebitda,
    netIncome: data.years[0]?.netIncome,
    netDebt: (data.balanceYears[0]?.totalDebt || 0) - (data.balanceYears[0]?.cash || 0),
    shares: data.balanceYears[0]?.sharesOutstanding || 1,
    eps: (data.years[0]?.netIncome || 0) / (data.balanceYears[0]?.sharesOutstanding || 1),
  };
  const target = {
    marketCap: 65000,
    ebitda: 12000,
    netIncome: 6500,
    netDebt: 12000,
  };

  const result = computeMA({ acquirer, target, assumptions });
  const exportDeal = () => {
    exportToCsv('ma-summary.csv', [
      ['Metric', 'Value'],
      ['Purchase Price', result.purchasePrice],
      ['Cash Used', result.cashUsed],
      ['Stock Used', result.stockUsed],
      ['Debt Used', result.debtUsed],
      ['Pro Forma EBITDA', result.proFormaEbitda],
      ['Pro Forma Net Debt', result.proFormaNetDebt],
      ['Accretion', result.accretion],
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Purchase Price" value={formatCurrency(result.purchasePrice)} />
        <Stat label="Pro Forma EBITDA" value={formatCurrency(result.proFormaEbitda)} />
        <Stat label="Accretion/Dilution" value={formatPercent(result.accretion)} />
      </div>
      <Card title="Deal Mix">
        <div className="flex justify-end mb-2">
          <Button className="bg-slate-700 hover:bg-slate-600" onClick={exportDeal}>
            Export CSV
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-900 rounded p-3">Cash: {formatCurrency(result.cashUsed)}</div>
          <div className="bg-slate-900 rounded p-3">Stock: {formatCurrency(result.stockUsed)}</div>
          <div className="bg-slate-900 rounded p-3">Debt: {formatCurrency(result.debtUsed)}</div>
        </div>
      </Card>
    </div>
  );
}
