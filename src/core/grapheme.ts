// Internationalized Unicode Grapheme Cluster Utilities
// Essential for Indic scripts (Hindi, Kannada) so matras, viramas, and conjuncts stay intact.

import { LanguageCode } from './types.ts';

const segmenterCache = new Map<string, Intl.Segmenter>();

function getSegmenter(lang: LanguageCode = 'en'): Intl.Segmenter | null {
  if (typeof Intl === 'undefined' || typeof Intl.Segmenter !== 'function') {
    return null;
  }
  const key = lang || 'en';
  if (!segmenterCache.has(key)) {
    try {
      segmenterCache.set(key, new Intl.Segmenter(key, { granularity: 'grapheme' }));
    } catch {
      segmenterCache.set(key, new Intl.Segmenter('en', { granularity: 'grapheme' }));
    }
  }
  return segmenterCache.get(key) || null;
}

/**
 * Split text into atomic unicode grapheme clusters.
 * In Indic scripts, e.g. "ಕಿ" remains a single 1-element grapheme rather than 2 broken code units.
 */
export function segmentGraphemes(text: string, lang: LanguageCode = 'en'): string[] {
  if (!text) return [];
  const segmenter = getSegmenter(lang);
  if (!segmenter) {
    // Array.from splits by code points (surrogate-pair safe fallback)
    return Array.from(text);
  }
  return Array.from(segmenter.segment(text), s => s.segment);
}

/**
 * Total count of grapheme clusters.
 */
export function countGraphemes(text: string, lang: LanguageCode = 'en'): number {
  if (!text) return 0;
  return segmentGraphemes(text, lang).length;
}

/**
 * Split input text by whitespace into words, preserving words with their constituent graphemes.
 */
export function tokenizeWordsWithGraphemes(
  text: string,
  lang: LanguageCode = 'en'
): Array<{ word: string; graphemes: string[] }> {
  if (!text) return [];
  const rawWords = text.trim().split(/\s+/).filter(w => w.length > 0);
  return rawWords.map(word => ({
    word,
    graphemes: segmentGraphemes(word, lang),
  }));
}
