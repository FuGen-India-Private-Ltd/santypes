import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSettings,
  updateSetting,
  saveSettings,
  resetSettings,
  applySettingsToDOM,
  DEFAULT_SETTINGS,
} from '../src/stubs/settings-stub.ts';

const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  key: (i: number) => Object.keys(mockStorage)[i] || null,
  length: 0,
};

// Mock document for testing DOM mutations
const attributes: Record<string, string> = {};
const styles: Record<string, string> = {};
(globalThis as unknown as { document: unknown }).document = {
  documentElement: {
    setAttribute: (k: string, v: string) => {
      attributes[k] = v;
    },
    getAttribute: (k: string) => attributes[k] || null,
    style: {
      setProperty: (k: string, v: string) => {
        styles[k] = v;
      },
      getPropertyValue: (k: string) => styles[k] || '',
    },
  },
};
(globalThis as unknown as { window: unknown }).window = {
  dispatchEvent: () => true,
};

describe('Settings & Preferences Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads factory default settings on first initialization', () => {
    const settings = getSettings();
    expect(settings.theme).toBe('oled');
    expect(settings.accent).toBe('cyan');
    expect(settings.fontSize).toBe(24);
    expect(settings.fontFamily).toBe('jetbrains');
    expect(settings.soundEnabled).toBe(true);
    expect(settings.reducedMotion).toBe(false);
    expect(settings.highContrast).toBe(false);
    expect(settings.dyslexiaFont).toBe(false);
    expect(settings.blindMode).toBe(false);
  });

  it('persists and updates individual settings', () => {
    updateSetting('accent', 'rose');
    updateSetting('fontSize', 32);
    updateSetting('fontFamily', 'fira');
    updateSetting('highContrast', true);

    const updated = getSettings();
    expect(updated.accent).toBe('rose');
    expect(updated.fontSize).toBe(32);
    expect(updated.fontFamily).toBe('fira');
    expect(updated.highContrast).toBe(true);
    expect(updated.theme).toBe('oled'); // Unchanged

    saveSettings({ ...updated, theme: 'dark' });
    expect(getSettings().theme).toBe('dark');
  });

  it('resets to factory defaults cleanly', () => {
    updateSetting('theme', 'serika');
    updateSetting('reducedMotion', true);
    expect(getSettings().theme).toBe('serika');

    const reset = resetSettings();
    expect(reset.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(reset.reducedMotion).toBe(DEFAULT_SETTINGS.reducedMotion);
    expect(getSettings().theme).toBe(DEFAULT_SETTINGS.theme);
  });

  it('applies settings attributes and CSS variables to documentElement', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      theme: 'dark' as const,
      accent: 'amber' as const,
      fontSize: 34,
      reducedMotion: true,
      highContrast: true,
      dyslexiaFont: true,
      blindMode: true,
    };

    applySettingsToDOM(settings);

    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.getAttribute('data-accent')).toBe('amber');
    expect(root.getAttribute('data-reduced-motion')).toBe('true');
    expect(root.getAttribute('data-high-contrast')).toBe('true');
    expect(root.getAttribute('data-dyslexia')).toBe('true');
    expect(root.getAttribute('data-blind-mode')).toBe('true');
    expect(root.style.getPropertyValue('--typing-font-size')).toBe('34px');
  });
});
