import { describe, it, expect } from 'vitest';
import {
  getTextForMode,
  randomOf,
  buildAdaptiveText,
  generateNumbersText,
  generatePunctuationText,
  generateMixedText,
  getRandomWordsArray,
} from '../src/core/corpora.ts';
import { TypingMode } from '../src/core/types.ts';

describe('Corpora & Mode Text Generator', () => {
  const modes: TypingMode[] = [
    'time',
    'words',
    'quote',
    'paragraph',
    'story',
    'book',
    'code',
    'numbers',
    'punctuation',
    'mixed',
    'custom',
    'ai',
  ];

  it('generates non-empty text for all 12 modes in English', () => {
    for (const mode of modes) {
      const result = getTextForMode(mode, {
        wordCount: 20,
        customText: 'Custom test string',
        weakKeys: [{ key: 'e' }, { key: 't' }],
      });
      expect(result.text).toBeTruthy();
      expect(result.text.length).toBeGreaterThan(5);
      if (mode === 'quote') {
        expect(result.author).toBeTruthy();
      }
    }
  });

  it('generates Kannada native and Kanglish text', () => {
    const native = getTextForMode('paragraph', { lang: 'kn', kannadaType: 'native' });
    expect(native.text).toMatch(/[\u0C80-\u0CFF]/);

    const kanglish = getTextForMode('paragraph', { lang: 'kn', kannadaType: 'kanglish' });
    expect(kanglish.text).not.toMatch(/[\u0C80-\u0CFF]/);
  });

  it('generates Hindi native and Hinglish text', () => {
    const native = getTextForMode('paragraph', { lang: 'hi', hindiType: 'native' });
    expect(native.text).toMatch(/[\u0900-\u097F]/);

    const hinglish = getTextForMode('paragraph', { lang: 'hi', hindiType: 'hinglish' });
    expect(hinglish.text).not.toMatch(/[\u0900-\u097F]/);
  });

  it('anti-repeat ring buffer avoids repeating the same item consecutively', () => {
    const sample = ['itemA', 'itemB', 'itemC', 'itemD'];
    let prev = '';
    let repeated = false;
    for (let i = 0; i < 20; i++) {
      const picked = randomOf(sample, 'anti_repeat_test');
      if (picked === prev) {
        repeated = true;
        break;
      }
      prev = picked;
    }
    expect(repeated).toBe(false);
  });

  it('buildAdaptiveText generates targeted practice using weak keys', () => {
    const drill = buildAdaptiveText([{ key: 'x' }, { key: 'z' }]);
    expect(drill).toContain('Focus keys:');
    expect(drill).toContain('x');
    expect(drill).toContain('z');
  });

  it('generates specialized drills for numbers, punctuation, and mixed', () => {
    const nums = generateNumbersText(10);
    expect(nums.split(' ').length).toBe(10);
    expect(/\d/.test(nums)).toBe(true);

    const punct = generatePunctuationText(10);
    expect(punct.split(' ').length).toBe(10);
    expect(/[";:!?()[\]{}]/.test(punct)).toBe(true);

    const mixed = generateMixedText(10);
    expect(mixed.split(' ').length).toBe(10);
  });

  it('replenishes dynamic words in the selected language and script', () => {
    const enWords = getRandomWordsArray(15, 'en');
    expect(enWords.length).toBe(15);
    expect(enWords.every(w => /^[a-z]+$/i.test(w))).toBe(true);

    const knWords = getRandomWordsArray(10, 'kn', 'native');
    expect(knWords.length).toBe(10);
    expect(knWords.some(w => /[\u0C80-\u0CFF]/.test(w))).toBe(true);

    const hiWords = getRandomWordsArray(10, 'hi', 'native');
    expect(hiWords.length).toBe(10);
    expect(hiWords.some(w => /[\u0900-\u097F]/.test(w))).toBe(true);
  });
});
