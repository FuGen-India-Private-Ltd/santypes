// Santypes Gamification Engine: Badges, XP Progression, Levels & Daily Challenges
// 100% Framework-Free Pure TypeScript

import { SessionResult } from './types.ts';
import { finiteNumber } from '../utils/html.ts';

export type BadgeCategory = 'speed' | 'precision' | 'dedication' | 'mastery';

export function getBadgeCategorySvg(category: BadgeCategory | string): string {
  if (category === 'speed') {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
  }
  if (category === 'precision') {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>';
  }
  if (category === 'dedication') {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
  }
  return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  xpReward: number;
}

export interface UnlockedBadge {
  id: string;
  unlockedAt: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (session: SessionResult) => boolean;
}

export interface LevelProgress {
  level: number;
  rankTitle: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export const ALL_BADGES: BadgeDefinition[] = [
  // 1. Speed Milestones
  {
    id: 'first_test',
    title: 'First Keystroke',
    description: 'Complete your first typing test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    category: 'speed',
    xpReward: 50,
  },
  {
    id: 'wpm_40',
    title: 'Cruising Speed',
    description: 'Achieve 40+ Net WPM on any test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    category: 'speed',
    xpReward: 75,
  },
  {
    id: 'wpm_60',
    title: 'Swift Striker',
    description: 'Achieve 60+ Net WPM on any test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
    category: 'speed',
    xpReward: 100,
  },
  {
    id: 'wpm_80',
    title: 'Velocity Master',
    description: 'Achieve 80+ Net WPM on any test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    category: 'speed',
    xpReward: 150,
  },
  {
    id: 'wpm_100',
    title: 'Centurion',
    description: 'Achieve 100+ Net WPM on any test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
    category: 'speed',
    xpReward: 250,
  },
  {
    id: 'wpm_120',
    title: 'Supersonic',
    description: 'Achieve 120+ Net WPM on any test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`,
    category: 'speed',
    xpReward: 500,
  },

  // 2. Precision Milestones
  {
    id: 'acc_95',
    title: 'Sharp Shooter',
    description: 'Complete a test with 95%+ accuracy',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    category: 'precision',
    xpReward: 75,
  },
  {
    id: 'acc_98',
    title: 'Laser Precision',
    description: 'Complete a test with 98%+ accuracy',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M6 3h12l4 6-10 12L2 9z"></path></svg>`,
    category: 'precision',
    xpReward: 125,
  },
  {
    id: 'acc_100',
    title: 'Flawless Execution',
    description: 'Finish a test with 100% accuracy',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>`,
    category: 'precision',
    xpReward: 250,
  },
  {
    id: 'cons_95',
    title: 'Rhythm Machine',
    description: 'Score 95%+ typing consistency',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>`,
    category: 'precision',
    xpReward: 150,
  },

  // 3. Dedication & Volume
  {
    id: 'tests_5',
    title: 'Warm-Up',
    description: 'Complete 5 typing tests',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
    category: 'dedication',
    xpReward: 50,
  },
  {
    id: 'tests_25',
    title: 'Dedicated Typist',
    description: 'Complete 25 typing tests',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    category: 'dedication',
    xpReward: 150,
  },
  {
    id: 'tests_100',
    title: 'Century Club',
    description: 'Complete 100 typing tests',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>`,
    category: 'dedication',
    xpReward: 400,
  },
  {
    id: 'streak_3',
    title: 'On a Roll',
    description: 'Maintain a 3-day typing streak',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    category: 'dedication',
    xpReward: 100,
  },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    description: 'Maintain a 7-day typing streak',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    category: 'dedication',
    xpReward: 250,
  },
  {
    id: 'streak_14',
    title: 'Typing Habit',
    description: 'Maintain a 14-day typing streak',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>`,
    category: 'dedication',
    xpReward: 500,
  },

  // 4. Mastery & Exploration
  {
    id: 'code_warrior',
    title: 'Code Warrior',
    description: 'Complete 3 code mode tests',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    category: 'mastery',
    xpReward: 125,
  },
  {
    id: 'endurance',
    title: 'Endurance Runner',
    description: 'Complete a 120s or longer test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    category: 'mastery',
    xpReward: 150,
  },
  {
    id: 'quote_sage',
    title: 'Literary Sage',
    description: 'Complete 5 quote mode tests',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    category: 'mastery',
    xpReward: 125,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a test between 11 PM and 5 AM',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`,
    category: 'mastery',
    xpReward: 100,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a test between 5 AM and 8 AM',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>`,
    category: 'mastery',
    xpReward: 100,
  },
  {
    id: 'polyglot',
    title: 'Polyglot',
    description: 'Complete tests in at least 2 different languages',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    category: 'mastery',
    xpReward: 150,
  },
  {
    id: 'burst_120',
    title: 'Sonic Boom',
    description: 'Reach a peak burst speed of 120+ WPM',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    category: 'mastery',
    xpReward: 200,
  },
  {
    id: 'scholar',
    title: 'Curriculum Scholar',
    description: 'Complete 5 curriculum chapters',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    category: 'mastery',
    xpReward: 200,
  },
];

/**
 * Calculates level from total lifetime XP using an arithmetic progression curve.
 * Level L requires L * 250 XP.
 * Cumulative XP to reach Level L = 125 * (L - 1) * L.
 */
export function getLevelProgress(totalXp: number): LevelProgress {
  const xp = Math.floor(finiteNumber(totalXp, 0, 0, 1_000_000_000));

  // Solve 125 * (L - 1) * L <= xp
  // 125 * L^2 - 125 * L - xp = 0 => L = (125 + sqrt(125^2 + 4 * 125 * xp)) / 250
  const level = Math.max(1, Math.floor((125 + Math.sqrt(15625 + 500 * xp)) / 250)) || 1;

  const xpForCurrentLevel = 125 * (level - 1) * level;
  const xpForNextLevel = 125 * level * (level + 1);
  const neededInThisLevel = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const earnedInThisLevel = Math.max(0, xp - xpForCurrentLevel);
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInThisLevel / neededInThisLevel) * 100))) || 0;

  return {
    level,
    rankTitle: getRankTitle(level),
    currentXp: xp,
    xpForCurrentLevel,
    xpForNextLevel,
    progressPercent,
  };
}

export function getRankTitle(level: number): string {
  if (level <= 2) return 'Novice Typist';
  if (level <= 5) return 'Touch Apprentice';
  if (level <= 9) return 'Key Artisan';
  if (level <= 14) return 'Swift Striker';
  if (level <= 19) return 'Velocity Master';
  if (level <= 29) return 'Keyboard Sorcerer';
  return 'Grandmaster Typist';
}

/**
 * Calculates XP earned from a completed typing session.
 */
export function calculateSessionXp(session: SessionResult, streakDays: number = 0): {
  baseXp: number;
  accBonus: number;
  streakBonus: number;
  totalXp: number;
} {
  const safeDuration = finiteNumber(session?.duration, 0, 0, 86400);
  const safeElapsed = finiteNumber(session?.elapsedSeconds, 1, 0, 86400);
  const safeWpm = finiteNumber(session?.wpm, 0, 0, 500);
  const safeAccuracy = finiteNumber(session?.accuracy, 0, 0, 100);
  const safeStreak = finiteNumber(streakDays, 0, 0, 36500);

  const durationFactor = safeDuration > 0 ? safeDuration / 30 : Math.max(0.5, safeElapsed / 30);
  const baseXp = Math.max(10, Math.round(safeWpm * durationFactor));

  // Accuracy bonus
  let accBonus = 0;
  if (safeAccuracy === 100) accBonus = 50;
  else if (safeAccuracy >= 98) accBonus = 30;
  else if (safeAccuracy >= 95) accBonus = 15;

  // Streak multiplier: +5% per streak day up to +50%
  const streakMultiplier = Math.min(0.5, Math.max(0, safeStreak * 0.05));
  const streakBonus = Math.round((baseXp + accBonus) * streakMultiplier);

  const totalXp = baseXp + accBonus + streakBonus;
  return { baseXp, accBonus, streakBonus, totalXp };
}

/**
 * Evaluates which badges have been newly unlocked by the current session and historical state.
 */
export function checkBadgesToUnlock(
  currentSession: SessionResult,
  allSessions: SessionResult[],
  unlockedBadgeIds: Set<string>,
  streakDays: number,
  curriculumCompletedCount: number = 0
): BadgeDefinition[] {
  const newlyUnlocked: BadgeDefinition[] = [];
  if (!currentSession) return newlyUnlocked;

  const safeSessions = Array.isArray(allSessions) ? allSessions.filter(Boolean) : [];
  const safeUnlockedIds = unlockedBadgeIds instanceof Set ? unlockedBadgeIds : new Set<string>();

  const check = (id: string, condition: boolean) => {
    if (!safeUnlockedIds.has(id) && condition) {
      const badge = ALL_BADGES.find((b) => b.id === id);
      if (badge) newlyUnlocked.push(badge);
    }
  };

  const totalTests = safeSessions.length + 1; // including current session
  const hourDate = new Date(currentSession.completedAt || Date.now());
  const hour = isNaN(hourDate.getTime()) ? new Date().getHours() : hourDate.getHours();

  // Speed
  check('first_test', totalTests >= 1);
  check('wpm_40', currentSession.wpm >= 40);
  check('wpm_60', currentSession.wpm >= 60);
  check('wpm_80', currentSession.wpm >= 80);
  check('wpm_100', currentSession.wpm >= 100);
  check('wpm_120', currentSession.wpm >= 120);

  // Precision
  check('acc_95', currentSession.accuracy >= 95);
  check('acc_98', currentSession.accuracy >= 98);
  check('acc_100', currentSession.accuracy === 100);
  check('cons_95', currentSession.consistency >= 95);

  // Dedication
  check('tests_5', totalTests >= 5);
  check('tests_25', totalTests >= 25);
  check('tests_100', totalTests >= 100);
  check('streak_3', streakDays >= 3);
  check('streak_7', streakDays >= 7);
  check('streak_14', streakDays >= 14);

  // Mastery
  const codeCount = safeSessions.filter((s) => s && s.mode === 'code').length + (currentSession.mode === 'code' ? 1 : 0);
  check('code_warrior', codeCount >= 3);

  check('endurance', (currentSession.duration || 0) >= 120 || (currentSession.elapsedSeconds || 0) >= 120);

  const quoteCount = safeSessions.filter((s) => s && s.mode === 'quote').length + (currentSession.mode === 'quote' ? 1 : 0);
  check('quote_sage', quoteCount >= 5);

  check('night_owl', hour >= 23 || hour < 5);
  check('early_bird', hour >= 5 && hour < 8);

  const languages = new Set(safeSessions.map((s) => (s && s.lang) || 'en'));
  languages.add(currentSession.lang || 'en');
  check('polyglot', languages.size >= 2);

  check('burst_120', (currentSession.burstPeakWpm || 0) >= 120);
  check('scholar', curriculumCompletedCount >= 5);

  return newlyUnlocked;
}

/**
 * Daily Challenge Pool: Rotating challenges based on current date.
 */
const DAILY_CHALLENGES: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (s: SessionResult) => boolean;
}> = [
  {
    id: 'dc_precision',
    title: 'Precision Master',
    description: 'Score 97%+ accuracy on any test with at least 50 WPM',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    xpReward: 100,
    condition: (s) => s.accuracy >= 97 && s.wpm >= 50,
  },
  {
    id: 'dc_speed',
    title: 'Velocity Sprint',
    description: 'Achieve at least 70 Net WPM on a 30s or longer test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    xpReward: 100,
    condition: (s) => s.wpm >= 70 && (s.duration >= 30 || s.elapsedSeconds >= 25),
  },
  {
    id: 'dc_consistency',
    title: 'Rhythmic Typing',
    description: 'Achieve 90%+ consistency on any test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>`,
    xpReward: 100,
    condition: (s) => s.consistency >= 90 && s.wpm >= 40,
  },
  {
    id: 'dc_quote',
    title: 'Literature Day',
    description: 'Complete a Quote mode test with 95%+ accuracy',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    xpReward: 100,
    condition: (s) => s.mode === 'quote' && s.accuracy >= 95,
  },
  {
    id: 'dc_endurance',
    title: 'Endurance Focus',
    description: 'Complete a 60s test with at least 60 WPM',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    xpReward: 120,
    condition: (s) => s.duration === 60 && s.wpm >= 60,
  },
  {
    id: 'dc_multilingual',
    title: 'Cultural Touch',
    description: 'Complete any test in Kannada or Hindi with 90%+ accuracy',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    xpReward: 120,
    condition: (s) => (s.lang === 'kn' || s.lang === 'hi') && s.accuracy >= 90,
  },
  {
    id: 'dc_code',
    title: 'Syntax Master',
    description: 'Complete a Code mode test with at least 45 WPM',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    xpReward: 100,
    condition: (s) => s.mode === 'code' && s.wpm >= 45,
  },
];

/**
 * Returns the deterministically selected challenge for the given date.
 */
export function getDailyChallenge(dateStr?: string): DailyChallenge {
  let d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = isNaN(dayOfYear) ? 0 : Math.abs(dayOfYear) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index] || DAILY_CHALLENGES[0];
}
