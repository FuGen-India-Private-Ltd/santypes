// Santypes Storage & Telemetry Persistence Stub
import { FingerName, LanguageCode, SessionResult, TelemetryPoint, TypingMode } from '../core/types.ts';
import { finiteNumber, safeStorageGetItem, safeStorageSetItem } from '../utils/html.ts';

const STORAGE_KEY = 'santypes_test_history';
const VALID_MODES = new Set<string>([
  'time', 'words', 'quote', 'paragraph', 'story', 'book',
  'code', 'numbers', 'punctuation', 'mixed', 'custom', 'ai',
]);
const VALID_LANGS = new Set<LanguageCode>(['en', 'kn', 'hi']);

function sanitizeSessionResult(raw: unknown): SessionResult | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;

  const rawMode = typeof r.mode === 'string' ? r.mode.trim().toLowerCase() : 'time';
  const mode: TypingMode = (VALID_MODES.has(rawMode) ? rawMode : 'time') as TypingMode;
  const rawLang = typeof r.lang === 'string' ? r.lang.trim().toLowerCase() : 'en';
  const lang: LanguageCode = VALID_LANGS.has(rawLang as LanguageCode) ? (rawLang as LanguageCode) : 'en';

  const weakKeysRaw = Array.isArray(r.weakKeys) ? r.weakKeys : [];
  const weakKeys = weakKeysRaw
    .filter((w): w is { key: string; count: number } =>
      Boolean(w && typeof w === 'object' && typeof (w as { key?: unknown }).key === 'string')
    )
    .slice(0, 16)
    .map((w) => ({
      key: w.key.slice(0, 12),
      count: Math.floor(finiteNumber(w.count, 0, 0, 10000)),
    }))
    .filter((w) => w.count > 0);

  const historyRaw = Array.isArray(r.history) ? r.history : [];
  const history: TelemetryPoint[] = historyRaw
    .filter((pt): pt is TelemetryPoint => Boolean(pt && typeof pt === 'object' && !Array.isArray(pt)))
    .slice(0, 600)
    .map((pt, idx) => ({
      time: finiteNumber(pt.time, idx + 1, 0, 86400),
      wpm: finiteNumber(pt.wpm, 0, 0, 500),
      rawWpm: finiteNumber(pt.rawWpm, 0, 0, 500),
      accuracy: finiteNumber(pt.accuracy, 100, 0, 100),
      errors: Math.floor(finiteNumber(pt.errors, 0, 0, 10000)),
    }));

  const fingerRaw = Array.isArray(r.fingerAnalysis) ? r.fingerAnalysis : [];
  const fingerAnalysis = fingerRaw
    .filter((f): f is { finger: FingerName; count: number } =>
      Boolean(f && typeof f === 'object' && typeof (f as { finger?: unknown }).finger === 'string')
    )
    .slice(0, 12)
    .map((f) => ({
      finger: f.finger,
      count: Math.floor(finiteNumber(f.count, 0, 0, 10000)),
    }));

  return {
    id: typeof r.id === 'string' && r.id ? r.id.slice(0, 80) : `sess_${Date.now()}`,
    completedAt: typeof r.completedAt === 'string' ? r.completedAt : '',
    mode,
    lang,
    duration: finiteNumber(r.duration, 0, 0, 86400),
    wordTarget: finiteNumber(r.wordTarget, 25, 0, 10000),
    wpm: finiteNumber(r.wpm, 0, 0, 500),
    rawWpm: finiteNumber(r.rawWpm, 0, 0, 500),
    wordsPerMinute: finiteNumber(r.wordsPerMinute, 0, 0, 500),
    keystrokesPerMinute: finiteNumber(r.keystrokesPerMinute, 0, 0, 3000),
    accuracy: finiteNumber(r.accuracy, 100, 0, 100),
    consistency: finiteNumber(r.consistency, 100, 0, 100),
    burstPeakWpm: finiteNumber(r.burstPeakWpm, 0, 0, 500),
    elapsedSeconds: finiteNumber(r.elapsedSeconds, 0, 0, 86400),
    totalKeystrokes: Math.floor(finiteNumber(r.totalKeystrokes, 0, 0, 100000)),
    correctChars: Math.floor(finiteNumber(r.correctChars, 0, 0, 100000)),
    incorrectChars: Math.floor(finiteNumber(r.incorrectChars, 0, 0, 100000)),
    backspaces: Math.floor(finiteNumber(r.backspaces, 0, 0, 100000)),
    firstKeyLatency: Math.floor(finiteNumber(r.firstKeyLatency, 0, 0, 600000)),
    weakKeys,
    fingerAnalysis,
    history,
  };
}

export function saveTestSession(session: SessionResult): void {
  const sanitized = sanitizeSessionResult(session);
  if (!sanitized) return;
  try {
    const history = getTestHistoryRaw();
    history.unshift(sanitized);
    if (history.length > 200) history.pop();
    safeStorageSetItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('Could not persist session to localStorage:', err);
  }
}

export function getTestHistoryRaw(): SessionResult[] {
  try {
    const raw = safeStorageGetItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeSessionResult)
      .filter((s): s is SessionResult => s !== null);
  } catch {
    return [];
  }
}

export function getTestHistory(): SessionResult[] {
  try {
    const raw = safeStorageGetItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map(sanitizeSessionResult)
          .filter((s): s is SessionResult => s !== null);
      }
    }
  } catch {
    // ignore
  }
  return getSeedSessions();
}

export function clearTestHistory(): void {
  try {
    safeStorageSetItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.warn('Could not clear test history:', err);
  }
}

export function getSeedSessions(): SessionResult[] {
  const now = Date.now();
  return [
    {
      id: 's1',
      completedAt: new Date(now - 3600000 * 24).toISOString(),
      mode: 'time',
      lang: 'en',
      duration: 30,
      wordTarget: 25,
      wpm: 68,
      rawWpm: 72,
      wordsPerMinute: 68,
      keystrokesPerMinute: 360,
      accuracy: 94,
      consistency: 82,
      burstPeakWpm: 78,
      elapsedSeconds: 30,
      totalKeystrokes: 180,
      correctChars: 170,
      incorrectChars: 4,
      backspaces: 6,
      firstKeyLatency: 320,
      weakKeys: [{ key: 'p', count: 3 }, { key: 'q', count: 1 }],
      fingerAnalysis: [{ finger: 'R pinky', count: 3 }, { finger: 'L pinky', count: 1 }],
      history: [
        { time: 5, wpm: 60, rawWpm: 64, accuracy: 95, errors: 1 },
        { time: 10, wpm: 65, rawWpm: 70, accuracy: 94, errors: 1 },
        { time: 15, wpm: 68, rawWpm: 72, accuracy: 94, errors: 0 },
        { time: 20, wpm: 70, rawWpm: 74, accuracy: 95, errors: 1 },
        { time: 25, wpm: 69, rawWpm: 73, accuracy: 94, errors: 1 },
        { time: 30, wpm: 68, rawWpm: 72, accuracy: 94, errors: 0 },
      ],
    },
    {
      id: 's2',
      completedAt: new Date(now - 3600000 * 18).toISOString(),
      mode: 'words',
      lang: 'en',
      duration: 0,
      wordTarget: 25,
      wpm: 74,
      rawWpm: 78,
      wordsPerMinute: 74,
      keystrokesPerMinute: 390,
      accuracy: 96,
      consistency: 86,
      burstPeakWpm: 84,
      elapsedSeconds: 22,
      totalKeystrokes: 145,
      correctChars: 140,
      incorrectChars: 2,
      backspaces: 3,
      firstKeyLatency: 280,
      weakKeys: [{ key: 'b', count: 2 }],
      fingerAnalysis: [{ finger: 'L index', count: 2 }],
      history: [
        { time: 5, wpm: 70, rawWpm: 72, accuracy: 98, errors: 0 },
        { time: 10, wpm: 72, rawWpm: 76, accuracy: 97, errors: 1 },
        { time: 15, wpm: 75, rawWpm: 80, accuracy: 96, errors: 1 },
        { time: 22, wpm: 74, rawWpm: 78, accuracy: 96, errors: 0 },
      ],
    },
    {
      id: 's3',
      completedAt: new Date(now - 3600000 * 12).toISOString(),
      mode: 'time',
      lang: 'en',
      duration: 30,
      wordTarget: 25,
      wpm: 79,
      rawWpm: 83,
      wordsPerMinute: 79,
      keystrokesPerMinute: 415,
      accuracy: 95,
      consistency: 88,
      burstPeakWpm: 88,
      elapsedSeconds: 30,
      totalKeystrokes: 208,
      correctChars: 198,
      incorrectChars: 3,
      backspaces: 7,
      firstKeyLatency: 250,
      weakKeys: [{ key: 'z', count: 2 }, { key: 'x', count: 1 }],
      fingerAnalysis: [{ finger: 'L pinky', count: 2 }, { finger: 'L ring', count: 1 }],
      history: [
        { time: 5, wpm: 74, rawWpm: 78, accuracy: 96, errors: 0 },
        { time: 10, wpm: 78, rawWpm: 82, accuracy: 96, errors: 1 },
        { time: 15, wpm: 80, rawWpm: 85, accuracy: 95, errors: 1 },
        { time: 20, wpm: 81, rawWpm: 84, accuracy: 95, errors: 1 },
        { time: 25, wpm: 79, rawWpm: 83, accuracy: 95, errors: 0 },
        { time: 30, wpm: 79, rawWpm: 83, accuracy: 95, errors: 0 },
      ],
    },
    {
      id: 's4',
      completedAt: new Date(now - 3600000 * 4).toISOString(),
      mode: 'paragraph',
      lang: 'en',
      duration: 0,
      wordTarget: 50,
      wpm: 82,
      rawWpm: 85,
      wordsPerMinute: 82,
      keystrokesPerMinute: 425,
      accuracy: 97,
      consistency: 91,
      burstPeakWpm: 92,
      elapsedSeconds: 28,
      totalKeystrokes: 215,
      correctChars: 210,
      incorrectChars: 2,
      backspaces: 3,
      firstKeyLatency: 210,
      weakKeys: [{ key: 'c', count: 2 }],
      fingerAnalysis: [{ finger: 'L middle', count: 2 }],
      history: [
        { time: 5, wpm: 80, rawWpm: 82, accuracy: 98, errors: 0 },
        { time: 10, wpm: 82, rawWpm: 85, accuracy: 97, errors: 1 },
        { time: 20, wpm: 83, rawWpm: 86, accuracy: 97, errors: 1 },
        { time: 28, wpm: 82, rawWpm: 85, accuracy: 97, errors: 0 },
      ],
    },
    {
      id: 's5',
      completedAt: new Date().toISOString(),
      mode: 'time',
      lang: 'en',
      duration: 60,
      wordTarget: 50,
      wpm: 88,
      rawWpm: 92,
      wordsPerMinute: 88,
      keystrokesPerMinute: 460,
      accuracy: 98,
      consistency: 93,
      burstPeakWpm: 98,
      elapsedSeconds: 60,
      totalKeystrokes: 460,
      correctChars: 452,
      incorrectChars: 1,
      backspaces: 7,
      firstKeyLatency: 190,
      weakKeys: [{ key: 'm', count: 1 }],
      fingerAnalysis: [{ finger: 'R index', count: 1 }],
      history: [
        { time: 10, wpm: 85, rawWpm: 88, accuracy: 99, errors: 0 },
        { time: 20, wpm: 87, rawWpm: 90, accuracy: 98, errors: 1 },
        { time: 30, wpm: 89, rawWpm: 93, accuracy: 98, errors: 0 },
        { time: 40, wpm: 88, rawWpm: 92, accuracy: 98, errors: 0 },
        { time: 50, wpm: 89, rawWpm: 93, accuracy: 98, errors: 0 },
        { time: 60, wpm: 88, rawWpm: 92, accuracy: 98, errors: 0 },
      ],
    },
  ];
}

export function loadSeedData(): SessionResult[] {
  const seed = getSeedSessions();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch (err) {
    console.warn('Could not write seed data to storage:', err);
  }
  return seed;
}

/**
 * Retrieve the user's highest Net WPM session in the given mode & language for Ghost racing.
 */
export function getBestSessionForMode(mode: string, lang: string = 'en'): SessionResult | null {
  const history = getTestHistoryRaw();
  const matching = history
    .filter(s => s && s.mode === mode && (s.lang || 'en') === lang && (s.wpm || 0) > 0)
    .sort((a, b) => (b.wpm || 0) - (a.wpm || 0));
  return matching.length > 0 ? matching[0] : null;
}

/**
 * Aggregates weak keys from recent test sessions for adaptive mode and weak key drills.
 */
export function getRecentWeakKeys(limit: number = 8): Array<{ key: string; count: number }> {
  const history = getTestHistoryRaw().slice(0, 15);
  const errorTotals = new Map<string, number>();

  for (const session of history) {
    if (session && Array.isArray(session.weakKeys)) {
      for (const item of session.weakKeys) {
        if (item && typeof item.key === 'string' && Number.isFinite(item.count) && item.count > 0) {
          errorTotals.set(item.key, (errorTotals.get(item.key) || 0) + item.count);
        }
      }
    }
  }

  return Array.from(errorTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(0, limit))
    .map(([key, count]) => ({ key, count }));
}
