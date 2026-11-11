// Santypes Gamification & Account State Manager
// 100% Framework-Free Pure TypeScript

import { SessionResult } from '../core/types.ts';
import {
  BadgeDefinition,
  UnlockedBadge,
  getLevelProgress,
  calculateSessionXp,
  checkBadgesToUnlock,
  getDailyChallenge,
} from '../core/gamification.ts';
import { getTestHistoryRaw } from './storage-stub.ts';
import { getAllProgress } from './curriculum-stub.ts';
import {
  finiteNumber,
  getLocalDateKey,
  getLocalYesterdayKey,
  safeStorageGetItem,
  safeStorageSetItem,
} from '../utils/html.ts';

export interface AccountState {
  xp: number;
  level: number;
  streak: {
    current: number;
    best: number;
    lastActiveDate: string | null;
  };
  unlockedBadges: Record<string, UnlockedBadge>;
  dailyChallenge: {
    date: string;
    completed: boolean;
  };
}

export interface SessionCompletionReward {
  earnedXp: number;
  baseXp: number;
  accBonus: number;
  streakBonus: number;
  dailyChallengeBonus: number;
  badgeBonus: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  newlyUnlockedBadges: BadgeDefinition[];
  dailyChallengeCompleted: boolean;
}

const ACCOUNT_KEY = 'santypes_account_state';

function sanitizeUnlockedBadges(raw: unknown): Record<string, UnlockedBadge> {
  const result: Record<string, UnlockedBadge> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
  for (const [key, val] of Object.entries(raw)) {
    if (!Object.hasOwn(raw, key) || key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (val && typeof val === 'object') {
      const unlockedAt = typeof (val as UnlockedBadge).unlockedAt === 'string' ? (val as UnlockedBadge).unlockedAt : '';
      result[key] = { id: key, unlockedAt };
    }
  }
  return result;
}

export function getAccountState(): AccountState {
  try {
    const raw = safeStorageGetItem(ACCOUNT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const streakRaw = parsed.streak && typeof parsed.streak === 'object' ? parsed.streak : {};
        const xp = Math.floor(finiteNumber(parsed.xp, 0, 0, 1_000_000_000));
        const computedLevel = getLevelProgress(xp).level;
        return {
          xp,
          level: Math.max(computedLevel, Math.floor(finiteNumber(parsed.level, 1, 1, 10000))),
          streak: {
            current: Math.floor(finiteNumber(streakRaw.current, 0, 0, 36500)),
            best: Math.floor(finiteNumber(streakRaw.best, 0, 0, 36500)),
            lastActiveDate: typeof streakRaw.lastActiveDate === 'string' ? streakRaw.lastActiveDate : null,
          },
          unlockedBadges: sanitizeUnlockedBadges(parsed.unlockedBadges),
          dailyChallenge: {
            date: typeof parsed.dailyChallenge?.date === 'string' ? parsed.dailyChallenge.date : '',
            completed: Boolean(parsed.dailyChallenge?.completed),
          },
        };
      }
    }
  } catch (err) {
    console.warn('Could not read account state:', err);
  }
  return {
    xp: 0,
    level: 1,
    streak: { current: 0, best: 0, lastActiveDate: null },
    unlockedBadges: {},
    dailyChallenge: { date: '', completed: false },
  };
}

export function saveAccountState(state: AccountState): void {
  try {
    safeStorageSetItem(ACCOUNT_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save account state:', e);
  }
}

/**
 * Full session completion processor that awards XP, updates streaks,
 * evaluates daily challenge, unlocks badges, and calculates level ups.
 */
export function processSessionCompletion(session: SessionResult): SessionCompletionReward {
  const state = getAccountState();
  const allSessions = getTestHistoryRaw();
  const curriculumProgress = getAllProgress();
  const curriculumDoneCount = Object.values(curriculumProgress).filter((p) => p.done).length;

  const oldLevel = state.level;

  // 1. Streak updates (local calendar timezone so midnight IST matches local day)
  const today = getLocalDateKey();
  if (state.streak.lastActiveDate !== today) {
    if (state.streak.lastActiveDate) {
      const yesterday = getLocalYesterdayKey();
      if (state.streak.lastActiveDate === yesterday) {
        state.streak.current++;
      } else {
        state.streak.current = 1;
      }
    } else {
      state.streak.current = 1;
    }
    state.streak.best = Math.max(state.streak.best, state.streak.current);
    state.streak.lastActiveDate = today;
  }

  // 2. Base XP and Accuracy/Streak Bonuses
  const { baseXp, accBonus, streakBonus, totalXp: sessionXp } = calculateSessionXp(
    session,
    state.streak.current
  );

  let earnedXp = sessionXp;

  // 3. Daily Challenge evaluation
  let dailyChallengeCompleted = false;
  let dailyChallengeBonus = 0;
  const todayChallenge = getDailyChallenge(today);

  if (state.dailyChallenge.date !== today) {
    state.dailyChallenge = { date: today, completed: false };
  }

  if (!state.dailyChallenge.completed && todayChallenge.condition(session)) {
    state.dailyChallenge.completed = true;
    dailyChallengeCompleted = true;
    dailyChallengeBonus = todayChallenge.xpReward;
    earnedXp += dailyChallengeBonus;
  }

  // 4. Badges evaluation
  const unlockedIds = new Set(Object.keys(state.unlockedBadges));
  const newlyUnlocked = checkBadgesToUnlock(
    session,
    allSessions,
    unlockedIds,
    state.streak.current,
    curriculumDoneCount
  );

  let badgeBonus = 0;
  for (const badge of newlyUnlocked) {
    state.unlockedBadges[badge.id] = {
      id: badge.id,
      unlockedAt: new Date().toISOString(),
    };
    badgeBonus += badge.xpReward;
    earnedXp += badge.xpReward;
  }

  // 5. Update Total XP and Level
  state.xp += earnedXp;
  const levelInfo = getLevelProgress(state.xp);
  state.level = levelInfo.level;
  const leveledUp = state.level > oldLevel;

  // 6. Persist updated account state
  saveAccountState(state);
  window.dispatchEvent(new CustomEvent('santypes:account-updated'));

  return {
    earnedXp,
    baseXp,
    accBonus,
    streakBonus,
    dailyChallengeBonus,
    badgeBonus,
    oldLevel,
    newLevel: state.level,
    leveledUp,
    newlyUnlockedBadges: newlyUnlocked,
    dailyChallengeCompleted,
  };
}

/**
 * Backwards compatibility helper for existing callers.
 */
export function awardSessionXp(session: SessionResult): { earnedXp: number; newLevel: number } {
  const result = processSessionCompletion(session);
  return { earnedXp: result.earnedXp, newLevel: result.newLevel };
}

export interface ArcadeReward {
  earnedXp: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  score: number;
  wordsDestroyed: number;
  maxCombo: number;
  accuracy: number;
}

export function awardArcadeReward(
  score: number,
  wordsDestroyed: number,
  accuracy: number,
  maxCombo: number
): ArcadeReward {
  const state = getAccountState();
  const oldLevel = state.level;

  const baseScoreXp = Math.floor(score / 8);
  const wordsXp = wordsDestroyed * 6;
  const comboBonus = maxCombo * 4;
  const accBonus = accuracy >= 95 ? 75 : accuracy >= 90 ? 40 : 0;
  const earnedXp = Math.max(25, baseScoreXp + wordsXp + comboBonus + accBonus);

  state.xp += earnedXp;
  const levelInfo = getLevelProgress(state.xp);
  state.level = levelInfo.level;
  const leveledUp = state.level > oldLevel;

  saveAccountState(state);
  window.dispatchEvent(new CustomEvent('santypes:account-updated'));

  return {
    earnedXp,
    oldLevel,
    newLevel: state.level,
    leveledUp,
    score,
    wordsDestroyed,
    maxCombo,
    accuracy,
  };
}

