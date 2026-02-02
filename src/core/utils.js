export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(1)}%`;
};

export const formatNumber = (value, digits = 0) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
  }).format(value);
};

export const safeDivide = (num, den) => {
  if (den === 0 || den === null || den === undefined) return null;
  return num / den;
};

export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 400) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const message = await response.text();
        const error = new Error(`Request failed: ${response.status}`);
        error.status = response.status;
        error.body = message;
        throw error;
      }
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(backoff * 2 ** attempt);
      }
    }
  }
  throw lastError;
};

export const csvEscape = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportToCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
