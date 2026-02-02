import { warnIfDerived, warnIfMissing } from '../core/validation.js';

const pickPeriodItems = (items = []) =>
  items.map((item) => ({
    date: item.endDate?.fmt || item.endDate || item.date || 'N/A',
    raw: item,
  }));

const getValue = (item, key) => {
  const value = item?.[key];
  if (value?.raw !== undefined) return value.raw;
  if (typeof value === 'number') return value;
  return null;
};

const mapIncome = (item, warnings) => {
  const revenue = getValue(item, 'totalRevenue');
  const grossProfit = getValue(item, 'grossProfit');
  const ebit = getValue(item, 'ebit');
  const ebitdaRaw = getValue(item, 'ebitda');
  const depreciation = getValue(item, 'depreciation');
  const ebitda = ebitdaRaw ?? (ebit !== null && depreciation !== null ? ebit + depreciation : null);
  warnIfDerived(ebitdaRaw === null && ebitda !== null, warnings, 'Derived EBITDA from EBIT + D&A');
  const interestExpense = getValue(item, 'interestExpense');
  const pretaxIncome = getValue(item, 'incomeBeforeTax');
  const incomeTaxExpense = getValue(item, 'incomeTaxExpense');
  const netIncome = getValue(item, 'netIncome');
  warnIfMissing(
    { revenue, grossProfit, ebit, netIncome },
    ['revenue', 'grossProfit', 'ebit', 'netIncome'],
    warnings,
    'Income statement'
  );
  return {
    revenue,
    grossProfit,
    ebit,
    ebitda,
    interestExpense,
    pretaxIncome,
    incomeTaxExpense,
    netIncome,
  };
};

const mapBalance = (item, warnings) => {
  const cash = getValue(item, 'cash') ?? getValue(item, 'cashAndCashEquivalents');
  const totalCurrentAssets = getValue(item, 'totalCurrentAssets');
  const totalAssets = getValue(item, 'totalAssets');
  const totalCurrentLiabilities = getValue(item, 'totalCurrentLiabilities');
  const totalLiabilities = getValue(item, 'totalLiabilities');
  const shortTermDebt = getValue(item, 'shortLongTermDebt') ?? getValue(item, 'shortTermDebt');
  const longTermDebt = getValue(item, 'longTermDebt');
  const totalDebt = getValue(item, 'totalDebt') ?? ((shortTermDebt || 0) + (longTermDebt || 0));
  warnIfDerived(getValue(item, 'totalDebt') === null && totalDebt !== null, warnings, 'Derived total debt from short + long term debt');
  const totalEquity = getValue(item, 'totalStockholderEquity');
  const sharesOutstanding = getValue(item, 'shareIssued') ?? getValue(item, 'sharesOutstanding');
  warnIfMissing(
    { cash, totalAssets, totalLiabilities, totalEquity },
    ['cash', 'totalAssets', 'totalLiabilities', 'totalEquity'],
    warnings,
    'Balance sheet'
  );
  return {
    cash,
    totalCurrentAssets,
    totalAssets,
    totalCurrentLiabilities,
    totalLiabilities,
    shortTermDebt,
    longTermDebt,
    totalDebt,
    totalEquity,
    sharesOutstanding,
  };
};

const mapCashflow = (item, warnings) => {
  const operatingCashFlow = getValue(item, 'totalCashFromOperatingActivities') ?? getValue(item, 'operatingCashFlow');
  const capex = getValue(item, 'capitalExpenditures') ?? getValue(item, 'capitalExpenditure');
  const freeCashFlow = getValue(item, 'freeCashFlow') ?? (operatingCashFlow !== null && capex !== null ? operatingCashFlow + capex : null);
  warnIfDerived(getValue(item, 'freeCashFlow') === null && freeCashFlow !== null, warnings, 'Derived FCF from operating cash flow + capex');
  const depreciationAmortization = getValue(item, 'depreciation') ?? getValue(item, 'depreciationAndAmortization');
  const dividendsPaid = getValue(item, 'dividendsPaid');
  warnIfMissing(
    { operatingCashFlow, capex, freeCashFlow },
    ['operatingCashFlow', 'capex', 'freeCashFlow'],
    warnings,
    'Cash flow'
  );
  return {
    operatingCashFlow,
    capex,
    freeCashFlow,
    depreciationAmortization,
    dividendsPaid,
  };
};

const mapPrices = (chart) => {
  const timestamps = chart?.timestamp || [];
  const closes = chart?.indicators?.quote?.[0]?.close || [];
  return timestamps.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
    close: closes[index] ?? null,
  })).filter((item) => item.close !== null);
};

export const normalizeYahoo = (payload, warnings = []) => {
  const incomeAnnual = pickPeriodItems(payload.summary?.incomeStatementHistory?.incomeStatementHistory || []);
  const balanceAnnual = pickPeriodItems(payload.summary?.balanceSheetHistory?.balanceSheetStatements || []);
  const cashAnnual = pickPeriodItems(payload.summary?.cashflowStatementHistory?.cashflowStatements || []);
  const incomeQuarterly = pickPeriodItems(payload.summary?.incomeStatementHistoryQuarterly?.incomeStatementHistory || []);
  const balanceQuarterly = pickPeriodItems(payload.summary?.balanceSheetHistoryQuarterly?.balanceSheetStatements || []);
  const cashQuarterly = pickPeriodItems(payload.summary?.cashflowStatementHistoryQuarterly?.cashflowStatements || []);

  const normalizePeriod = (items, mapper) =>
    items.map((item) => ({
      date: item.date,
      ...mapper(item.raw, warnings),
    }));

  return {
    years: normalizePeriod(incomeAnnual, mapIncome),
    quarters: normalizePeriod(incomeQuarterly, mapIncome),
    balanceYears: normalizePeriod(balanceAnnual, mapBalance),
    balanceQuarters: normalizePeriod(balanceQuarterly, mapBalance),
    cashYears: normalizePeriod(cashAnnual, mapCashflow),
    cashQuarters: normalizePeriod(cashQuarterly, mapCashflow),
    prices: mapPrices(payload.chart),
    meta: {
      currency: payload.summary?.price?.currency || 'USD',
      longName: payload.summary?.price?.longName || payload.summary?.price?.shortName || 'Unknown',
    },
    warnings,
  };
};

export const normalizeDemo = (demoData) => ({
  years: demoData.incomeAnnual,
  quarters: demoData.incomeQuarterly,
  balanceYears: demoData.balanceAnnual,
  balanceQuarters: demoData.balanceQuarterly,
  cashYears: demoData.cashflowAnnual,
  cashQuarters: demoData.cashflowQuarterly,
  prices: demoData.prices,
  meta: demoData.meta,
  warnings: [],
});
