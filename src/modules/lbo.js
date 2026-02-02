import { safeDivide } from '../core/utils.js';

export const computeLbo = ({ forecast, assumptions }) => {
  const entryMultiple = assumptions.entryMultiple || 8;
  const exitMultiple = assumptions.exitMultiple || 9;
  const debtPercent = assumptions.debtPercent || 0.6;
  const fees = assumptions.fees || 0.02;
  const entryEbitda = forecast[0]?.ebitda || 0;
  const entryEnterpriseValue = entryEbitda * entryMultiple;
  const totalUses = entryEnterpriseValue * (1 + fees);
  const debt = totalUses * debtPercent;
  const equity = totalUses - debt;

  let debtBalance = debt;
  const debtSchedule = forecast.map((year) => {
    const amort = debtBalance * (assumptions.amortPercent || 0.1);
    debtBalance = Math.max(0, debtBalance - amort);
    return {
      year: year.year,
      debtBalance,
    };
  });

  const exitEnterpriseValue = (forecast[forecast.length - 1]?.ebitda || 0) * exitMultiple;
  const exitEquityValue = exitEnterpriseValue - debtBalance;
  const irr = Math.pow(exitEquityValue / equity, 1 / forecast.length) - 1;

  return {
    entryEnterpriseValue,
    debt,
    equity,
    debtSchedule,
    exitEnterpriseValue,
    exitEquityValue,
    irr,
    mom: safeDivide(exitEquityValue, equity),
  };
};
