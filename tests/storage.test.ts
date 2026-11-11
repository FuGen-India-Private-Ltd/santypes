import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTestSession,
  getTestHistoryRaw,
  getTestHistory,
  clearTestHistory,
  getBestSessionForMode,
  getRecentWeakKeys,
  loadSeedData,
} from '../src/stubs/storage-stub.ts';
import { SessionResult } from '../src/core/types.ts';

// Mock localStorage for node test environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  key: (i: number) => Object.keys(mockStorage)[i] || null,
  length: 0,
};

describe('Storage & Analytics Telemetry Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns realistic seed sessions for first-time visitors', () => {
    const history = getTestHistory();
    expect(history.length).toBeGreaterThanOrEqual(5);
    expect(history[0].wpm).toBeGreaterThan(0);
  });

  it('persists and retrieves completed typing sessions', () => {
    const sampleSession: SessionResult = {
      id: 'test_sess_1',
      completedAt: new Date().toISOString(),
      mode: 'time',
      lang: 'en',
      duration: 30,
      wordTarget: 25,
      wpm: 85,
      rawWpm: 90,
      wordsPerMinute: 85,
      keystrokesPerMinute: 450,
      accuracy: 96,
      consistency: 90,
      burstPeakWpm: 95,
      elapsedSeconds: 30,
      totalKeystrokes: 225,
      correctChars: 218,
      incorrectChars: 3,
      backspaces: 4,
      firstKeyLatency: 220,
      weakKeys: [{ key: 'x', count: 2 }],
      fingerAnalysis: [{ finger: 'L ring', count: 2 }],
      history: [],
    };

    saveTestSession(sampleSession);
    const retrieved = getTestHistoryRaw();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].id).toBe('test_sess_1');
    expect(retrieved[0].wpm).toBe(85);
  });

  it('retrieves the highest WPM session as the ghost target for a given mode', () => {
    const s1: SessionResult = {
      id: 's1',
      completedAt: new Date().toISOString(),
      mode: 'time',
      lang: 'en',
      duration: 30,
      wordTarget: 25,
      wpm: 70,
      rawWpm: 75,
      wordsPerMinute: 70,
      keystrokesPerMinute: 350,
      accuracy: 95,
      consistency: 85,
      burstPeakWpm: 75,
      elapsedSeconds: 30,
      totalKeystrokes: 180,
      correctChars: 175,
      incorrectChars: 2,
      backspaces: 3,
      firstKeyLatency: 300,
      weakKeys: [],
      fingerAnalysis: [],
      history: [],
    };

    const s2: SessionResult = {
      ...s1,
      id: 's2',
      wpm: 92,
      rawWpm: 95,
    };

    saveTestSession(s1);
    saveTestSession(s2);

    const ghost = getBestSessionForMode('time', 'en');
    expect(ghost).toBeTruthy();
    expect(ghost?.id).toBe('s2');
    expect(ghost?.wpm).toBe(92);
  });

  it('aggregates weak keys across multiple sessions', () => {
    const s1: SessionResult = {
      id: 's1',
      completedAt: new Date().toISOString(),
      mode: 'time',
      lang: 'en',
      duration: 30,
      wordTarget: 25,
      wpm: 60,
      rawWpm: 65,
      wordsPerMinute: 60,
      keystrokesPerMinute: 300,
      accuracy: 90,
      consistency: 80,
      burstPeakWpm: 70,
      elapsedSeconds: 30,
      totalKeystrokes: 150,
      correctChars: 140,
      incorrectChars: 5,
      backspaces: 5,
      firstKeyLatency: 350,
      weakKeys: [{ key: 'q', count: 3 }, { key: 'z', count: 2 }],
      fingerAnalysis: [],
      history: [],
    };

    const s2: SessionResult = {
      ...s1,
      id: 's2',
      weakKeys: [{ key: 'q', count: 2 }, { key: 'p', count: 4 }],
    };

    saveTestSession(s1);
    saveTestSession(s2);

    const weakKeys = getRecentWeakKeys();
    expect(weakKeys[0].key).toBe('q'); // 3 + 2 = 5
    expect(weakKeys[0].count).toBe(5);
    expect(weakKeys[1].key).toBe('p'); // 4
    expect(weakKeys[1].count).toBe(4);
  });

  it('clears history correctly when requested', () => {
    loadSeedData();
    expect(getTestHistoryRaw().length).toBeGreaterThan(0);

    clearTestHistory();
    expect(getTestHistoryRaw().length).toBe(0);
  });

  it('safely handles corrupted non-array data in localStorage without crashing', () => {
    // Write corrupted non-array JSON to storage
    localStorage.setItem('santypes_test_history', JSON.stringify({ error: 'not an array' }));
    expect(getTestHistoryRaw()).toEqual([]);
    expect(getTestHistory().length).toBeGreaterThanOrEqual(5); // falls back to seed data

    // Corrupted primitive JSON
    localStorage.setItem('santypes_test_history', '12345');
    expect(getTestHistoryRaw()).toEqual([]);

    // Corrupted non-JSON string
    localStorage.setItem('santypes_test_history', '{invalid-json');
    expect(getTestHistoryRaw()).toEqual([]);
  });
});
