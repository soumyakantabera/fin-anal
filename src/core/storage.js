const CACHE_PREFIX = 'analyst-cache:';
const SETTINGS_KEY = 'analyst-settings';

export const loadSettings = () => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : {};
};

export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const cacheKey = (ticker, endpoint, period) => `${CACHE_PREFIX}${ticker}:${endpoint}:${period}`;

export const readCache = (key, ttlMs) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (Date.now() - parsed.timestamp > ttlMs) return null;
  return parsed;
};

export const writeCache = (key, payload) => {
  localStorage.setItem(key, JSON.stringify({
    ...payload,
    timestamp: Date.now(),
  }));
};

export const clearCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};
