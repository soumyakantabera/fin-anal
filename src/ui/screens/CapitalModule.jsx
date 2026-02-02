import React from 'react';
import { Card, Stat, Button } from '../components.jsx';
import { computeCapm, computeCostOfDebt, computeWacc } from '../../modules/capital.js';
import { exportToCsv, formatPercent } from '../../core/utils.js';

export default function CapitalModule({ assumptions }) {
  const costOfEquity = computeCapm({
    riskFree: assumptions.riskFree,
    beta: assumptions.beta,
    erp: assumptions.erp,
  });
  const costOfDebt = computeCostOfDebt({
    riskFree: assumptions.riskFree,
    spread: 0.03,
  });
  const wacc = computeWacc({
    costOfEquity,
    costOfDebt,
    taxRate: assumptions.taxRate,
    debtWeight: assumptions.targetLeverage,
  });
  const exportCapital = () => {
    exportToCsv('capital.csv', [
      ['Metric', 'Value'],
      ['Cost of Equity', costOfEquity],
      ['Cost of Debt', costOfDebt],
      ['WACC', wacc],
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Cost of Equity" value={formatPercent(costOfEquity)} />
        <Stat label="Cost of Debt" value={formatPercent(costOfDebt)} />
        <Stat label="WACC" value={formatPercent(wacc)} />
      </div>
      <Card title="Credit Scorecard">
        <div className="flex justify-end mb-2">
          <Button className="bg-slate-700 hover:bg-slate-600" onClick={exportCapital}>
            Export CSV
          </Button>
        </div>
        <div className="text-sm text-slate-300 space-y-2">
          <p>Adjust rating spreads in the assumptions panel to refine cost of debt.</p>
          <p>Target leverage impacts the WACC calculation for scenarios.</p>
        </div>
      </Card>
    </div>
  );
}
