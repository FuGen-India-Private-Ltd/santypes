import { describe, it, expect } from 'vitest';
import {
  segmentGraphemes,
  countGraphemes,
  tokenizeWordsWithGraphemes,
} from '../src/core/grapheme.ts';

describe('Grapheme Cluster Segmentation', () => {
  it('segments ASCII English text into single character graphemes', () => {
    const text = 'hello';
    const graphemes = segmentGraphemes(text, 'en');
    expect(graphemes).toEqual(['h', 'e', 'l', 'l', 'o']);
    expect(countGraphemes(text, 'en')).toBe(5);
  });

  it('keeps Kannada conjuncts and matras atomic within single grapheme clusters', () => {
    // "ಕಿ" is Ka (U+0C95) + Vowel Sign I (U+0CBF).
    // In code points / UTF-16, length is 2. But as a grapheme cluster, it is 1!
    const kannadaChar = 'ಕಿ';
    const graphemes = segmentGraphemes(kannadaChar, 'kn');
    expect(graphemes.length).toBe(1);
    expect(graphemes[0]).toBe('ಕಿ');

    // "ಕನ್ನಡ":
    // ಕ (1) + ನ್ (1: ನ + virama) + ನ (1) + ಡ (1) => 4 grapheme clusters
    const word = 'ಕನ್ನಡ';
    const wordGraphemes = segmentGraphemes(word, 'kn');
    expect(wordGraphemes.length).toBe(4);
    expect(wordGraphemes[0]).toBe('ಕ');
    expect(wordGraphemes[1]).toBe('ನ್');
    expect(wordGraphemes[2]).toBe('ನ');
    expect(wordGraphemes[3]).toBe('ಡ');
  });

  it('keeps Hindi Devanagari conjuncts and matras atomic', () => {
    // "कि" = क + ि (length is 1 grapheme)
    const hindiChar = 'कि';
    const graphemes = segmentGraphemes(hindiChar, 'hi');
    expect(graphemes.length).toBe(1);
    expect(graphemes[0]).toBe('कि');

    // "नमस्ते" = न (1) + म (1) + स्ते (1: स + ् + त + े) => 3 grapheme clusters
    const word = 'नमस्ते';
    const wordGraphemes = segmentGraphemes(word, 'hi');
    expect(wordGraphemes.length).toBe(3);
  });

  it('tokenizes words while preserving atomic graphemes per word', () => {
    const text = 'The quick ಕನ್ನಡ';
    const tokenized = tokenizeWordsWithGraphemes(text, 'kn');
    expect(tokenized.length).toBe(3);
    expect(tokenized[0].word).toBe('The');
    expect(tokenized[0].graphemes.length).toBe(3);
    expect(tokenized[2].word).toBe('ಕನ್ನಡ');
    expect(tokenized[2].graphemes.length).toBe(4);
  });
});
