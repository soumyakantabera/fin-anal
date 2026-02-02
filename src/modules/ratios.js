import { safeDivide } from '../core/utils.js';

export const computeRatios = ({ income, balance, cash }) => {
  return income.map((row, index) => {
    const balanceRow = balance[index] || {};
    const cashRow = cash[index] || {};
    const revenue = row.revenue;
    const ebitda = row.ebitda;
    const ebit = row.ebit;
    const netIncome = row.netIncome;
    const totalAssets = balanceRow.totalAssets;
    const totalEquity = balanceRow.totalEquity;
    const totalLiabilities = balanceRow.totalLiabilities;
    const totalCurrentAssets = balanceRow.totalCurrentAssets;
    const totalCurrentLiabilities = balanceRow.totalCurrentLiabilities;
    const cashValue = balanceRow.cash;
    const totalDebt = balanceRow.totalDebt;
    const interestExpense = row.interestExpense;
    const freeCashFlow = cashRow.freeCashFlow;

    const investedCapital = (totalAssets || 0) - (totalCurrentLiabilities || 0);
    const nopat = ebit !== null && ebit !== undefined ? ebit * 0.75 : null;

    return {
      date: row.date,
      revenueCagr: null,
      ebitdaMargin: safeDivide(ebitda, revenue),
      ebitMargin: safeDivide(ebit, revenue),
      grossMargin: safeDivide(row.grossProfit, revenue),
      roe: safeDivide(netIncome, totalEquity),
      roa: safeDivide(netIncome, totalAssets),
      roic: safeDivide(nopat, investedCapital),
      currentRatio: safeDivide(totalCurrentAssets, totalCurrentLiabilities),
      quickRatio: safeDivide((cashValue || 0) + ((totalCurrentAssets || 0) - (cashValue || 0)), totalCurrentLiabilities),
      debtToEbitda: safeDivide(totalDebt, ebitda),
      netDebtToEbitda: safeDivide((totalDebt || 0) - (cashValue || 0), ebitda),
      debtToEquity: safeDivide(totalDebt, totalEquity),
      interestCoverage: safeDivide(ebit, interestExpense),
      fcfMargin: safeDivide(freeCashFlow, revenue),
      fcfConversion: safeDivide(freeCashFlow, netIncome),
    };
  });
};
