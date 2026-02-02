import { safeDivide } from '../core/utils.js';

export const computeCapm = ({ riskFree = 0.04, beta = 1.1, erp = 0.05 }) => riskFree + beta * erp;

export const computeWacc = ({ costOfEquity, costOfDebt, taxRate = 0.23, debtWeight = 0.4 }) => {
  const equityWeight = 1 - debtWeight;
  return costOfEquity * equityWeight + costOfDebt * (1 - taxRate) * debtWeight;
};

export const mapRatingToSpread = (rating, scorecard) => {
  return scorecard[rating] ?? 0.02;
};

export const computeCostOfDebt = ({ riskFree, spread }) => riskFree + spread;

export const computeTargetLeverage = ({ debt, ebitda }) => safeDivide(debt, ebitda);
