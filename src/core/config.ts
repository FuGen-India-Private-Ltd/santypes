// Santypes Language & Metric Configuration
import { LanguageCode, LanguageConfig } from './types.ts';

/**
 * Per-language constants and settings.
 * Headline WPM = grapheme clusters / charsPerWord.
 * N = 5 for all languages for now, as specified in Decision 3.
 */
export const LANGUAGE_CONFIGS: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    charsPerWord: 5,
    isIndic: false,
  },
  hi: {
    code: 'hi',
    label: 'Hindi',
    nativeName: 'हिंदी',
    charsPerWord: 5,
    isIndic: true,
  },
  kn: {
    code: 'kn',
    label: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    charsPerWord: 5,
    isIndic: true,
  },
};

export function getLanguageConfig(code: LanguageCode = 'en'): LanguageConfig {
  return LANGUAGE_CONFIGS[code] || LANGUAGE_CONFIGS.en;
}
