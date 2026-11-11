// Santypes Settings & Accessibility Modal Controller
// 100% Framework-Free Pure TypeScript

import {
  getSettings,
  updateSetting,
  resetSettings,
  SantypesSettings,
  AccentColor,
  ThemeMode,
  SoundType,
  TypingFontFamily,
} from '../stubs/settings-stub.ts';
import { playTactileClick } from '../utils/sound.ts';
import {
  denyAnalyticsConsent,
  eraseAllLocalUserData,
  getAnalyticsConsentStatus,
  grantAnalyticsConsent,
} from '../utils/privacy.ts';
import {
  captureActiveElement,
  confirmActionDialog,
  focusInitialDialogControl,
  isTopmostModalBackdrop,
  restoreFocusSafe,
  trapTabWithinModal,
} from '../utils/dialog-host.ts';
import { PrivacyModal } from './privacy-modal.ts';
import { showNotificationToast } from './celebration-toast.ts';
import { syncConsentBannerVisibility } from './consent-banner.ts';

type SettingsTab = 'appearance' | 'trainer' | 'sound' | 'accessibility' | 'privacy';

const VALID_TABS = new Set<SettingsTab>([
  'appearance',
  'trainer',
  'sound',
  'accessibility',
  'privacy',
]);
const VALID_FONTS = new Set<TypingFontFamily>(['roboto', 'fira', 'jetbrains', 'dm', 'outfit']);
const VALID_THEMES = new Set<ThemeMode>(['oled', 'dark', 'serika']);
const VALID_SOUNDS = new Set<SoundType>(['click', 'thock', 'clack', 'beep']);

export class SettingsModal {
  private static activeInstance: SettingsModal | null = null;
  private backdrop: HTMLElement | null = null;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private activeTab: SettingsTab = 'appearance';

  public show(): void {
    if (SettingsModal.activeInstance && SettingsModal.activeInstance !== this) {
      SettingsModal.activeInstance.close();
    }
    this.close();
    SettingsModal.activeInstance = this;
    this.previouslyFocused = captureActiveElement();

    const backdrop = document.createElement('div');
    backdrop.className = 'settings-modal-backdrop modal-backdrop visible';
    this.backdrop = backdrop;

    this.renderModalContent();
    document.body.appendChild(backdrop);
    syncConsentBannerVisibility();
    focusInitialDialogControl(backdrop);

    // Escape & Tab focus-trap listener
    this.keydownListener = (e: KeyboardEvent) => {
      if (!this.backdrop || !isTopmostModalBackdrop(this.backdrop)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.close();
        return;
      }
      trapTabWithinModal(e, this.backdrop);
    };
    window.addEventListener('keydown', this.keydownListener, true);

    // Backdrop click to close
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });
  }

  private renderModalContent(): void {
    if (!this.backdrop) return;

    this.backdrop.innerHTML = `
      <div class="settings-card-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="settings-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <div>
              <h2 class="modal-title" id="settings-modal-title" style="margin:0;font-size:18px;">Preferences & Accessibility</h2>
              <span style="font-size:11px;color:var(--text-muted);">Customize theme, typography, tactile sound, and assistive tools</span>
            </div>
          </div>
          <button type="button" class="modal-close-btn" id="btn-close-settings" aria-label="Close settings" title="Close (Esc)" style="display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Category Tabs Navigation -->
        <div class="settings-tabs-nav">
          <button class="settings-tab-btn ${this.activeTab === 'appearance' ? 'active' : ''}" data-tab="appearance">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20"></path></svg>
            <span>Appearance & Font</span>
          </button>
          <button class="settings-tab-btn ${this.activeTab === 'trainer' ? 'active' : ''}" data-tab="trainer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <span>Trainer & Arena</span>
          </button>
          <button class="settings-tab-btn ${this.activeTab === 'sound' ? 'active' : ''}" data-tab="sound">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Tactile Audio</span>
          </button>
          <button class="settings-tab-btn ${this.activeTab === 'accessibility' ? 'active' : ''}" data-tab="accessibility">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"></circle><path d="M18 9h-6l-2 11"></path><path d="M6 9h6l2 11"></path></svg>
            <span>Accessibility</span>
          </button>
          <button class="settings-tab-btn ${this.activeTab === 'privacy' ? 'active' : ''}" data-tab="privacy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Privacy &amp; Data</span>
          </button>
        </div>

        <!-- Scrollable Body Content -->
        <div class="settings-scroll-body" id="settings-body-container"></div>

        <!-- Modal Footer -->
        <div class="settings-modal-footer">
          <button class="btn-danger-text" id="btn-reset-settings" style="display:inline-flex;align-items:center;gap:6px;" title="Reset all options to factory defaults">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            <span>Reset to Defaults</span>
          </button>
          <button class="btn-primary" id="btn-done-settings" style="min-height:36px;padding:0 22px;font-weight:800;">
            <span>Done</span>
          </button>
        </div>
      </div>
    `;

    this.bindStaticEvents();
    this.renderCurrentTabBody();
  }

  private renderCurrentTabBody(): void {
    if (!this.backdrop) return;
    const bodyContainer = this.backdrop.querySelector<HTMLElement>('#settings-body-container');
    if (!bodyContainer) return;

    const settings = getSettings();
    bodyContainer.innerHTML = this.renderTabContentHTML(settings);
    this.bindBodyEvents();
  }

  private renderTabContentHTML(settings: SantypesSettings): string {
    if (this.activeTab === 'appearance') {
      return `
        <!-- Theme Selection -->
        <div class="settings-group">
          <span class="settings-group-title">Display Theme</span>
          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Color Scheme</span>
              <span class="settings-desc">Choose between ultra-deep OLED pure black, matte dark, or warm serika</span>
            </div>
            <div class="option-pills-row">
              <button class="option-pill-btn ${settings.theme === 'oled' ? 'active' : ''}" data-setting="theme" data-val="oled">OLED Black</button>
              <button class="option-pill-btn ${settings.theme === 'dark' ? 'active' : ''}" data-setting="theme" data-val="dark">Matte Dark</button>
              <button class="option-pill-btn ${settings.theme === 'serika' ? 'active' : ''}" data-setting="theme" data-val="serika">Warm Serika</button>
            </div>
          </div>
        </div>

        <!-- Accent Color Swatches -->
        <div class="settings-group">
          <span class="settings-group-title">Accent & Caret Color</span>
          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Primary Glow & Caret</span>
              <span class="settings-desc">Sets the electric color used for the caret, stats, and buttons</span>
            </div>
            <div class="accent-swatches">
              ${this.renderAccentSwatch('cyan', '#38bdf8', 'Electric Cyan', settings.accent)}
              ${this.renderAccentSwatch('amber', '#f59e0b', 'Amber Gold', settings.accent)}
              ${this.renderAccentSwatch('emerald', '#10b981', 'Emerald Green', settings.accent)}
              ${this.renderAccentSwatch('rose', '#f43f5e', 'Neon Rose', settings.accent)}
              ${this.renderAccentSwatch('purple', '#a855f7', 'Cyber Violet', settings.accent)}
              ${this.renderAccentSwatch('sky', '#0ea5e9', 'Sky Blue', settings.accent)}
            </div>
          </div>
        </div>

        <!-- Typing Font Family Selector -->
        <div class="settings-group">
          <span class="settings-group-title">Typing Font Family</span>
          <div class="settings-row settings-row-col">
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:8px;">
              <div class="settings-row-info">
                <span class="settings-label">Font Family</span>
                <span class="settings-desc">Choose typography style for the typing test arena</span>
              </div>
            </div>
            <div class="font-family-pills" style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="option-pill-btn ${(settings.fontFamily || 'roboto') === 'roboto' ? 'active' : ''}" data-font="roboto" style="font-family:'Roboto Mono', monospace;">Roboto Mono</button>
              <button class="option-pill-btn ${settings.fontFamily === 'fira' ? 'active' : ''}" data-font="fira" style="font-family:'Fira Code', monospace;">Fira Code</button>
              <button class="option-pill-btn ${settings.fontFamily === 'dm' ? 'active' : ''}" data-font="dm" style="font-family:'DM Mono', monospace;">DM Mono</button>
              <button class="option-pill-btn ${settings.fontFamily === 'jetbrains' ? 'active' : ''}" data-font="jetbrains" style="font-family:'JetBrains Mono', monospace;">JetBrains Mono</button>
              <button class="option-pill-btn ${settings.fontFamily === 'outfit' ? 'active' : ''}" data-font="outfit" style="font-family:'Outfit', sans-serif;">Outfit Sans</button>
            </div>
          </div>
        </div>

        <!-- Typing Font Size Slider -->
        <div class="settings-group">
          <span class="settings-group-title">Typing Font Size</span>
          <div class="settings-row settings-row-col">
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
              <div class="settings-row-info">
                <span class="settings-label">Font Scale</span>
                <span class="settings-desc">Adjust size of characters inside the typing arena (18px – 44px)</span>
              </div>
              <span class="range-val-badge" id="label-font-size">${settings.fontSize}px</span>
            </div>
            <div class="range-slider-wrapper">
              <span class="range-limit">18px</span>
              <input type="range" min="18" max="44" step="2" value="${settings.fontSize}" class="settings-range-input" id="range-font-size" />
              <span class="range-limit">44px</span>
            </div>

            <!-- Live Text Preview -->
            <div class="font-preview-box">
              <div class="preview-box-header" style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">
                Live Arena Size Preview
              </div>
              <div class="font-preview-text" id="font-preview-target" style="font-size: ${settings.fontSize}px; font-family: var(--font-typing);">
                <span class="correct">the quick brown fox</span> <span class="cursor">|</span>jumps over
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'trainer') {
      return `
        <!-- WPM Goal Slider -->
        <div class="settings-group">
          <span class="settings-group-title">WPM Benchmark Target</span>
          <div class="settings-row settings-row-col">
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
              <div class="settings-row-info">
                <span class="settings-label">Target Speed Goal</span>
                <span class="settings-desc">Sets the ghost race target and live benchmark indicator</span>
              </div>
              <span class="range-val-badge" id="label-wpm-goal">${settings.wpmGoal} WPM</span>
            </div>
            <div class="range-slider-wrapper">
              <span class="range-limit">30</span>
              <input type="range" min="30" max="160" step="5" value="${settings.wpmGoal}" class="settings-range-input" id="range-wpm-goal" />
              <span class="range-limit">160</span>
            </div>
          </div>
        </div>

        <!-- Training Aids Toggles -->
        <div class="settings-group">
          <span class="settings-group-title">Visual Aids</span>
          
          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Live Virtual Keyboard</span>
              <span class="settings-desc">Displays finger color assignments and next target keycap</span>
            </div>
            <label class="switch-control">
              <input type="checkbox" id="toggle-keyboard" ${settings.showKeyboard ? 'checked' : ''} />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Real-Time Velocity Wave</span>
              <span class="settings-desc">Live Canvas sparkline waveform showing instant burst speed</span>
            </div>
            <label class="switch-control">
              <input type="checkbox" id="toggle-chart" ${settings.showChart ? 'checked' : ''} />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Word-Error Mode</span>
              <span class="settings-desc">Highlights entire word in red upon error instead of single character</span>
            </div>
            <label class="switch-control">
              <input type="checkbox" id="toggle-word-error" ${settings.wordErrorMode ? 'checked' : ''} />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Blind Discipline Mode</span>
              <span class="settings-desc">Hides character error colors until test completion for pure touch muscle memory</span>
            </div>
            <label class="switch-control">
              <input type="checkbox" id="toggle-blind-mode" ${settings.blindMode ? 'checked' : ''} />
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'sound') {
      return `
        <!-- Sound Master Toggle -->
        <div class="settings-group">
          <span class="settings-group-title">Audio Synthesizer</span>
          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Mechanical Keystroke Audio</span>
              <span class="settings-desc">Ultra-low latency procedural Web Audio clicks on every keypress</span>
            </div>
            <label class="switch-control">
              <input type="checkbox" id="toggle-sound-master" ${settings.soundEnabled ? 'checked' : ''} />
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Sound Style & Volume -->
        <div class="settings-group">
          <span class="settings-group-title">Switch Sound Profile</span>
          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Keycap Sound Profile</span>
              <span class="settings-desc">Select tactile timbre for keyboard strikes</span>
            </div>
            <div class="option-pills-row">
              <button class="option-pill-btn ${settings.soundType === 'click' ? 'active' : ''}" data-setting="soundType" data-val="click">Tactile Click</button>
              <button class="option-pill-btn ${settings.soundType === 'thock' ? 'active' : ''}" data-setting="soundType" data-val="thock">Linear Thock</button>
              <button class="option-pill-btn ${settings.soundType === 'clack' ? 'active' : ''}" data-setting="soundType" data-val="clack">High Clack</button>
              <button class="option-pill-btn ${settings.soundType === 'beep' ? 'active' : ''}" data-setting="soundType" data-val="beep">8-Bit Beep</button>
            </div>
          </div>

          <!-- Volume Slider -->
          <div class="settings-row settings-row-col">
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
              <div class="settings-row-info">
                <span class="settings-label">Audio Volume</span>
                <span class="settings-desc">Fine-tune loudness of keystrokes and button clicks</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <button class="config-btn" id="btn-test-sound" style="padding:6px 14px;min-height:30px;font-size:12px;display:flex;align-items:center;gap:6px;" title="Play sample sound">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  <span>Test</span>
                </button>
                <span class="range-val-badge" id="label-sound-volume">${settings.soundVolume}%</span>
              </div>
            </div>
            <div class="range-slider-wrapper">
              <span class="range-limit">0%</span>
              <input type="range" min="0" max="100" step="5" value="${settings.soundVolume}" class="settings-range-input" id="range-sound-volume" />
              <span class="range-limit">100%</span>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'privacy') {
      const consentGranted = getAnalyticsConsentStatus() === 'granted';
      return `
        <div class="settings-group">
          <span class="settings-group-title">DPDP Act 2023, IT Rules &amp; Consent Controls</span>

          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Optional Usage Analytics (GA4)</span>
              <span class="settings-desc">Disabled by default. Never tracks keystrokes or free-text feedback notes.</span>
            </div>
            <label class="switch-control">
              <input type="checkbox" id="toggle-settings-analytics" aria-label="Optional Usage Analytics" ${consentGranted ? 'checked' : ''} />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Privacy Notice &amp; Grievance Contact</span>
              <span class="settings-desc">Review data processing disclosures, statutory rights, and RFC 9116 security contact</span>
            </div>
            <button type="button" class="btn-secondary" id="btn-settings-open-privacy" style="min-height:32px;padding:6px 14px;font-size:12px;">Open Privacy Notice</button>
          </div>

          <div class="settings-row">
            <div class="settings-row-info">
              <span class="settings-label">Erase All Browser Data</span>
              <span class="settings-desc">Permanently delete history, custom lessons, badges, and saved preferences</span>
            </div>
            <button type="button" class="btn-danger-outline" id="btn-settings-erase-all">Delete All Data</button>
          </div>
        </div>
      `;
    }

    // Accessibility Tab
    return `
      <div class="settings-group">
        <span class="settings-group-title">Visual & Cognitive Accessibility</span>

        <div class="settings-row">
          <div class="settings-row-info">
            <span class="settings-label">Reduced Motion</span>
            <span class="settings-desc">Disables animations, sparkline waves, and transitions for maximum visual calmness</span>
          </div>
          <label class="switch-control">
            <input type="checkbox" id="toggle-reduced-motion" ${settings.reducedMotion ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <span class="settings-label">High Contrast Mode</span>
            <span class="settings-desc">Enhances text borders and character brightness for improved readability</span>
          </div>
          <label class="switch-control">
            <input type="checkbox" id="toggle-high-contrast" ${settings.highContrast ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <span class="settings-label">Dyslexia-Friendly Font</span>
            <span class="settings-desc">Switches to OpenDyslexic letterforms with wide character & word spacing</span>
          </div>
          <label class="switch-control">
            <input type="checkbox" id="toggle-dyslexia" ${settings.dyslexiaFont ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>
      </div>
    `;
  }

  private renderAccentSwatch(
    colorName: AccentColor,
    hex: string,
    label: string,
    activeAccent: AccentColor
  ): string {
    const isActive = colorName === activeAccent;
    return `
      <button
        class="accent-swatch ${isActive ? 'active' : ''}"
        data-accent="${colorName}"
        title="${label}"
        style="background-color: ${hex}; --swatch-color: ${hex};"
      ></button>
    `;
  }

  private bindStaticEvents(): void {
    if (!this.backdrop) return;

    // Close button & Done button
    const closeBtn = this.backdrop.querySelector('#btn-close-settings');
    const doneBtn = this.backdrop.querySelector('#btn-done-settings');
    closeBtn?.addEventListener('click', () => this.close());
    doneBtn?.addEventListener('click', () => this.close());

    // Tab Navigation Buttons
    const tabBtns = this.backdrop.querySelectorAll<HTMLButtonElement>('.settings-tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        playTactileClick('button');
        const nextTab = btn.dataset.tab as SettingsTab | undefined;
        if (!nextTab || !VALID_TABS.has(nextTab)) return;
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = nextTab;
        this.renderCurrentTabBody();
      });
    });

    // Reset Defaults
    const resetBtn = this.backdrop.querySelector('#btn-reset-settings');
    resetBtn?.addEventListener('click', async () => {
      const confirmed = await confirmActionDialog({
        title: 'Reset All Preferences?',
        message: 'Reset all user settings, theme colors, audio options, and font sizes to defaults?',
        confirmLabel: 'Reset Defaults',
        dangerous: true,
      });
      if (confirmed) {
        playTactileClick('button');
        resetSettings();
        this.renderCurrentTabBody();
      }
    });
  }

  private bindBodyEvents(): void {
    const backdrop = this.backdrop;
    if (!backdrop) return;

    // Option Pills (Theme, SoundType)
    const optionPills = backdrop.querySelectorAll<HTMLButtonElement>('.option-pill-btn');
    optionPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        playTactileClick('button');
        const settingKey = pill.dataset.setting;
        const settingVal = pill.dataset.val;
        if (settingKey === 'theme' && settingVal && VALID_THEMES.has(settingVal as ThemeMode)) {
          pill.parentElement?.querySelectorAll('.option-pill-btn').forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          updateSetting('theme', settingVal as ThemeMode);
        } else if (settingKey === 'soundType' && settingVal && VALID_SOUNDS.has(settingVal as SoundType)) {
          pill.parentElement?.querySelectorAll('.option-pill-btn').forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          updateSetting('soundType', settingVal as SoundType);
        }
      });
    });

    // Accent Swatches
    const swatches = backdrop.querySelectorAll<HTMLButtonElement>('.accent-swatch');
    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        playTactileClick('button');
        const accent = swatch.dataset.accent as AccentColor;
        if (accent) {
          swatches.forEach((s) => s.classList.remove('active'));
          swatch.classList.add('active');
          updateSetting('accent', accent);
        }
      });
    });

    // Font Family Selection
    backdrop.querySelectorAll<HTMLElement>('[data-font]').forEach(btn => {
      btn.addEventListener('click', () => {
        const font = btn.dataset.font as TypingFontFamily | undefined;
        if (font && VALID_FONTS.has(font)) {
          backdrop.querySelectorAll('[data-font]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updateSetting('fontFamily', font);
          const preview = backdrop.querySelector<HTMLElement>('#font-preview-target');
          if (preview) preview.style.fontFamily = 'var(--font-typing)';
        }
      });
    });

    // Font Size Range
    const fontRange = backdrop.querySelector<HTMLInputElement>('#range-font-size');
    const fontLabel = backdrop.querySelector<HTMLElement>('#label-font-size');
    const fontPreview = backdrop.querySelector<HTMLElement>('#font-preview-target');

    fontRange?.addEventListener('input', () => {
      const val = Number(fontRange.value);
      if (fontLabel) fontLabel.textContent = `${val}px`;
      if (fontPreview) fontPreview.style.fontSize = `${val}px`;
      updateSetting('fontSize', val);
    });

    // WPM Goal Range
    const goalRange = backdrop.querySelector<HTMLInputElement>('#range-wpm-goal');
    const goalLabel = backdrop.querySelector<HTMLElement>('#label-wpm-goal');
    goalRange?.addEventListener('input', () => {
      const val = Number(goalRange.value);
      if (goalLabel) goalLabel.textContent = `${val} WPM`;
      updateSetting('wpmGoal', val);
    });

    // Audio Volume Range & Test Button
    const volumeRange = backdrop.querySelector<HTMLInputElement>('#range-sound-volume');
    const volumeLabel = backdrop.querySelector<HTMLElement>('#label-sound-volume');
    volumeRange?.addEventListener('input', () => {
      const val = Number(volumeRange.value);
      if (volumeLabel) volumeLabel.textContent = `${val}%`;
      updateSetting('soundVolume', val);
    });

    const testSoundBtn = backdrop.querySelector('#btn-test-sound');
    testSoundBtn?.addEventListener('click', () => {
      playTactileClick('key');
    });

    // Toggles Binding
    this.bindCheckbox('#toggle-keyboard', 'showKeyboard');
    this.bindCheckbox('#toggle-chart', 'showChart');
    this.bindCheckbox('#toggle-word-error', 'wordErrorMode');
    this.bindCheckbox('#toggle-blind-mode', 'blindMode');
    this.bindCheckbox('#toggle-sound-master', 'soundEnabled');
    this.bindCheckbox('#toggle-reduced-motion', 'reducedMotion');
    this.bindCheckbox('#toggle-high-contrast', 'highContrast');
    this.bindCheckbox('#toggle-dyslexia', 'dyslexiaFont');

    const analyticsToggle = backdrop.querySelector<HTMLInputElement>('#toggle-settings-analytics');
    analyticsToggle?.addEventListener('change', () => {
      playTactileClick('button');
      if (analyticsToggle.checked) {
        grantAnalyticsConsent();
        showNotificationToast('Optional analytics enabled.');
      } else {
        denyAnalyticsConsent();
        showNotificationToast('Analytics disabled and cookies cleared.');
      }
    });

    backdrop.querySelector('#btn-settings-open-privacy')?.addEventListener('click', () => {
      playTactileClick('button');
      this.close();
      new PrivacyModal().show();
    });

    backdrop.querySelector('#btn-settings-erase-all')?.addEventListener('click', async () => {
      playTactileClick('button');
      const confirmed = await confirmActionDialog({
        title: 'Delete All Local Data?',
        message:
          'Permanently delete ALL Santypes history, custom lessons, XP/badges, feedback drafts, and preferences? This cannot be undone.',
        confirmLabel: 'Delete All Data',
        dangerous: true,
      });
      if (confirmed) {
        eraseAllLocalUserData();
        showNotificationToast('All local data erased permanently.');
        this.renderCurrentTabBody();
      }
    });
  }

  private bindCheckbox(
    selector: string,
    settingKey: {
      [K in keyof SantypesSettings]: SantypesSettings[K] extends boolean ? K : never;
    }[keyof SantypesSettings]
  ): void {
    if (!this.backdrop) return;
    const checkbox = this.backdrop.querySelector<HTMLInputElement>(selector);
    checkbox?.addEventListener('change', () => {
      playTactileClick('button');
      updateSetting(settingKey, checkbox.checked);
    });
  }

  public close(): void {
    if (SettingsModal.activeInstance === this) {
      SettingsModal.activeInstance = null;
    }
    const prevFocus = this.previouslyFocused;
    this.previouslyFocused = null;
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener, true);
      this.keydownListener = null;
    }
    syncConsentBannerVisibility();
    restoreFocusSafe(prevFocus);
  }
}
