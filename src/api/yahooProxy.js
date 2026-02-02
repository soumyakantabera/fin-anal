import { fetchWithRetry } from '../core/utils.js';

const parseYahooQuoteSummary = (data) => {
  const summary = data?.quoteSummary?.result?.[0] || data?.result?.[0] || {};
  return summary;
};

export const fetchQuoteSummary = async (proxyBase, ticker) => {
  const url = `${proxyBase.replace(/\/$/, '')}/quoteSummary/${ticker}?modules=incomeStatementHistory,balanceSheetHistory,cashflowStatementHistory,defaultKeyStatistics,price`;
  return fetchWithRetry(url);
};

export const fetchChart = async (proxyBase, ticker) => {
  const url = `${proxyBase.replace(/\/$/, '')}/chart/${ticker}?range=5y&interval=1d`;
  return fetchWithRetry(url);
};

export const adaptYahooPayload = (quotePayload, chartPayload) => {
  const summary = parseYahooQuoteSummary(quotePayload);
  return {
    summary,
    chart: chartPayload?.chart?.result?.[0] || chartPayload?.result?.[0] || {},
  };
};
