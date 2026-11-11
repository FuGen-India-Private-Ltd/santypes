// Santypes Settings & User Preferences State Manager
// 100% Framework-Free Pure TypeScript

import { finiteNumber } from '../utils/html.ts';

export type ThemeMode = 'oled' | 'dark' | 'serika';
export type AccentColor = 'cyan' | 'amber' | 'emerald' | 'rose' | 'purple' | 'sky';
export type SoundType = 'click' | 'thock' | 'clack' | 'beep';
export type TypingFontFamily = 'roboto' | 'fira' | 'jetbrains' | 'dm' | 'outfit';

const VALID_THEMES = new Set<ThemeMode>(['oled', 'dark', 'serika']);
const VALID_ACCENTS = new Set<AccentColor>(['cyan', 'amber', 'emerald', 'rose', 'purple', 'sky']);
const VALID_SOUNDS = new Set<SoundType>(['click', 'thock', 'clack', 'beep']);
const VALID_FONTS = new Set<TypingFontFamily>(['roboto', 'fira', 'jetbrains', 'dm', 'outfit']);

export interface SantypesSettings {
  showKeyboard: boolean;
  showChart: boolean;
  wpmGoal: number;
  wordErrorMode: boolean;
  theme: ThemeMode;
  accent: AccentColor;
  fontSize: number; // 18 - 44, default 28
  fontFamily: TypingFontFamily;
  soundEnabled: boolean;
  soundType: SoundType;
  soundVolume: number; // 0 - 100, default 80
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  blindMode: boolean;
}

const SETTINGS_KEY = 'santypes_user_settings';

export const DEFAULT_SETTINGS: SantypesSettings = {
  showKeyboard: true,
  showChart: true,
  wpmGoal: 60,
  wordErrorMode: false,
  theme: 'oled',
  accent: 'cyan',
  fontSize: 24,
  fontFamily: 'jetbrains',
  soundEnabled: true,
  soundType: 'click',
  soundVolume: 80,
  reducedMotion: false,
  highContrast: false,
  dyslexiaFont: false,
  blindMode: false,
};

function sanitizeSettings(raw: Partial<SantypesSettings> | Record<string, unknown>): SantypesSettings {
  const activeFontRaw = (!raw.fontFamily || raw.fontFamily === 'roboto') ? 'jetbrains' : raw.fontFamily;
  const activeSizeRaw = (!raw.fontSize || raw.fontSize === 28) ? 24 : raw.fontSize;

  const theme = VALID_THEMES.has(raw.theme as ThemeMode)
    ? (raw.theme as ThemeMode)
    : DEFAULT_SETTINGS.theme;
  const accent = VALID_ACCENTS.has(raw.accent as AccentColor)
    ? (raw.accent as AccentColor)
    : DEFAULT_SETTINGS.accent;
  const soundType = VALID_SOUNDS.has(raw.soundType as SoundType)
    ? (raw.soundType as SoundType)
    : DEFAULT_SETTINGS.soundType;
  const fontFamily = VALID_FONTS.has(activeFontRaw as TypingFontFamily)
    ? (activeFontRaw as TypingFontFamily)
    : DEFAULT_SETTINGS.fontFamily;

  return {
    showKeyboard: typeof raw.showKeyboard === 'boolean' ? raw.showKeyboard : true,
    showChart: typeof raw.showChart === 'boolean' ? raw.showChart : DEFAULT_SETTINGS.showChart,
    wpmGoal: Math.round(finiteNumber(raw.wpmGoal, DEFAULT_SETTINGS.wpmGoal, 10, 300)),
    wordErrorMode: Boolean(raw.wordErrorMode),
    theme,
    accent,
    fontSize: Math.round(finiteNumber(activeSizeRaw, DEFAULT_SETTINGS.fontSize, 18, 44)),
    fontFamily,
    soundEnabled: raw.soundEnabled !== false,
    soundType,
    soundVolume: Math.round(finiteNumber(raw.soundVolume, DEFAULT_SETTINGS.soundVolume, 0, 100)),
    reducedMotion: Boolean(raw.reducedMotion),
    highContrast: Boolean(raw.highContrast),
    dyslexiaFont: Boolean(raw.dyslexiaFont),
    blindMode: Boolean(raw.blindMode),
  };
}

export function getSettings(isLessonMode: boolean = false): SantypesSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...DEFAULT_SETTINGS };
    }

    const sanitized = sanitizeSettings(parsed);
    if (isLessonMode) {
      sanitized.showKeyboard = true;
    }
    return sanitized;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: SantypesSettings): void {
  const clean = sanitizeSettings(settings);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(clean));
    applySettingsToDOM(clean);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('santypes:settings-updated', { detail: clean }));
    }
  } catch (e) {
    console.warn('Could not save settings:', e);
  }
}

export function updateSetting<K extends keyof SantypesSettings>(
  key: K,
  value: SantypesSettings[K]
): void {
  const current = getSettings();
  current[key] = value;
  saveSettings(current);
}

export function resetSettings(): SantypesSettings {
  saveSettings(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS };
}

/**
 * Applies active settings to DOM root (CSS custom properties, data attributes).
 */
export function applySettingsToDOM(settings: SantypesSettings): void {
  if (typeof document === 'undefined' || !document.documentElement) return;
  const root = document.documentElement;

  const clean = sanitizeSettings(settings);
  // Theme & Accent
  root.setAttribute('data-theme', clean.theme);
  root.setAttribute('data-accent', clean.accent);

  // Font Size & Font Family
  root.style.setProperty('--typing-font-size', `${clean.fontSize}px`);
  const fontMap: Record<TypingFontFamily, string> = {
    roboto: "'Roboto Mono', monospace",
    fira: "'Fira Code', monospace",
    jetbrains: "'JetBrains Mono', monospace",
    dm: "'DM Mono', monospace",
    outfit: "'Outfit', sans-serif",
  };
  root.style.setProperty('--font-typing', fontMap[clean.fontFamily] || fontMap.jetbrains);

  // Accessibility flags
  root.setAttribute('data-reduced-motion', String(clean.reducedMotion));
  root.setAttribute('data-high-contrast', String(clean.highContrast));
  root.setAttribute('data-dyslexia', String(clean.dyslexiaFont));
  root.setAttribute('data-blind-mode', String(clean.blindMode));
}
