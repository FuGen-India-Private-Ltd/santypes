import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SessionResult } from '../src/core/types.ts';
import {
  escapeHTML,
  finiteNumber,
  getLocalDateKey,
  getLocalYesterdayKey,
  isSafeRecordKey,
  safeDateLabel,
  safeShortDate,
} from '../src/utils/html.ts';
import {
  collectAllLocalUserData,
  denyAnalyticsConsent,
  eraseAllLocalUserData,
  getAnalyticsConsentStatus,
  grantAnalyticsConsent,
  isGlobalPrivacyControlEnabled,
  resetPrivacyStateForTesting,
  trackAnalyticsEvent,
} from '../src/utils/privacy.ts';
import {
  calculateAccuracy,
  calculateBurstWpm,
  calculateConsistency,
  calculateNetWpm,
  calculateRawWpm,
  summarizeWeakKeys,
} from '../src/core/metrics.ts';
import {
  calculateSessionXp,
  getDailyChallenge,
  getLevelProgress,
} from '../src/core/gamification.ts';
import { TypingEngine } from '../src/core/engine.ts';
import { segmentGraphemes } from '../src/core/grapheme.ts';
import { getRecentWeakKeys, getTestHistory } from '../src/stubs/storage-stub.ts';
import {
  completeLessonChapter,
  getChapterProgress,
  getCustomLessons,
  saveCustomLesson,
} from '../src/stubs/curriculum-stub.ts';
import { getSettings } from '../src/stubs/settings-stub.ts';
import { getAccountState, processSessionCompletion } from '../src/stubs/account-stub.ts';
import {
  FAQ_ITEMS,
  TERMS_EFFECTIVE_DATE,
  TERMS_SECTIONS,
  TERMS_VERSION,
  filterFaqItems,
} from '../src/core/legal-content.ts';

const mockStore = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => mockStore.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mockStore.set(k, String(v));
    },
    removeItem: (k: string) => {
      mockStore.delete(k);
    },
    clear: () => {
      mockStore.clear();
    },
    key: (i: number) => Array.from(mockStore.keys())[i] ?? null,
    get length() {
      return mockStore.size;
    },
  },
  configurable: true,
});

describe('Security, Crash-Guard & Government IT Compliance Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    resetPrivacyStateForTesting();
  });

  it('neutralizes HTML injection payloads via escapeHTML', () => {
    const xss = `<img src=x onerror="alert('xss')"> & 'quotes'`;
    const escaped = escapeHTML(xss);
    expect(escaped).not.toContain('<');
    expect(escaped).not.toContain('>');
    expect(escaped).not.toContain('"');
    expect(escaped).not.toContain("'");
    expect(escapeHTML(null)).toBe('');
    expect(escapeHTML(undefined)).toBe('');
  });

  it('guards metric math & XP level calculations against NaN, Infinity & zero divisors', () => {
    expect(Number.isFinite(calculateNetWpm(100, 0, 1, 0))).toBe(true);
    expect(Number.isFinite(calculateRawWpm(100, 1, 0))).toBe(true);
    expect(Number.isFinite(calculateBurstWpm(10, 1.5, 0))).toBe(true);
    expect(Number.isFinite(calculateNetWpm(NaN, NaN, 1, 5))).toBe(true);
    expect(Number.isFinite(calculateAccuracy(NaN, 10))).toBe(true);
    expect(Number.isFinite(calculateConsistency([NaN, 50, Infinity]))).toBe(true);
    expect(Number.isFinite(getLevelProgress(Infinity).level)).toBe(true);
    expect(Number.isFinite(getLevelProgress(NaN).xpForNextLevel)).toBe(true);

    const safeXp = calculateSessionXp(
      { wpm: NaN, duration: 0, elapsedSeconds: NaN, accuracy: NaN } as SessionResult,
      NaN
    );
    expect(Number.isFinite(safeXp.totalXp)).toBe(true);
    expect(getDailyChallenge('invalid-date').id).toBeTruthy();
    expect(finiteNumber('Infinity', 24, 18, 44)).toBe(24);
  });

  it('handles malformed dates, extreme Unicode & empty engine states without throwing', () => {
    expect(safeDateLabel('not-a-date', 'Recent')).toBe('Recent');
    expect(safeShortDate('bad', '')).toBe('');
    const gs = segmentGraphemes('\0\uFFFD👨‍👩‍👧‍👦ಕಿहिन्दी<script>', 'kn');
    expect(gs.length).toBeGreaterThan(0);

    const eng = new TypingEngine({ mode: 'custom', initialWords: [] });
    expect(() => eng.handleInput('a')).not.toThrow();
    expect(() => eng.handleBackspace()).not.toThrow();
    expect(() => eng.finish()).not.toThrow();
    eng.destroy();
  });

  it('blocks prototype-key collisions across storage and curriculum lookups', () => {
    expect(isSafeRecordKey('__proto__')).toBe(false);
    expect(isSafeRecordKey('toString')).toBe(false);
    expect(isSafeRecordKey('constructor')).toBe(false);

    localStorage.setItem(
      'santypes_test_history',
      JSON.stringify([{ wpm: 50, weakKeys: [{ key: 'toString', count: 3 }] }])
    );
    const weak = getRecentWeakKeys(5);
    expect(weak.find((w) => w.key === 'toString')?.count).toBe(3);

    completeLessonChapter('toString', 50, 95);
    expect(getChapterProgress('toString').done).toBe(false);
    expect(summarizeWeakKeys(null)).toEqual([]);
  });

  it('sanitizes corrupted localStorage structures and clamps settings & lessons', () => {
    localStorage.setItem(
      'santypes_custom_lessons',
      JSON.stringify([null, 42, { id: 'bad', title: null, text: 123 }])
    );
    expect(getCustomLessons()).toEqual([]);

    const l1 = saveCustomLesson('  A'.repeat(100), 'practice text '.repeat(5));
    const l2 = saveCustomLesson('Second', 'more practice text');
    expect(l1.title.length).toBeLessThanOrEqual(120);
    expect(l1.id).not.toBe(l2.id);

    localStorage.setItem(
      'santypes_user_settings',
      JSON.stringify({
        fontSize: 'Infinity',
        wpmGoal: 'Infinity',
        soundVolume: 99999,
        theme: 'hacked',
        accent: 'hacked',
      })
    );
    const settings = getSettings();
    expect(settings.fontSize).toBeGreaterThanOrEqual(18);
    expect(settings.fontSize).toBeLessThanOrEqual(44);
    expect(settings.wpmGoal).toBeLessThanOrEqual(300);
    expect(settings.soundVolume).toBeLessThanOrEqual(100);
    expect(['oled', 'dark', 'serika']).toContain(settings.theme);

    localStorage.setItem(
      'santypes_account_state',
      JSON.stringify({ xp: 'Infinity', level: -99, streak: 'bad' })
    );
    const account = getAccountState();
    expect(Number.isFinite(account.xp)).toBe(true);
    expect(account.level).toBeGreaterThanOrEqual(1);

    localStorage.setItem(
      'santypes_test_history',
      JSON.stringify([null, { mode: 123, wpm: 'bad', completedAt: 99 }])
    );
    const history = getTestHistory();
    expect(history).toHaveLength(1);
    expect(typeof history[0].mode).toBe('string');
    expect(history[0].wpm).toBe(0);
  });

  it('enforces DPDP opt-in analytics consent, export, and full local erasure', () => {
    expect(getAnalyticsConsentStatus()).toBe('unset');

    // No analytics event emitted prior to explicit consent
    const dataLayerMock: unknown[] = [];
    (globalThis as unknown as { window?: unknown }).window = {
      dataLayer: dataLayerMock,
      gtag: (...args: unknown[]) => dataLayerMock.push(args),
      dispatchEvent: () => true,
    };

    expect(trackAnalyticsEvent('user_feedback', { rating: 5 })).toBe(false);
    expect(dataLayerMock).toHaveLength(0);

    grantAnalyticsConsent();
    expect(getAnalyticsConsentStatus()).toBe('granted');
    expect(trackAnalyticsEvent('user_feedback', { rating: 5, has_notes: true })).toBe(true);

    denyAnalyticsConsent();
    expect(getAnalyticsConsentStatus()).toBe('denied');
    expect(trackAnalyticsEvent('user_feedback', { rating: 5 })).toBe(false);

    saveCustomLesson('Exportable Drill', 'alpha beta gamma');
    const exported = collectAllLocalUserData();
    expect((exported.data as Record<string, unknown>).santypes_custom_lessons).toBeTruthy();

    eraseAllLocalUserData();
    expect(getCustomLessons()).toEqual([]);
    expect(getAnalyticsConsentStatus()).toBe('unset');
  });

  it('provides complete FAQ and Terms of Use disclosures without personal PII', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(8);
    expect(TERMS_SECTIONS.length).toBeGreaterThanOrEqual(6);
    expect(TERMS_VERSION).toBeTruthy();
    expect(TERMS_EFFECTIVE_DATE).toBeTruthy();

    expect(filterFaqItems('kannada').length).toBeGreaterThan(0);
    expect(filterFaqItems('no-matching-term-xyz')).toHaveLength(0);

    const combinedText = [
      ...FAQ_ITEMS.map((i) => `${i.question} ${i.answer}`),
      ...TERMS_SECTIONS.map((s) => `${s.title} ${s.body}`),
    ].join('\n');
    expect(combinedText).not.toMatch(/suhas@|zerythous|mailto:|@/i);
    expect(combinedText).toContain('https://github.com/suhas-hoskere/santypes/security');
    expect(combinedText).toContain('https://github.com/suhas-hoskere/santypes/issues');
  });

  it('honors Global Privacy Control (GPC) browser signal by defaulting analytics to denied (F-003)', () => {
    vi.stubGlobal('navigator', { globalPrivacyControl: true });
    try {
      expect(isGlobalPrivacyControlEnabled()).toBe(true);
      expect(getAnalyticsConsentStatus()).toBe('denied');
      expect(trackAnalyticsEvent('session_complete', { wpm: 80 })).toBe(false);

      grantAnalyticsConsent();
      expect(getAnalyticsConsentStatus()).toBe('granted');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('uses local calendar YYYY-MM-DD keys so streaks roll over at local midnight cleanly (F-004)', () => {
    vi.useFakeTimers();
    try {
      // 00:15 local time (earlier UTC date in positive offsets like IST +05:30)
      vi.setSystemTime(new Date(2026, 10, 11, 0, 15, 0));
      const todayKey = getLocalDateKey();
      const yesterdayKey = getLocalYesterdayKey();
      expect(todayKey).toBe('2026-11-11');
      expect(yesterdayKey).toBe('2026-11-10');

      localStorage.setItem(
        'santypes_account_state',
        JSON.stringify({
          xp: 120,
          level: 2,
          streak: { current: 4, best: 4, lastActiveDate: yesterdayKey },
          unlockedBadges: {},
          dailyChallenge: { date: yesterdayKey, completed: false },
        })
      );

      processSessionCompletion({
        id: 'local-midnight-test',
        completedAt: new Date().toISOString(),
        mode: 'words',
        lang: 'en',
        duration: 30,
        wordTarget: 25,
        elapsedSeconds: 30,
        wpm: 72,
        rawWpm: 75,
        wordsPerMinute: 70,
        keystrokesPerMinute: 360,
        accuracy: 97,
        consistency: 92,
        burstPeakWpm: 88,
        firstKeyLatency: 180,
        correctChars: 180,
        incorrectChars: 4,
        totalKeystrokes: 184,
        backspaces: 2,
        weakKeys: [],
        fingerAnalysis: [],
        history: [],
      });

      const updated = getAccountState();
      expect(updated.streak.current).toBe(5);
      expect(updated.streak.best).toBe(5);
      expect(updated.streak.lastActiveDate).toBe('2026-11-11');
    } finally {
      vi.useRealTimers();
    }
  });
});
