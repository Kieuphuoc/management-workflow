export type ReportViewFilter = {
  department: string;
  status: 'all' | 'open' | 'closed';
  query: string;
};

const STORAGE_PREFIX = 'arito-report-view-filter-v1:';
const cache = new Map<string, ReportViewFilter | null>();
const listeners = new Map<string, Set<() => void>>();

export function getSavedReportFilter(userId: string): ReportViewFilter | null {
  if (cache.has(userId)) return cache.get(userId) ?? null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    const value = raw ? JSON.parse(raw) as ReportViewFilter : null;
    const valid = value && typeof value.department === 'string' && typeof value.query === 'string' && ['all', 'open', 'closed'].includes(value.status);
    cache.set(userId, valid ? value : null);
  } catch { cache.set(userId, null); }
  return cache.get(userId) ?? null;
}

export function subscribeSavedReportFilter(userId: string, listener: () => void) {
  const entries = listeners.get(userId) ?? new Set<() => void>();
  entries.add(listener);
  listeners.set(userId, entries);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== `${STORAGE_PREFIX}${userId}`) return;
    cache.delete(userId);
    entries.forEach(callback => callback());
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    entries.delete(listener);
    if (!entries.size) listeners.delete(userId);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

export function saveReportFilter(userId: string, value: ReportViewFilter) {
  cache.set(userId, value);
  try { localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(value)); } catch { /* Keep the current view usable when browser storage is unavailable. */ }
  listeners.get(userId)?.forEach(listener => listener());
}
