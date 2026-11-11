import { describe, it, expect } from 'vitest';
import {
  getFingerGuidance,
  getChapterGuidance,
  FINGER_COLORS,
  HOME_KEYS,
  FINGER_NAMES,
} from '../src/core/finger-guide.ts';

describe('Finger Guidance Biomechanics Engine', () => {
  it('defines valid color palettes, finger names, and home keys for all 9 finger codes', () => {
    const codes = ['lp', 'lr', 'lm', 'li', 'ri', 'rm', 'rr', 'rp', 'thumb'] as const;
    for (const code of codes) {
      expect(FINGER_COLORS[code]).toBeDefined();
      expect(FINGER_NAMES[code]).toBeDefined();
      expect(HOME_KEYS[code]).toBeDefined();
    }
  });

  it('correctly maps Left Hand home row anchors', () => {
    const a = getFingerGuidance('a');
    expect(a.hand).toBe('left');
    expect(a.finger).toBe('pinky');
    expect(a.fingerCode).toBe('lp');
    expect(a.homeKey).toBe('A');
    expect(a.isHomeKey).toBe(true);

    const f = getFingerGuidance('f');
    expect(f.hand).toBe('left');
    expect(f.finger).toBe('index');
    expect(f.fingerCode).toBe('li');
    expect(f.homeKey).toBe('F');
    expect(f.isHomeKey).toBe(true);
    expect(f.instruction).toContain('tactile bump');
  });

  it('correctly maps Right Hand home row anchors', () => {
    const j = getFingerGuidance('j');
    expect(j.hand).toBe('right');
    expect(j.finger).toBe('index');
    expect(j.fingerCode).toBe('ri');
    expect(j.homeKey).toBe('J');
    expect(j.isHomeKey).toBe(true);
    expect(j.instruction).toContain('tactile bump');

    const semi = getFingerGuidance(';');
    expect(semi.hand).toBe('right');
    expect(semi.finger).toBe('pinky');
    expect(semi.fingerCode).toBe('rp');
    expect(semi.homeKey).toBe(';');
  });

  it('correctly identifies reach directions for top and bottom rows', () => {
    const r = getFingerGuidance('r');
    expect(r.fingerCode).toBe('li');
    expect(r.motionType).toBe('reach-up');
    expect(r.homeKey).toBe('F');

    const v = getFingerGuidance('v');
    expect(v.fingerCode).toBe('li');
    expect(v.motionType).toBe('reach-down');
    expect(v.homeKey).toBe('F');

    const t = getFingerGuidance('t');
    expect(t.fingerCode).toBe('li');
    expect(t.motionArrow).toBe('↗');

    const n = getFingerGuidance('n');
    expect(n.fingerCode).toBe('ri');
    expect(n.motionArrow).toBe('↙');
  });

  it('handles uppercase letters with opposite shift hand rules', () => {
    const capA = getFingerGuidance('A');
    expect(capA.requiresShift).toBe(true);
    // 'a' is typed by left hand, so shift must be held by opposite (right) hand
    expect(capA.shiftHand).toBe('right');
    expect(capA.fingerCode).toBe('lp');

    const capJ = getFingerGuidance('J');
    expect(capJ.requiresShift).toBe(true);
    // 'j' is typed by right hand, so shift must be held by opposite (left) hand
    expect(capJ.shiftHand).toBe('left');
    expect(capJ.fingerCode).toBe('ri');
  });

  it('handles shifted symbols', () => {
    const exclamation = getFingerGuidance('!');
    expect(exclamation.requiresShift).toBe(true);
    expect(exclamation.fingerCode).toBe('lp'); // '1' is left pinky

    const percent = getFingerGuidance('%');
    expect(percent.requiresShift).toBe(true);
    expect(percent.fingerCode).toBe('li'); // '5' is left index

    const at = getFingerGuidance('@');
    expect(at.requiresShift).toBe(true);
    expect(at.fingerCode).toBe('lr'); // '2' is left ring
  });

  it('handles spacebar and whitespace', () => {
    const space = getFingerGuidance(' ');
    expect(space.fingerCode).toBe('thumb');
    expect(space.hand).toBe('thumb');
    expect(space.isHomeKey).toBe(true);
  });

  it('generates chapter guidance array without duplicates', () => {
    const guidance = getChapterGuidance(['f', 'j', 'f', 'j']);
    expect(guidance.length).toBe(2);
    expect(guidance[0].key).toBe('f');
    expect(guidance[1].key).toBe('j');
  });
});
