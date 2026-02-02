# Analyst Toolkit

Production-ready, client-side-only valuation toolkit with demo data and optional live Yahoo Finance data via a user-provided CORS proxy. All data stays in the browser (localStorage cache) with zero backend.

## Features
- Demo Mode (works offline) with realistic income, balance sheet, cash flow, and price history data.
- Live Mode via a user-provided CORS proxy for Yahoo Finance.
- Modules: Data, Ratios, Forecast, DCF, LBO, Comps, M&A, Capital.
- Chart.js charts, CSV exports, assumptions panel, data quality warnings.
- Caching with TTL and manual refresh/clear cache.
- `selfCheck()` helper in browser console.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages Deployment (Vite)

1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` folder to GitHub Pages. The Vite config uses `base: './'` for static hosting.

### GitHub Actions (Pages)

This repo ships with `.github/workflows/deploy.yml` which builds the Vite app and deploys `dist/` to GitHub Pages on pushes to `main`, `master`, or `work`, plus manual runs.

## Live Mode Proxy Requirements

Provide a CORS proxy base URL in the sidebar (saved in localStorage). The app calls:

- Quote summary:
  ```
  {PROXY_BASE}/quoteSummary/{TICKER}?modules=incomeStatementHistory,balanceSheetHistory,cashflowStatementHistory,defaultKeyStatistics,price
  ```
- Price history:
  ```
  {PROXY_BASE}/chart/{TICKER}?range=5y&interval=1d
  ```

If live requests fail or rate limit, the app falls back to Demo data and shows warnings.

## Demo Mode

Use Demo Mode for a complete offline workflow with bundled JSON data for a sample company.

## Console Self Check

Open dev tools and run:

```js
selfCheck()
```

It prints key data availability flags in the console.
