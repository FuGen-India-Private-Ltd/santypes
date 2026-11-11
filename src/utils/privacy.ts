// Santypes Privacy, Consent & Data Governance Controller
// Implements opt-in analytics gating, PII stripping, export, and full local data erasure
// Aligned with DPDP Act 2023 (India), IT Act 2000 Sec 43A / IT Rules 2011, and GDPR/ePrivacy

import {
  safeStorageGetItem,
  safeStorageRemoveItem,
  safeStorageSetItem,
} from './html.ts';

export const GA_MEASUREMENT_ID = 'G-3K423FWC7P';
export const PRIVACY_CONSENT_KEY = 'santypes_privacy_consent_v1';
export const PRIVACY_POLICY_VERSION = '2026-11';

export const APP_STORAGE_KEYS = [
  'santypes_test_history',
  'santypes_curriculum_progress',
  'santypes_custom_lessons',
  'santypes_user_settings',
  'santypes_account_state',
  'santypes_feedback_history_v1',
  PRIVACY_CONSENT_KEY,
] as const;

export type ConsentStatus = 'unset' | 'granted' | 'denied';

export interface PrivacyConsentRecord {
  status: ConsentStatus;
  version: string;
  updatedAt: string;
}

type GtagFn = (...args: unknown[]) => void;

interface WindowWithAnalytics extends Window {
  dataLayer?: unknown[];
  gtag?: GtagFn;
  [key: string]: unknown;
}

let gaScriptInjected = false;

export function isGlobalPrivacyControlEnabled(): boolean {
  try {
    if (typeof navigator !== 'undefined') {
      return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    }
  } catch {
    // Ignore restricted navigator environments
  }
  return false;
}

export function getAnalyticsConsent(): PrivacyConsentRecord {
  const raw = safeStorageGetItem(PRIVACY_CONSENT_KEY);
  if (!raw) {
    return {
      status: isGlobalPrivacyControlEnabled() ? 'denied' : 'unset',
      version: PRIVACY_POLICY_VERSION,
      updatedAt: '',
    };
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed.status === 'granted' || parsed.status === 'denied' || parsed.status === 'unset')
    ) {
      const effectiveStatus: ConsentStatus =
        parsed.status === 'unset' && isGlobalPrivacyControlEnabled() ? 'denied' : parsed.status;
      return {
        status: effectiveStatus,
        version: typeof parsed.version === 'string' ? parsed.version : PRIVACY_POLICY_VERSION,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      };
    }
  } catch {
    // Ignore malformed stored consent record
  }
  return {
    status: isGlobalPrivacyControlEnabled() ? 'denied' : 'unset',
    version: PRIVACY_POLICY_VERSION,
    updatedAt: '',
  };
}

export function getAnalyticsConsentStatus(): ConsentStatus {
  return getAnalyticsConsent().status;
}

function setGaDisableFlag(disabled: boolean): void {
  if (typeof window === 'undefined') return;
  (window as unknown as WindowWithAnalytics)[`ga-disable-${GA_MEASUREMENT_ID}`] = disabled;
}

function ensureGtagQueueInitialized(): GtagFn | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as WindowWithAnalytics;
  win.dataLayer = Array.isArray(win.dataLayer) ? win.dataLayer : [];
  if (typeof win.gtag !== 'function') {
    win.gtag = function gtag(...args: unknown[]) {
      win.dataLayer!.push(args);
    };
  }
  return win.gtag;
}

function loadGtagScript(): void {
  if (typeof document === 'undefined' || gaScriptInjected) return;
  const gtag = ensureGtagQueueInitialized();
  if (!gtag) return;

  setGaDisableFlag(false);
  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  if (!document.querySelector('script[data-santypes-ga="true"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    script.setAttribute('data-santypes-ga', 'true');
    document.head.appendChild(script);
  }
  gaScriptInjected = true;
}

function expireGoogleAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;
  try {
    const cookieNames = document.cookie
      .split(';')
      .map((c) => c.trim().split('=')[0])
      .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name === '_gat');

    const hostParts = (window.location?.hostname || '').split('.').filter(Boolean);
    const domainCandidates = [''];
    if (hostParts.length >= 2) {
      domainCandidates.push(`.${hostParts.slice(-2).join('.')}`);
    }

    for (const name of cookieNames) {
      for (const dom of domainCandidates) {
        const domainAttr = dom ? `; domain=${dom}` : '';
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}; SameSite=Lax`;
      }
    }
  } catch {
    // Cookie access may be blocked in restricted contexts
  }
}

export function initPrivacyAndConsent(): ConsentStatus {
  const status = getAnalyticsConsentStatus();
  if (status === 'granted') {
    loadGtagScript();
  } else {
    setGaDisableFlag(true);
    expireGoogleAnalyticsCookies();
  }
  return status;
}

export function grantAnalyticsConsent(): PrivacyConsentRecord {
  const record: PrivacyConsentRecord = {
    status: 'granted',
    version: PRIVACY_POLICY_VERSION,
    updatedAt: new Date().toISOString(),
  };
  safeStorageSetItem(PRIVACY_CONSENT_KEY, JSON.stringify(record));
  loadGtagScript();
  const win = typeof window !== 'undefined' ? (window as unknown as WindowWithAnalytics) : null;
  if (win && typeof win.gtag === 'function') {
    win.gtag('consent', 'update', { analytics_storage: 'granted' });
  }
  dispatchConsentUpdated(record);
  return record;
}

export function denyAnalyticsConsent(): PrivacyConsentRecord {
  const record: PrivacyConsentRecord = {
    status: 'denied',
    version: PRIVACY_POLICY_VERSION,
    updatedAt: new Date().toISOString(),
  };
  safeStorageSetItem(PRIVACY_CONSENT_KEY, JSON.stringify(record));
  setGaDisableFlag(true);
  const win = typeof window !== 'undefined' ? (window as unknown as WindowWithAnalytics) : null;
  if (win && typeof win.gtag === 'function') {
    win.gtag('consent', 'update', { analytics_storage: 'denied' });
  }
  expireGoogleAnalyticsCookies();
  dispatchConsentUpdated(record);
  return record;
}

function dispatchConsentUpdated(record: PrivacyConsentRecord): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('santypes:consent-updated', { detail: record }));
  }
}

/**
 * Emits anonymous telemetry ONLY when user has explicitly opted in ('granted').
 * Only scalar primitives (no arbitrary objects/arrays or raw free text) are forwarded.
 */
export function trackAnalyticsEvent(
  eventName: string,
  params: Record<string, string | number | boolean> = {}
): boolean {
  if (getAnalyticsConsentStatus() !== 'granted') return false;
  if (typeof window === 'undefined') return false;
  const win = window as unknown as WindowWithAnalytics;
  if (typeof win.gtag !== 'function') return false;

  const safeParams: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!Object.hasOwn(params, k)) continue;
    if (typeof v === 'string') safeParams[k] = v.slice(0, 64);
    else if (typeof v === 'number' && Number.isFinite(v)) safeParams[k] = v;
    else if (typeof v === 'boolean') safeParams[k] = v;
  }

  win.gtag('event', eventName, safeParams);
  return true;
}

/**
 * DPDP Section 11 / GDPR Art. 15 & 20: Full export of all locally stored personal/telemetry data.
 */
export function collectAllLocalUserData(): Record<string, unknown> {
  const bundle: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    application: 'Santypes',
    storageScope: 'Browser localStorage (no server copy held)',
    data: {},
  };

  const dataSection: Record<string, unknown> = {};
  for (const key of APP_STORAGE_KEYS) {
    const raw = safeStorageGetItem(key);
    if (raw !== null) {
      try {
        dataSection[key] = JSON.parse(raw);
      } catch {
        dataSection[key] = raw;
      }
    }
  }
  bundle.data = dataSection;
  return bundle;
}

/**
 * DPDP Section 12 / GDPR Art. 17: Permanent erasure of all Santypes local browser data & cookies.
 */
export function eraseAllLocalUserData(): void {
  for (const key of APP_STORAGE_KEYS) {
    safeStorageRemoveItem(key);
  }
  setGaDisableFlag(true);
  expireGoogleAnalyticsCookies();
  gaScriptInjected = false;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('santypes:data-erased'));
    window.dispatchEvent(new CustomEvent('santypes:account-updated'));
  }
}

export function resetPrivacyStateForTesting(): void {
  gaScriptInjected = false;
  setGaDisableFlag(true);
}
