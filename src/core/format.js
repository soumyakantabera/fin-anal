import { formatCurrency, formatNumber, formatPercent } from './utils.js';

export const formatValue = (value, type, currency) => {
  if (type === 'currency') return formatCurrency(value, currency);
  if (type === 'percent') return formatPercent(value);
  return formatNumber(value);
};
