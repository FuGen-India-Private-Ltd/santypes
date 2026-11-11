// Shared HTML Escaping, Input Clamping, Storage & Date Safety Utilities
// Zero-dependency defense against DOM XSS, NaN/Infinity propagation, and Storage crashes

const FORBIDDEN_PROTO_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  'toString',
  'valueOf',
  'hasOwnProperty',
]);

export function isSafeRecordKey(key: unknown): key is string {
  return typeof key === 'string' && key.length > 0 && !FORBIDDEN_PROTO_KEYS.has(key);
}

export function escapeHTML(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function finiteNumber(
  value: unknown,
  fallback: number,
  min?: number,
  max?: number
): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  let result = num;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}

export function safeString(value: unknown, fallback: string = '', maxLen: number = 500): string {
  if (typeof value !== 'string') return fallback;
  return value.length > maxLen ? value.slice(0, maxLen) : value;
}

export function safeDateLabel(isoStr: unknown, fallback: string = 'Recent'): string {
  if (typeof isoStr !== 'string' || !isoStr.trim()) return fallback;
  try {
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return fallback;
    return (
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return fallback;
  }
}

export function safeShortDate(isoStr: unknown, fallback: string = ''): string {
  if (typeof isoStr !== 'string' || !isoStr.trim()) return fallback;
  try {
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return fallback;
  }
}

/** Local calendar YYYY-MM-DD key so streaks & daily challenges match the user's local midnight (e.g. IST). */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalYesterdayKey(now: Date = new Date()): string {
  const prev = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return getLocalDateKey(prev);
}

export function safeStorageGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Storage restricted in sandboxed/private environments
  }
  return null;
}

export function safeStorageSetItem(key: string, value: string): boolean {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return true;
    }
  } catch {
    // Storage quota exceeded or restricted
  }
  return false;
}

export function safeStorageRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore restricted environments
  }
}
