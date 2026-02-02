import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppRouter from './ui/router.jsx';
import { Button, Pill, SelectInput, TextInput } from './ui/components.jsx';
import { loadSettings, saveSettings, readCache, writeCache, cacheKey, clearCache } from './core/storage.js';
import { adaptYahooPayload, fetchChart, fetchQuoteSummary } from './api/yahooProxy.js';
import { normalizeDemo, normalizeYahoo } from './normalize/normalize.js';
import { exportToCsv } from './core/utils.js';

import sampleMeta from './data/sample_company_meta.json';
import sampleIncome from './data/sample_income.json';
import sampleBalance from './data/sample_balance.json';
import sampleCashflow from './data/sample_cashflow.json';
import samplePrices from './data/sample_prices.json';

const demoData = {
  meta: sampleMeta,
  incomeAnnual: sampleIncome.annual,
  incomeQuarterly: sampleIncome.quarterly,
  balanceAnnual: sampleBalance.annual,
  balanceQuarterly: sampleBalance.quarterly,
  cashflowAnnual: sampleCashflow.annual,
  cashflowQuarterly: sampleCashflow.quarterly,
  prices: samplePrices.prices,
};

const defaultAssumptions = {
  revenueGrowth: 0.06,
  ebitdaMargin: 0.28,
  ebitMargin: 0.2,
  daPercent: 0.03,
  capexPercent: 0.04,
  nwcPercent: 0.02,
  taxRate: 0.23,
  wacc: 0.1,
  terminalGrowth: 0.025,
  entryMultiple: 8,
  exitMultiple: 9,
  debtPercent: 0.6,
  amortPercent: 0.1,
  premium: 0.25,
  cashMix: 0.5,
  stockMix: 0.3,
  debtMix: 0.2,
  riskFree: 0.04,
  beta: 1.1,
  erp: 0.05,
  targetLeverage: 0.4,
};

const navItems = [
  { path: '/data', label: 'Data' },
  { path: '/ratios', label: 'Ratios' },
  { path: '/forecast', label: 'Forecast' },
  { path: '/dcf', label: 'DCF' },
  { path: '/lbo', label: 'LBO' },
  { path: '/comps', label: 'Comps' },
  { path: '/ma', label: 'M&A' },
  { path: '/capital', label: 'Capital' },
];

export default function App() {
  const location = useLocation();
  const stored = loadSettings();
  const [ticker, setTicker] = useState(stored.ticker || 'AAPL');
  const [mode, setMode] = useState(stored.mode || 'demo');
  const [proxyBase, setProxyBase] = useState(stored.proxyBase || '');
  const [period, setPeriod] = useState(stored.period || 'annual');
  const [scenario, setScenario] = useState(stored.scenario || 'Base');
  const [assumptions, setAssumptions] = useState(stored.assumptions || defaultAssumptions);
  const [dataState, setDataState] = useState({
    status: 'idle',
    payload: normalizeDemo(demoData),
    warnings: [],
    source: 'Demo',
    lastFetch: null,
  });

  const cacheTtl = 1000 * 60 * 60 * 12;

  const updateSettings = (next) => {
    saveSettings({
      ticker,
      mode,
      proxyBase,
      period,
      scenario,
      assumptions,
      ...next,
    });
  };

  const loadData = async ({ refresh = false } = {}) => {
    if (mode === 'demo') {
      setDataState({
        status: 'ready',
        payload: normalizeDemo(demoData),
        warnings: ['Demo mode enabled. No live data requested.'],
        source: 'Demo',
        lastFetch: new Date().toISOString(),
      });
      return;
    }

    if (!proxyBase) {
      setDataState((prev) => ({
        ...prev,
        status: 'error',
        warnings: ['Proxy base URL is required for live mode.'],
        source: 'Demo',
      }));
      return;
    }

    const key = cacheKey(ticker, 'summary', period);
    const cached = !refresh ? readCache(key, cacheTtl) : null;
    if (cached) {
      setDataState({
        status: 'ready',
        payload: cached.payload,
        warnings: cached.warnings || [],
        source: 'Cache',
        lastFetch: new Date(cached.timestamp).toISOString(),
      });
      return;
    }

    try {
      setDataState((prev) => ({ ...prev, status: 'loading' }));
      const [quotePayload, chartPayload] = await Promise.all([
        fetchQuoteSummary(proxyBase, ticker),
        fetchChart(proxyBase, ticker),
      ]);
      const normalized = normalizeYahoo(adaptYahooPayload(quotePayload, chartPayload), []);
      const warnings = normalized.warnings || [];
      const payload = normalized;
      writeCache(key, { payload, warnings });
      setDataState({
        status: 'ready',
        payload,
        warnings,
        source: 'Live',
        lastFetch: new Date().toISOString(),
      });
    } catch (error) {
      setDataState({
        status: 'error',
        payload: normalizeDemo(demoData),
        warnings: [
          `Live data failed (${error.status || 'network'}). Falling back to Demo mode.`,
        ],
        source: 'Demo',
        lastFetch: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [mode, ticker, proxyBase]);

  useEffect(() => {
    window.selfCheck = () => {
      const payload = dataState.payload || {};
      const checks = {
        hasIncome: (payload.years || []).length > 0,
        hasBalance: (payload.balanceYears || []).length > 0,
        hasCashflow: (payload.cashYears || []).length > 0,
        hasPrices: (payload.prices || []).length > 0,
      };
      console.table(checks);
      return checks;
    };
  }, [dataState.payload]);

  const activeData = dataState.payload;

  const warnings = useMemo(() => dataState.warnings || [], [dataState.warnings]);

  const assumptionsMeta = [
    { key: 'revenueGrowth', label: 'Revenue Growth', tip: 'Annual growth rate for the forecast.' },
    { key: 'ebitdaMargin', label: 'EBITDA Margin', tip: 'Target EBITDA margin in forecast.' },
    { key: 'ebitMargin', label: 'EBIT Margin', tip: 'Target EBIT margin in forecast.' },
    { key: 'daPercent', label: 'D&A % Revenue', tip: 'Depreciation & amortization as % of revenue.' },
    { key: 'capexPercent', label: 'Capex % Revenue', tip: 'Capital expenditures as % of revenue.' },
    { key: 'nwcPercent', label: 'NWC % Revenue', tip: 'Net working capital investment as % of revenue.' },
    { key: 'taxRate', label: 'Tax Rate', tip: 'Effective cash tax rate.' },
    { key: 'wacc', label: 'WACC', tip: 'Weighted average cost of capital.' },
    { key: 'terminalGrowth', label: 'Terminal Growth', tip: 'Perpetuity growth for terminal value.' },
    { key: 'entryMultiple', label: 'Entry EV/EBITDA', tip: 'Entry multiple for LBO purchase price.' },
    { key: 'exitMultiple', label: 'Exit EV/EBITDA', tip: 'Exit multiple in LBO.' },
    { key: 'debtPercent', label: 'Debt %', tip: 'Debt as % of total sources.' },
    { key: 'amortPercent', label: 'Amort %', tip: 'Annual amortization of debt.' },
    { key: 'premium', label: 'M&A Premium', tip: 'Offer premium over target market cap.' },
    { key: 'cashMix', label: 'Cash Mix', tip: 'Cash financing mix in M&A.' },
    { key: 'stockMix', label: 'Stock Mix', tip: 'Stock financing mix in M&A.' },
    { key: 'debtMix', label: 'Debt Mix', tip: 'Debt financing mix in M&A.' },
    { key: 'riskFree', label: 'Risk-Free Rate', tip: 'Risk-free rate for CAPM.' },
    { key: 'beta', label: 'Beta', tip: 'Equity beta for CAPM.' },
    { key: 'erp', label: 'Equity Risk Premium', tip: 'Equity risk premium for CAPM.' },
    { key: 'targetLeverage', label: 'Target Leverage', tip: 'Debt weight for WACC.' },
  ];

  const onAssumptionChange = (key, value) => {
    const parsed = Number(value);
    const next = {
      ...assumptions,
      [key]: Number.isNaN(parsed) ? value : parsed,
    };
    setAssumptions(next);
    updateSettings({ assumptions: next });
  };

  const exportAssumptions = () => {
    exportToCsv('assumptions.csv', [
      ['Assumption', 'Value'],
      ...assumptionsMeta.map(({ key, label }) => [label, assumptions[key]]),
    ]);
  };

  const nav = (
    <nav className="flex gap-3 text-sm">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`rounded px-3 py-2 ${
            location.pathname === item.path ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-semibold">Analyst Toolkit</h1>
          <p className="text-sm text-slate-400">Client-side valuation workspace</p>
        </div>
        {nav}
      </header>
      <div className="grid lg:grid-cols-[280px_1fr] gap-6 p-6">
        <aside className="space-y-4">
          <div className="bg-panel rounded-lg p-4 space-y-3">
            <TextInput
              label="Ticker"
              value={ticker}
              onChange={(event) => {
                setTicker(event.target.value.toUpperCase());
                updateSettings({ ticker: event.target.value.toUpperCase() });
              }}
            />
            <SelectInput
              label="Mode"
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                updateSettings({ mode: event.target.value });
              }}
              options={[
                { label: 'Demo', value: 'demo' },
                { label: 'Live', value: 'live' },
              ]}
            />
            <TextInput
              label="Proxy Base URL"
              value={proxyBase}
              onChange={(event) => {
                setProxyBase(event.target.value);
                updateSettings({ proxyBase: event.target.value });
              }}
            />
            <SelectInput
              label="Period"
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                updateSettings({ period: event.target.value });
              }}
              options={[
                { label: 'Annual', value: 'annual' },
                { label: 'Quarterly', value: 'quarterly' },
              ]}
            />
            <SelectInput
              label="Scenario"
              value={scenario}
              onChange={(event) => {
                setScenario(event.target.value);
                updateSettings({ scenario: event.target.value });
              }}
              options={[
                { label: 'Base', value: 'Base' },
                { label: 'Upside', value: 'Upside' },
                { label: 'Downside', value: 'Downside' },
              ]}
            />
            <div className="flex gap-2">
              <Button onClick={() => loadData({ refresh: true })}>Refresh Data</Button>
              <Button
                className="bg-slate-700 hover:bg-slate-600"
                onClick={() => {
                  clearCache();
                  loadData();
                }}
              >
                Clear Cache
              </Button>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>
                Source: <Pill>{dataState.source}</Pill>
              </div>
              <div>Currency: {activeData.meta?.currency || 'USD'}</div>
              <div>Last fetch: {dataState.lastFetch || '—'}</div>
              <div>Status: {dataState.status}</div>
            </div>
          </div>
          <div className="bg-panel rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Assumptions</h2>
              <Button className="bg-slate-700 hover:bg-slate-600" onClick={exportAssumptions}>
                Export CSV
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {assumptionsMeta.map(({ key, label, tip }) => (
                <TextInput
                  key={key}
                  label={`${label} (Explain)`}
                  title={tip}
                  value={assumptions[key]}
                  onChange={(event) => onAssumptionChange(key, event.target.value)}
                />
              ))}
            </div>
          </div>
          <div className="bg-panel rounded-lg p-4 space-y-2">
            <h2 className="text-sm font-semibold">Warnings & Data Quality</h2>
            <ul className="text-xs text-amber-300 space-y-1">
              {warnings.length === 0 ? <li>No warnings</li> : warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          </div>
        </aside>
        <main className="space-y-6">
          <AppRouter
            data={activeData}
            period={period}
            scenario={scenario}
            assumptions={assumptions}
          />
        </main>
      </div>
    </div>
  );
}
