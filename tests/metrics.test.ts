import { describe, it, expect } from 'vitest';
import {
  calculateNetWpm,
  calculateRawWpm,
  calculateWordsPerMinute,
  calculateKeystrokesPerMinute,
  calculateAccuracy,
  calculateConsistency,
  calculateBurstWpm,
  fingerForKey,
  summarizeWeakKeys,
  summarizeFingerMap,
} from '../src/core/metrics.ts';

describe('Metrics Calculations', () => {
  it('calculates Net WPM with error penalties correctly', () => {
    // 250 correct graphemes, 0 errors in 1 minute with N=5 => 50 WPM
    expect(calculateNetWpm(250, 0, 1, 5)).toBe(50);

    // 250 correct graphemes, 10 errors (2 word penalty) in 1 minute with N=5 => 48 WPM
    expect(calculateNetWpm(250, 10, 1, 5)).toBe(48);

    // If penalty exceeds words, clamped at 0
    expect(calculateNetWpm(10, 50, 1, 5)).toBe(0);

    // If elapsedMinutes is 0, returns 0
    expect(calculateNetWpm(100, 0, 0, 5)).toBe(0);
  });

  it('calculates Raw WPM correctly', () => {
    // 300 total keystrokes in 1 minute with N=5 => 60 WPM
    expect(calculateRawWpm(300, 1, 5)).toBe(60);
    // 300 total keystrokes in 0.5 minutes (30s) => 120 WPM
    expect(calculateRawWpm(300, 0.5, 5)).toBe(120);
  });

  it('calculates natural space-delimited words per minute', () => {
    expect(calculateWordsPerMinute(40, 1)).toBe(40);
    expect(calculateWordsPerMinute(20, 0.5)).toBe(40);
  });

  it('calculates keystrokes per minute', () => {
    expect(calculateKeystrokesPerMinute(450, 1)).toBe(450);
  });

  it('calculates accuracy percentage accurately', () => {
    expect(calculateAccuracy(100, 100)).toBe(100);
    expect(calculateAccuracy(95, 100)).toBe(95);
    expect(calculateAccuracy(0, 0)).toBe(100);
    expect(calculateAccuracy(0, 10)).toBe(0);
  });

  it('calculates consistency percentage via Coefficient of Variation', () => {
    // Perfectly consistent: all 60 WPM
    expect(calculateConsistency([60, 60, 60, 60])).toBe(100);

    // Small variance: steady typing
    const steady = [60, 62, 58, 61, 59];
    expect(calculateConsistency(steady)).toBeGreaterThanOrEqual(95);

    // Very erratic typing: bursts followed by halts
    const erratic = [10, 120, 5, 140, 0];
    expect(calculateConsistency(erratic)).toBeLessThan(60);

    // Fewer than 2 samples defaults to 100
    expect(calculateConsistency([60])).toBe(100);
  });

  it('calculates rolling burst velocity in 1.5s window', () => {
    // 15 keystrokes in 1.5s with N=5 => 3 words in 0.025 min => 120 WPM
    expect(calculateBurstWpm(15, 1.5, 5)).toBe(120);
  });

  it('maps QWERTY keys to correct biomechanical fingers', () => {
    expect(fingerForKey('q')).toBe('L pinky');
    expect(fingerForKey('w')).toBe('L ring');
    expect(fingerForKey('e')).toBe('L middle');
    expect(fingerForKey('r')).toBe('L index');
    expect(fingerForKey('t')).toBe('L index');
    expect(fingerForKey('y')).toBe('R index');
    expect(fingerForKey('u')).toBe('R index');
    expect(fingerForKey('i')).toBe('R middle');
    expect(fingerForKey('o')).toBe('R ring');
    expect(fingerForKey('8')).toBe('R middle');
    expect(fingerForKey('9')).toBe('R ring');
    expect(fingerForKey('(')).toBe('R ring');
    expect(fingerForKey('0')).toBe('R pinky');
    expect(fingerForKey(' ')).toBe('Thumb / Other');
  });

  it('summarizes weak keys and finger maps descending', () => {
    const errorMap = { e: 5, t: 2, z: 9 };
    const weak = summarizeWeakKeys(errorMap, 2);
    expect(weak).toEqual([
      { key: 'z', count: 9 },
      { key: 'e', count: 5 },
    ]);

    const fingerMap: Record<string, number> = {
      'L pinky': 10,
      'R index': 3,
    };
    const summarizedFingers = summarizeFingerMap(fingerMap);
    expect(summarizedFingers[0].finger).toBe('L pinky');

    // Safe handling of null/undefined inputs
    expect(summarizeWeakKeys(null)).toEqual([]);
    expect(summarizeWeakKeys(undefined)).toEqual([]);
    expect(summarizeFingerMap(null)).toEqual([]);
    expect(summarizeFingerMap(undefined)).toEqual([]);
    expect(calculateConsistency(null as unknown as number[])).toBe(100);
    expect(calculateConsistency([])).toBe(100);
  });
});
