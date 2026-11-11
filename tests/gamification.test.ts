import { describe, it, expect } from 'vitest';
import {
  ALL_BADGES,
  getLevelProgress,
  calculateSessionXp,
  checkBadgesToUnlock,
  getDailyChallenge,
} from '../src/core/gamification.ts';
import { SessionResult } from '../src/core/types.ts';

describe('Gamification Engine: XP, Levels, Badges & Daily Challenges', () => {
  it('contains exactly 24 unique badges across 4 balanced categories', () => {
    expect(ALL_BADGES.length).toBe(24);
    const ids = new Set(ALL_BADGES.map((b) => b.id));
    expect(ids.size).toBe(24);

    const categories = new Set(ALL_BADGES.map((b) => b.category));
    expect(categories.has('speed')).toBe(true);
    expect(categories.has('precision')).toBe(true);
    expect(categories.has('dedication')).toBe(true);
    expect(categories.has('mastery')).toBe(true);
  });

  it('computes accurate level progression and percentages from XP', () => {
    // Level 1: 0 XP
    const lvl1 = getLevelProgress(0);
    expect(lvl1.level).toBe(1);
    expect(lvl1.rankTitle).toBe('Novice Typist');
    expect(lvl1.progressPercent).toBe(0);

    // Mid Level 1: 125 XP (50% of 250)
    const midLvl1 = getLevelProgress(125);
    expect(midLvl1.level).toBe(1);
    expect(midLvl1.progressPercent).toBe(50);

    // Level 2: 250 XP
    const lvl2 = getLevelProgress(250);
    expect(lvl2.level).toBe(2);

    // High XP check: Level 10
    const lvl10 = getLevelProgress(125 * 9 * 10); // 11,250 XP
    expect(lvl10.level).toBe(10);
    expect(lvl10.rankTitle).toBe('Swift Striker');
  });

  it('awards appropriate session XP including accuracy and streak bonuses', () => {
    const session: SessionResult = {
      id: 'sess_1',
      completedAt: new Date().toISOString(),
      mode: 'time',
      lang: 'en',
      duration: 30,
      wordTarget: 25,
      wpm: 80,
      rawWpm: 85,
      wordsPerMinute: 80,
      keystrokesPerMinute: 400,
      accuracy: 100,
      consistency: 90,
      burstPeakWpm: 90,
      elapsedSeconds: 30,
      totalKeystrokes: 200,
      correctChars: 200,
      incorrectChars: 0,
      backspaces: 0,
      firstKeyLatency: 200,
      weakKeys: [],
      fingerAnalysis: [],
      history: [],
    };

    // 80 base XP + 50 perfect accuracy bonus = 130 XP (no streak)
    const xpNoStreak = calculateSessionXp(session, 0);
    expect(xpNoStreak.baseXp).toBe(80);
    expect(xpNoStreak.accBonus).toBe(50);
    expect(xpNoStreak.streakBonus).toBe(0);
    expect(xpNoStreak.totalXp).toBe(130);

    // With 5 day streak (+25% bonus)
    const xpStreak = calculateSessionXp(session, 5);
    expect(xpStreak.streakBonus).toBe(Math.round(130 * 0.25));
    expect(xpStreak.totalXp).toBe(130 + Math.round(130 * 0.25));
  });

  it('correctly evaluates newly unlocked badges based on session metrics', () => {
    const session: SessionResult = {
      id: 'sess_2',
      completedAt: '2026-10-26T14:00:00Z',
      mode: 'time',
      lang: 'en',
      duration: 30,
      wordTarget: 25,
      wpm: 105,
      rawWpm: 110,
      wordsPerMinute: 105,
      keystrokesPerMinute: 550,
      accuracy: 99,
      consistency: 96,
      burstPeakWpm: 125,
      elapsedSeconds: 30,
      totalKeystrokes: 275,
      correctChars: 270,
      incorrectChars: 1,
      backspaces: 4,
      firstKeyLatency: 180,
      weakKeys: [],
      fingerAnalysis: [],
      history: [],
    };

    const unlocked = checkBadgesToUnlock(session, [], new Set(), 0);
    const unlockedIds = unlocked.map((b) => b.id);

    expect(unlockedIds).toContain('first_test');
    expect(unlockedIds).toContain('wpm_40');
    expect(unlockedIds).toContain('wpm_60');
    expect(unlockedIds).toContain('wpm_80');
    expect(unlockedIds).toContain('wpm_100'); // Centurion!
    expect(unlockedIds).toContain('acc_95');
    expect(unlockedIds).toContain('acc_98');
    expect(unlockedIds).toContain('cons_95');
    expect(unlockedIds).toContain('burst_120'); // Sonic Boom!
    expect(unlockedIds).not.toContain('acc_100'); // 99% accuracy
  });

  it('provides deterministic daily challenges based on date and handles malformed inputs safely', () => {
    const dc1 = getDailyChallenge('2026-10-26');
    const dc2 = getDailyChallenge('2026-10-26');
    expect(dc1.id).toBe(dc2.id);
    expect(dc1.title).toBeTruthy();
    expect(dc1.xpReward).toBeGreaterThanOrEqual(100);

    // Malformed date string should not crash and should return a fallback challenge
    const dcInvalid = getDailyChallenge('invalid-date-string');
    expect(dcInvalid).toBeDefined();
    expect(dcInvalid.id).toBeTruthy();

    // Invalid XP values should not throw or return NaN
    const lvlNaN = getLevelProgress(NaN);
    expect(lvlNaN.level).toBe(1);
    expect(lvlNaN.currentXp).toBe(0);

    const lvlNegative = getLevelProgress(-100);
    expect(lvlNegative.level).toBe(1);
    expect(lvlNegative.currentXp).toBe(0);
  });
});
