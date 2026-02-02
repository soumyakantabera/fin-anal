import { safeDivide } from '../core/utils.js';

export const computeDcf = ({ forecast, assumptions }) => {
  const taxRate = assumptions.taxRate || 0.23;
  const wacc = assumptions.wacc || 0.1;
  const terminalGrowth = assumptions.terminalGrowth || 0.02;

  const cashflows = forecast.map((year) => {
    const unleveredFcf = (year.ebit || 0) * (1 - taxRate) + (year.dAndA || 0) - (year.capex || 0) - (year.nwc || 0);
    return {
      ...year,
      unleveredFcf,
    };
  });

  const discounted = cashflows.map((year, index) => ({
    ...year,
    pv: year.unleveredFcf / (1 + wacc) ** (index + 1),
  }));

  const terminalValue = cashflows.length
    ? (cashflows[cashflows.length - 1].unleveredFcf * (1 + terminalGrowth)) / (wacc - terminalGrowth)
    : 0;
  const terminalPv = terminalValue / (1 + wacc) ** cashflows.length;
  const enterpriseValue = discounted.reduce((sum, item) => sum + item.pv, 0) + terminalPv;

  return {
    cashflows,
    discounted,
    terminalValue,
    terminalPv,
    enterpriseValue,
    equityValue: null,
    impliedPrice: null,
    wacc,
    terminalGrowth,
  };
};

export const buildSensitivity = ({ waccs, terminalGrowths, baseForecast, assumptions }) => {
  return waccs.map((wacc) =>
    terminalGrowths.map((growth) => {
      const result = computeDcf({ forecast: baseForecast, assumptions: { ...assumptions, wacc, terminalGrowth: growth } });
      return result.enterpriseValue;
    })
  );
};

export const computeEquityValue = ({ enterpriseValue, netDebt, sharesOutstanding }) => {
  const equityValue = enterpriseValue - (netDebt || 0);
  return {
    equityValue,
    impliedPrice: safeDivide(equityValue, sharesOutstanding),
  };
};
