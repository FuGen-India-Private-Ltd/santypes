// Santypes Pure Mathematical Metrics Module
// 100% Framework-Free Pure TypeScript

import { FingerName } from './types.ts';
import { finiteNumber } from '../utils/html.ts';

function safePosDivisor(val: number, fallback: number = 5): number {
  const n = finiteNumber(val, fallback);
  return n > 0 ? n : fallback;
}

/**
 * Headline Net WPM based on standardized grapheme clusters.
 * Formula: ((correctGraphemes / N) - (uncorrectedErrors / N)) / elapsedMinutes
 */
export function calculateNetWpm(
  correctGraphemes: number,
  uncorrectedErrorGraphemes: number,
  elapsedMinutes: number,
  charsPerWord: number = 5
): number {
  const mins = finiteNumber(elapsedMinutes, 0);
  if (mins <= 0) return 0;
  const divisor = safePosDivisor(charsPerWord, 5);
  const correct = finiteNumber(correctGraphemes, 0, 0);
  const uncorrected = finiteNumber(uncorrectedErrorGraphemes, 0, 0);
  const netWords = (correct / divisor) - (uncorrected / divisor);
  const wpm = netWords / mins;
  return Number.isFinite(wpm) ? Math.max(0, Math.round(wpm)) : 0;
}

/**
 * Raw WPM without error deductions.
 * Formula: (totalKeystrokes / N) / elapsedMinutes
 */
export function calculateRawWpm(
  totalKeystrokes: number,
  elapsedMinutes: number,
  charsPerWord: number = 5
): number {
  const mins = finiteNumber(elapsedMinutes, 0);
  if (mins <= 0) return 0;
  const divisor = safePosDivisor(charsPerWord, 5);
  const keys = finiteNumber(totalKeystrokes, 0, 0);
  const rawWords = (keys / divisor) / mins;
  return Number.isFinite(rawWords) ? Math.max(0, Math.round(rawWords)) : 0;
}

/**
 * Space-delimited completed natural words per minute.
 */
export function calculateWordsPerMinute(
  completedWordsCount: number,
  elapsedMinutes: number
): number {
  const mins = finiteNumber(elapsedMinutes, 0);
  if (mins <= 0) return 0;
  const words = finiteNumber(completedWordsCount, 0, 0);
  const val = Math.round(words / mins);
  return Number.isFinite(val) ? Math.max(0, val) : 0;
}

/**
 * Physical Keystrokes Per Minute.
 */
export function calculateKeystrokesPerMinute(
  totalKeystrokes: number,
  elapsedMinutes: number
): number {
  const mins = finiteNumber(elapsedMinutes, 0);
  if (mins <= 0) return 0;
  const keys = finiteNumber(totalKeystrokes, 0, 0);
  const val = Math.round(keys / mins);
  return Number.isFinite(val) ? Math.max(0, val) : 0;
}

/**
 * Accuracy percentage [0, 100].
 */
export function calculateAccuracy(
  correctStrokes: number,
  totalStrokes: number
): number {
  const total = finiteNumber(totalStrokes, 0, 0);
  if (total <= 0) return 100;
  const correct = finiteNumber(correctStrokes, 0, 0);
  const acc = (correct / total) * 100;
  return Number.isFinite(acc) ? Math.max(0, Math.min(100, Math.round(acc))) : 100;
}

/**
 * Consistency percentage computed from 1-second WPM samples via Coefficient of Variation.
 * Consistency = max(0, min(100, round(100 * (1 - (stdDev / mean)))))
 */
export function calculateConsistency(wpmBuckets: number[]): number {
  if (!Array.isArray(wpmBuckets) || wpmBuckets.length < 2) return 100;

  const clean = wpmBuckets.map((val) => finiteNumber(val, 0, 0, 1000));
  const mean = clean.reduce((sum, val) => sum + val, 0) / clean.length;
  if (!Number.isFinite(mean) || mean <= 0) return 100;

  const variance =
    clean.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / clean.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  const consistency = Math.round(100 * (1 - coefficientOfVariation));
  return Number.isFinite(consistency) ? Math.max(0, Math.min(100, consistency)) : 100;
}

/**
 * Instant Burst Velocity over rolling time window (e.g. 1.5 seconds).
 */
export function calculateBurstWpm(
  recentKeystrokeCount: number,
  windowSeconds: number = 1.5,
  charsPerWord: number = 5
): number {
  const winSec = finiteNumber(windowSeconds, 0);
  if (winSec <= 0) return 0;
  const divisor = safePosDivisor(charsPerWord, 5);
  const recent = finiteNumber(recentKeystrokeCount, 0, 0);
  const wordsInWindow = recent / divisor;
  const minutes = winSec / 60;
  const val = Math.round(wordsInWindow / minutes);
  return Number.isFinite(val) ? Math.max(0, val) : 0;
}

/**
 * Biomechanical finger assignment for QWERTY physical keyboard mapping.
 */
const FINGER_KEY_MAP: Record<string, FingerName> = {
  // Left Pinky
  '`': 'L pinky', '~': 'L pinky',
  '1': 'L pinky', '!': 'L pinky',
  'q': 'L pinky', 'Q': 'L pinky',
  'a': 'L pinky', 'A': 'L pinky',
  'z': 'L pinky', 'Z': 'L pinky',

  // Left Ring
  '2': 'L ring', '@': 'L ring',
  'w': 'L ring', 'W': 'L ring',
  's': 'L ring', 'S': 'L ring',
  'x': 'L ring', 'X': 'L ring',

  // Left Middle
  '3': 'L middle', '#': 'L middle',
  'e': 'L middle', 'E': 'L middle',
  'd': 'L middle', 'D': 'L middle',
  'c': 'L middle', 'C': 'L middle',

  // Left Index
  '4': 'L index', '$': 'L index',
  '5': 'L index', '%': 'L index',
  'r': 'L index', 'R': 'L index',
  't': 'L index', 'T': 'L index',
  'f': 'L index', 'F': 'L index',
  'g': 'L index', 'G': 'L index',
  'v': 'L index', 'V': 'L index',
  'b': 'L index', 'B': 'L index',

  // Right Index
  '6': 'R index', '^': 'R index',
  '7': 'R index', '&': 'R index',
  'y': 'R index', 'Y': 'R index',
  'u': 'R index', 'U': 'R index',
  'h': 'R index', 'H': 'R index',
  'j': 'R index', 'J': 'R index',
  'n': 'R index', 'N': 'R index',
  'm': 'R index', 'M': 'R index',

  // Right Middle
  '8': 'R middle', '*': 'R middle',
  'i': 'R middle', 'I': 'R middle',
  'k': 'R middle', 'K': 'R middle',
  ',': 'R middle', '<': 'R middle',

  // Right Ring
  '9': 'R ring', '(': 'R ring',
  'o': 'R ring', 'O': 'R ring',
  'l': 'R ring', 'L': 'R ring',
  '.': 'R ring', '>': 'R ring',

  // Right Pinky
  '0': 'R pinky', ')': 'R pinky',
  '-': 'R pinky', '_': 'R pinky',
  '=': 'R pinky', '+': 'R pinky',
  'p': 'R pinky', 'P': 'R pinky',
  '[': 'R pinky', '{': 'R pinky',
  ']': 'R pinky', '}': 'R pinky',
  '\\': 'R pinky', '|': 'R pinky',
  ';': 'R pinky', ':': 'R pinky',
  "'": 'R pinky', '"': 'R pinky',
  '/': 'R pinky', '?': 'R pinky',
};

export function fingerForKey(key: string): FingerName {
  if (!key || key === ' ') return 'Thumb / Other';
  return FINGER_KEY_MAP[key] || FINGER_KEY_MAP[key.toLowerCase()] || 'Thumb / Other';
}

/**
 * Summarize weak keys sorted by error count descending.
 */
export function summarizeWeakKeys(
  errorMap?: Record<string, number> | null,
  limit: number = 8
): Array<{ key: string; count: number }> {
  if (!errorMap || typeof errorMap !== 'object') return [];
  return Object.entries(errorMap)
    .filter((entry) => typeof entry[1] === 'number' && entry[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(0, limit))
    .map(([key, count]) => ({ key, count }));
}

/**
 * Summarize finger error analysis.
 */
export function summarizeFingerMap(
  fingerMap?: Record<string, number> | null
): Array<{ finger: FingerName; count: number }> {
  if (!fingerMap || typeof fingerMap !== 'object') return [];
  return (Object.entries(fingerMap) as Array<[FingerName, number]>)
    .filter((entry) => typeof entry[1] === 'number' && entry[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([finger, count]) => ({ finger, count }));
}
