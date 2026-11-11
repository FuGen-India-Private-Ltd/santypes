// Santypes Precision Typing Test View Controller
// Fully typed TypeScript view coordinating Core Engine, Live Keyboard, Pomodoro, and Training Aids

import { TypingEngine } from '../core/engine.ts';
import { getTextForMode, getRandomWordsArray } from '../core/corpora.ts';
import { TypingMode, LanguageCode, SessionResult, LiveMetrics } from '../core/types.ts';
import { getSettings, updateSetting } from '../stubs/settings-stub.ts';
import { saveTestSession, getBestSessionForMode, getRecentWeakKeys } from '../stubs/storage-stub.ts';
import { getActiveLessonChapter, setActiveLessonChapter, completeLessonChapter, getNextChapterAfter } from '../stubs/curriculum-stub.ts';
import { getChapterGuidance } from '../core/finger-guide.ts';
import { processSessionCompletion, SessionCompletionReward } from '../stubs/account-stub.ts';
import { showBadgeCelebration, showLevelUpCelebration } from '../components/celebration-toast.ts';
import { getRankTitle } from '../core/gamification.ts';
import { LiveKeyboard } from '../components/live-keyboard.ts';
import { HandsVisualizer } from '../components/hands-visualizer.ts';
import { BeginnerGuideModal } from '../components/beginner-guide-modal.ts';
import { PomodoroTimer } from '../components/pomodoro.ts';
import { CountdownOverlay } from '../components/countdown.ts';
import { ShortcutsModal } from '../components/shortcuts-modal.ts';
import { playTactileClick } from '../utils/sound.ts';
import { triggerButtonPress } from '../utils/tactile.ts';
import { renderTimelineChart, renderLiveSparkline } from '../utils/chart.ts';
import { escapeHTML, finiteNumber } from '../utils/html.ts';

const MAX_CUSTOM_TYPING_CHARS = 10000;

export function renderTypingTest(container: HTMLElement, onNavigate: ((tab: string) => void) | null = null): () => void {
  let lessonChapter = getActiveLessonChapter();
  const settings = getSettings(!!lessonChapter);
  let showHandsVisualizer = !!lessonChapter;
  let isDestroyed = false;
  const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

  function scheduleSafeTimeout(fn: () => void, ms: number): void {
    const id = setTimeout(() => {
      pendingTimers.delete(id);
      if (!isDestroyed && container.isConnected) {
        fn();
      }
    }, ms);
    pendingTimers.add(id);
  }

  function findStationKeyCard(stationRow: Element, key: string): HTMLElement | null {
    const targetKey = key.toLowerCase();
    for (const card of Array.from(stationRow.querySelectorAll('.lesson-key-card'))) {
      if ((card as HTMLElement).dataset.key === targetKey) {
        return card as HTMLElement;
      }
    }
    return null;
  }

  // Active session configuration state
  const config = {
    mode: (lessonChapter ? lessonChapter.mode : 'words') as TypingMode,
    lang: 'en' as LanguageCode,
    duration: 30,
    wordCount: 25,
    customText: '',
    kannadaType: 'native' as 'native' | 'kanglish',
    hindiType: 'native' as 'native' | 'hinglish',
    quoteLength: 'all',
  };

  let engine: TypingEngine | null = null;
  let quoteAuthor: string | null = null;
  let lastSessionWords: string[] | null = null;
  let activeKeydownListener: ((e: KeyboardEvent) => void) | null = null;
  let caretBlinkTimeout: ReturnType<typeof setTimeout> | null = null;
  let caretRafId: number | null = null;

  // Components
  let liveKeyboard: LiveKeyboard | null = null;
  let handsVisualizer: HandsVisualizer | null = null;
  let pomodoro: PomodoroTimer | null = null;
  let countdown: CountdownOverlay | null = null;
  let shortcutsModal: ShortcutsModal | null = null;

  let bestGhostSession: SessionResult | null = null;
  let focusModeActive = false;

  function renderLessonPracticeStationHTML(): string {
    if (!lessonChapter) return '';
    const rawKeys = lessonChapter.keys && lessonChapter.keys.length > 0
      ? lessonChapter.keys
      : Array.from(new Set((lessonChapter.text || '').toLowerCase().replace(/[^a-z0-9;,./]/g, '').split(''))).slice(0, 8);
    const guidances = getChapterGuidance(rawKeys);
    if (guidances.length === 0) return '';

    return `
      <div class="lesson-practice-station" id="lesson-practice-station">
        <div class="station-header">
          <span class="station-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            <span>Practice Keys</span>
            <span style="color:var(--text-muted);font-weight:500;">(${guidances.length} target key${guidances.length !== 1 ? 's' : ''})</span>
          </span>
          <span class="station-subtitle">Rest on Home Row · Strike only with assigned fingers</span>
        </div>
        <div class="station-keys-row" id="lesson-station-keys-row">
          ${guidances.map(g => `
            <div class="lesson-key-card" data-key="${escapeHTML(g.key.toLowerCase())}" style="--card-color:${escapeHTML(g.fingerColor)};--card-color-glow:${escapeHTML(g.fingerColor)}25;">
              ${g.instruction.includes('tactile bump') ? '<span class="lk-tactile-bump">Bump</span>' : ''}
              <span class="lk-char">${escapeHTML(g.displayKey)}</span>
              <span class="lk-finger">${escapeHTML(g.fingerName)}</span>
              <span class="lk-motion">${escapeHTML(g.motionArrow)} ${escapeHTML(g.motionLabel)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function refreshLessonStation(): void {
    const stationContainer = container.querySelector('#lesson-station-container');
    if (stationContainer) {
      stationContainer.innerHTML = renderLessonPracticeStationHTML();
      (stationContainer as HTMLElement).style.display = lessonChapter ? 'block' : 'none';
    }
    const kbBox = container.querySelector('#kb-live-container') as HTMLElement;
    if (kbBox) {
      kbBox.style.display = !lessonChapter && settings.showKeyboard ? 'block' : 'none';
    }
  }

  function renderDOMShell(): void {
    container.innerHTML = `
      <div class="typing-container" id="main-typing-container">
        <h1 class="sr-only">Santypes Precision Typing Test</h1>
        <!-- 1. Lesson Mode Banner (if active) -->
        <div class="lesson-mode-banner" id="lesson-banner" style="display: ${lessonChapter ? 'flex' : 'none'};">
          <div>
            <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>Lesson Mode</span>
            </div>
            <div class="lesson-meta-title" id="lesson-title">${escapeHTML(lessonChapter?.title || 'Chapter')}</div>
            <div class="lesson-meta-sub" id="lesson-goal">${escapeHTML(lessonChapter?.goal || '')}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span class="mode-pill" style="border:1px solid var(--accent-cyan);color:var(--accent-cyan);">
              Target: ${finiteNumber(lessonChapter?.wpmTarget, 0, 0, 500)} WPM · ${finiteNumber(lessonChapter?.accTarget, 0, 0, 100)}% Acc
            </span>
            <button class="config-btn" id="btn-lesson-beginner-guide" style="border:1px solid rgba(16, 185, 129, 0.4);color:var(--accent-emerald);display:inline-flex;align-items:center;gap:6px;padding:6px 12px;" title="View Hand Placement & Beginner Rules">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              <span>Finger Rules</span>
            </button>
            <button class="config-btn ${showHandsVisualizer ? 'active' : ''}" id="btn-toggle-hands" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;" title="Toggle Interactive Hands Visualizer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
              <span>Hands</span>
            </button>
            <button class="config-btn" id="btn-lesson-restart" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              <span>Restart</span>
            </button>
            <button class="config-btn" id="btn-lesson-exit" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span>Exit</span>
            </button>
          </div>
        </div>

        <!-- 2. Caps Lock Warning -->
        <div class="caps-warn-banner" id="caps-warn-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>Caps Lock is ON — this will cause typing errors</span>
        </div>

        <!-- 3. Pomodoro Bar (Hidden until summoned) -->
        <div id="pomodoro-container"></div>

        <!-- 4. Mode Configuration Ribbon -->
        <div class="config-ribbon" id="test-config-ribbon" style="display: ${lessonChapter ? 'none' : 'flex'};">
          <div class="config-group mode-selector-scroll">
            <button class="config-btn ${config.mode === 'words' ? 'active' : ''}" data-mode="words">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>Words</span>
            </button>
            <button class="config-btn ${config.mode === 'quote' ? 'active' : ''}" data-mode="quote">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 1 8 3 10z"></path><path d="M17 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 1 8 3 10z"></path></svg>
              <span>Quote</span>
            </button>
            <button class="config-btn ${config.mode === 'paragraph' ? 'active' : ''}" data-mode="paragraph">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="14" y2="18"></line></svg>
              <span>Paragraph</span>
            </button>
            <button class="config-btn ${config.mode === 'code' ? 'active' : ''}" data-mode="code">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              <span>Code</span>
            </button>
            <button class="config-btn ${config.mode === 'numbers' ? 'active' : ''}" data-mode="numbers">
              <span class="mode-symbol-txt">123</span>
              <span>Numbers</span>
            </button>
            <button class="config-btn ${config.mode === 'punctuation' ? 'active' : ''}" data-mode="punctuation">
              <span class="mode-symbol-txt">#?!</span>
              <span>Punctuation</span>
            </button>
            <button class="config-btn ${config.mode === 'mixed' ? 'active' : ''}" data-mode="mixed">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line></svg>
              <span>Mixed</span>
            </button>
            <button class="config-btn ${config.mode === 'custom' ? 'active' : ''}" data-mode="custom">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Custom</span>
            </button>
            <button class="config-btn ${config.mode === 'ai' ? 'active' : ''}" data-mode="ai">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>AI Adaptive</span>
            </button>
          </div>

          <div class="config-divider"></div>

          <!-- Language Selector -->
          <div class="config-group">
            <button class="config-btn ${config.lang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
            <button class="config-btn ${config.lang === 'kn' ? 'active' : ''}" data-lang="kn">ಕನ್ನಡ</button>
            <button class="config-btn ${config.lang === 'hi' ? 'active' : ''}" data-lang="hi">हिंदी</button>
          </div>

          <div class="config-divider"></div>

          <!-- Sub-options container -->
          <div class="config-group" id="sub-options-container">
            ${renderSubOptionsHTML()}
          </div>

          <div class="config-divider"></div>

          <!-- Toolbar Toggles with Vector Icons -->
          <div class="config-group">
            <button class="config-btn ${(!lessonChapter && settings.showKeyboard && !showHandsVisualizer) ? 'active' : ''}" id="btn-toggle-keyboard" title="Toggle Live Keyboard">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="6" y1="8" x2="6" y2="8"></line><line x1="10" y1="8" x2="10" y2="8"></line><line x1="14" y1="8" x2="14" y2="8"></line><line x1="18" y1="8" x2="18" y2="8"></line><line x1="6" y1="12" x2="6" y2="12"></line><line x1="10" y1="12" x2="10" y2="12"></line><line x1="14" y1="12" x2="14" y2="12"></line><line x1="18" y1="12" x2="18" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>
            </button>
            <button class="config-btn ${showHandsVisualizer ? 'active' : ''}" id="btn-toggle-hands-toolbar" title="Toggle Hands & Finger Visualizer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M6 14v-2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3"></path></svg>
            </button>
            <button class="config-btn ${settings.showChart ? 'active' : ''}" id="btn-toggle-chart" title="Toggle Real-Time Wave">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </button>
            <button class="config-btn" id="btn-toggle-pomo" title="Toggle Pomodoro Focus Bar (Ctrl+Shift+P)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"></circle><path d="M12 9V5"></path><path d="M10 2h4"></path></svg>
            </button>
            <button class="config-btn" id="btn-focus-mode" title="Toggle Full Screen / Focus Mode (Ctrl+Shift+F)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
            <button class="restart-btn" id="btn-restart" title="Restart (Tab)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              <span>Restart</span> <kbd>Tab</kbd>
            </button>
          </div>
        </div>

        <!-- Custom Text Input (when mode === 'custom') -->
        <div id="custom-text-box" style="display: ${config.mode === 'custom' ? 'block' : 'none'};">
          <textarea id="custom-textarea" maxlength="${MAX_CUSTOM_TYPING_CHARS}" class="card" style="width:100%;min-height:70px;padding:12px;font-family:var(--font-mono);font-size:14px;border-radius:var(--radius-md);background:var(--bg-surface);color:var(--text-primary);border:1px solid var(--border-subtle);outline:none;" placeholder="Paste or type your custom drill text here..."></textarea>
        </div>

        <!-- 5. Single Consolidated Live HUD (Always Visible) -->
        <div class="live-hud">
          <div class="hud-stats-group">
            <div class="hud-item">
              <span class="hud-label" id="hud-timer-label">Time</span>
              <span class="hud-value highlight" id="hud-timer">${config.duration}s</span>
            </div>
            <div class="hud-item">
              <span class="hud-label">WPM</span>
              <span class="hud-value" id="hud-wpm">0</span>
            </div>
            <div class="hud-item">
              <span class="hud-label">Accuracy</span>
              <span class="hud-value" id="hud-acc">100%</span>
            </div>
            <div class="hud-item">
              <span class="hud-label">Consistency</span>
              <span class="hud-value" id="hud-cons">100%</span>
            </div>
            <div class="hud-item hud-burst-item">
              <span class="hud-label">Burst</span>
              <span class="hud-value burst-val" id="hud-burst">0</span>
            </div>
          </div>

          <!-- Real-Time Velocity Sparkline Wave (Toggleable) -->
          <div class="live-sparkline-card" id="live-sparkline-box" style="display: ${settings.showChart ? 'flex' : 'none'};" title="Live velocity wave">
            <div class="live-sparkline-top">
              <div class="live-indicator">
                <span class="live-dot pulse"></span>
                <span class="live-text">LIVE VELOCITY</span>
              </div>
              <span class="live-peak-tag" id="live-peak-label">PEAK: 0 WPM</span>
            </div>
            <div class="live-sparkline-canvas-box">
              <canvas id="live-sparkline-canvas" width="240" height="38"></canvas>
            </div>
          </div>
        </div>

        <!-- 6. Main Interactive Typing Surface (Always Visible) -->
        <div class="typing-arena" id="typing-arena">
          <input type="text" id="typing-native-input" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" data-lpignore="true" />
          
          <div class="unfocused-indicator" id="unfocused-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="3"></rect><line x1="6.5" y1="9.5" x2="10.5" y2="9.5"></line><line x1="13.5" y1="9.5" x2="17.5" y2="9.5"></line><line x1="8.5" y1="14.5" x2="15.5" y2="14.5" stroke-width="2"></line></svg>
            <span>Click or press any key to focus</span>
          </div>

          <div class="typing-viewport" id="typing-viewport">
            <div class="typing-stream" id="typing-stream">
              <div class="typing-caret blink" id="typing-caret"></div>
            </div>
          </div>
        </div>

        <!-- Quote Author Banner (shown only in Quote mode) -->
        <div class="quote-author-tag" id="quote-author-banner" style="display: none;">
          <span class="author-dash">—</span> <span id="quote-author-name"></span>
        </div>

        <!-- 7. Focused Practice Keys (Shown in Lesson Mode instead of the crowded 60-key keyboard) -->
        <div id="lesson-station-container" style="display: ${lessonChapter ? 'block' : 'none'};">
          ${renderLessonPracticeStationHTML()}
        </div>

        <!-- 7b. Virtual Live Keyboard (Shown ONLY in regular non-lesson modes) -->
        <div class="kb-live-container" id="kb-live-container" style="display: ${!lessonChapter && settings.showKeyboard ? 'block' : 'none'};">
          <div class="kb-live-header">
            <span class="kb-live-title">Live QWERTY Layout</span>
            <div class="kb-finger-legend">
              <span class="fleg"><span class="fleg-dot" style="background:#f472b6"></span>L Pinky</span>
              <span class="fleg"><span class="fleg-dot" style="background:#a78bfa"></span>L Ring</span>
              <span class="fleg"><span class="fleg-dot" style="background:#60a5fa"></span>L Middle</span>
              <span class="fleg"><span class="fleg-dot" style="background:#34d399"></span>L Index</span>
              <span class="fleg"><span class="fleg-dot" style="background:#fbbf24"></span>R Index</span>
              <span class="fleg"><span class="fleg-dot" style="background:#f97316"></span>R Middle</span>
              <span class="fleg"><span class="fleg-dot" style="background:#fb7185"></span>R Ring</span>
              <span class="fleg"><span class="fleg-dot" style="background:#e879f9"></span>R Pinky</span>
            </div>
          </div>
          <div id="keyboard-mount"></div>
        </div>

        <!-- 7c. Interactive Hands & Finger Motion Visualizer -->
        <div id="hands-visualizer-mount" style="display: ${showHandsVisualizer ? 'block' : 'none'};margin-top: 10px;"></div>

        <!-- 8. Below-The-Fold Training Drawer (Muted/hidden during active typing) -->
        <div class="training-drawer" id="training-drawer">
          <!-- Session Telemetry Tile -->
          <div class="training-card">
            <h2 class="training-card-title">Live Session Telemetry</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
              <div><span style="color:var(--text-muted)">Raw Speed:</span> <strong id="telemetry-raw">0</strong> WPM</div>
              <div><span style="color:var(--text-muted)">Errors:</span> <strong id="telemetry-errors" style="color:var(--accent-rose)">0</strong></div>
              <div><span style="color:var(--text-muted)">Keystrokes:</span> <strong id="telemetry-keys">0</strong></div>
              <div><span style="color:var(--text-muted)">Backspaces:</span> <strong id="telemetry-backspaces">0</strong></div>
              <div><span style="color:var(--text-muted)">Reaction:</span> <strong id="telemetry-latency">0 ms</strong></div>
              <div><span style="color:var(--text-muted)">Words/min:</span> <strong id="telemetry-wpm-words">0</strong></div>
            </div>
          </div>

          <!-- Ghost Racer Tile -->
          <div class="training-card">
            <h2 class="training-card-title">Ghost Racer</h2>
            <div class="ghost-text" id="ghost-status-text">No ghost record loaded for this mode yet.</div>
            <div class="progress-track" style="margin-top:4px;">
              <div class="progress-fill" id="ghost-progress-fill" style="width:0%;"></div>
            </div>
          </div>

          <!-- Adaptive Focus Tile -->
          <div class="training-card">
            <h2 class="training-card-title">Adaptive Focus</h2>
            <div style="font-size:12px;color:var(--text-muted);" id="adaptive-card-text">
              Target micro-weaknesses from past runs.
            </div>
            <button class="config-btn active" id="btn-drill-weak-keys" style="margin-top:auto;justify-content:center;padding:8px 16px;display:flex;align-items:center;gap:6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              <span>Drill Weak Keys</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Instantiate auxiliary components
    const kbMount = container.querySelector('#keyboard-mount') as HTMLElement;
    if (kbMount) {
      liveKeyboard = new LiveKeyboard(kbMount);
    }

    const handsMount = container.querySelector('#hands-visualizer-mount') as HTMLElement;
    if (handsMount) {
      handsVisualizer = new HandsVisualizer(handsMount, {
        interactive: true,
        showCoachingStrip: true,
      });
      handsVisualizer.setOnFingerClick(() => {
        new BeginnerGuideModal().open();
      });
    }

    const pomoMount = container.querySelector('#pomodoro-container') as HTMLElement;
    if (pomoMount) {
      pomodoro = new PomodoroTimer(pomoMount, (active: boolean) => {
        container.querySelector('#btn-toggle-pomo')?.classList.toggle('active', active);
      });
    }

    countdown = new CountdownOverlay(container);
    shortcutsModal = new ShortcutsModal(container);

    bindEvents();
    startSession(true, false);
  }

  function renderSubOptionsHTML(): string {
    const parts: string[] = [];

    if (config.mode === 'words' || config.mode === 'numbers' || config.mode === 'punctuation' || config.mode === 'mixed') {
      const counts = config.mode === 'words' ? [10, 25, 50, 100, 250] : [15, 30, 50, 100];
      parts.push(counts.map(cnt => `
        <button class="config-btn ${config.wordCount === cnt ? 'active' : ''}" data-words="${cnt}">${cnt}</button>
      `).join(''));
    }

    if (config.lang === 'kn') {
      parts.push(`
        <button class="config-btn ${config.kannadaType === 'native' ? 'active' : ''}" data-kn-type="native">Native Script</button>
        <button class="config-btn ${config.kannadaType === 'kanglish' ? 'active' : ''}" data-kn-type="kanglish">Kanglish</button>
      `);
    } else if (config.lang === 'hi') {
      parts.push(`
        <button class="config-btn ${config.hindiType === 'native' ? 'active' : ''}" data-hi-type="native">Native Devanagari</button>
        <button class="config-btn ${config.hindiType === 'hinglish' ? 'active' : ''}" data-hi-type="hinglish">Hinglish</button>
      `);
    }

    return parts.join('<div class="config-divider"></div>');
  }

  function startSession(isNewWords: boolean = true, withCountdown: boolean = false): void {
    if (isDestroyed || !container.isConnected) return;
    if (withCountdown && countdown) {
      countdown.run(() => {
        if (!isDestroyed && container.isConnected) {
          executeSessionStart(isNewWords);
        }
      });
    } else {
      executeSessionStart(isNewWords);
    }
  }

  function executeSessionStart(isNewWords: boolean): void {
    if (isDestroyed || !container.isConnected) return;

    if (engine) {
      engine.destroy();
      engine = null;
    }

    const mainContainer = container.querySelector('#main-typing-container');
    if (mainContainer) {
      mainContainer.classList.remove('actively-typing', 'in-results');
    }

    // Restore typing viewport arena if results card is shown
    const arena = container.querySelector('#typing-arena') as HTMLElement | null;
    if (!arena) return;
    let stream = container.querySelector('#typing-stream') as HTMLElement | null;
    let input = container.querySelector('#typing-native-input') as HTMLInputElement | null;

    if (!stream || !input) {
      arena.innerHTML = `
        <input type="text" id="typing-native-input" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" data-lpignore="true" />
        <div class="unfocused-indicator" id="unfocused-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="3"></rect><line x1="6.5" y1="9.5" x2="10.5" y2="9.5"></line><line x1="13.5" y1="9.5" x2="17.5" y2="9.5"></line><line x1="8.5" y1="14.5" x2="15.5" y2="14.5" stroke-width="2"></line></svg>
          <span>Click or press any key to focus</span>
        </div>
        <div class="typing-viewport" id="typing-viewport">
          <div class="typing-stream" id="typing-stream">
            <div class="typing-caret blink" id="typing-caret"></div>
          </div>
        </div>
      `;
      stream = container.querySelector('#typing-stream') as HTMLElement | null;
      input = container.querySelector('#typing-native-input') as HTMLInputElement | null;
      bindArenaEvents();
    }

    // Obtain words for test
    let initialWords: string[] = [];

    if (isNewWords || !lastSessionWords || lastSessionWords.length === 0) {
      if (lessonChapter && lessonChapter.text) {
        quoteAuthor = null;
        initialWords = lessonChapter.text.trim().split(/\s+/).filter(w => w.length > 0);
        lastSessionWords = initialWords;
      } else {
        const generated = getTextForMode(config.mode, {
          lang: config.lang,
          wordCount: config.wordCount,
          customText: config.customText,
          weakKeys: getRecentWeakKeys(),
          kannadaType: config.kannadaType,
          hindiType: config.hindiType,
        });

        quoteAuthor = generated.author || null;
        initialWords = generated.text.trim().split(/\s+/).filter(w => w.length > 0);
        lastSessionWords = initialWords;
      }
    } else {
      initialWords = lastSessionWords;
    }

    if (initialWords.length === 0) {
      initialWords = ['type', 'steady', 'practice', 'rhythm'];
      lastSessionWords = initialWords;
    }

    engine = new TypingEngine({
      mode: config.mode,
      lang: config.lang,
      duration: config.duration,
      wordTarget: config.mode === 'words' ? config.wordCount : initialWords.length,
      initialWords,
      onTick: handleTick,
      onComplete: handleComplete,
      onRequestMoreWords: () => getRandomWordsArray(
        40,
        config.lang,
        config.lang === 'kn' ? config.kannadaType : config.hindiType
      ),
    });

    // Query Ghost race baseline
    bestGhostSession = getBestSessionForMode(config.mode, config.lang);
    const ghostText = container.querySelector('#ghost-status-text');
    if (ghostText) {
      ghostText.textContent = bestGhostSession
        ? `Ghost loaded: ${bestGhostSession.wpm} WPM (Best ${config.mode})`
        : 'No ghost record loaded for this mode yet.';
    }

    // Quote Author Banner
    const quoteBanner = container.querySelector('#quote-author-banner') as HTMLElement;
    const quoteAuthorName = container.querySelector('#quote-author-name');
    if (quoteBanner && quoteAuthorName) {
      if (config.mode === 'quote' && quoteAuthor) {
        quoteAuthorName.textContent = quoteAuthor;
        quoteBanner.style.display = 'flex';
      } else {
        quoteBanner.style.display = 'none';
      }
    }

    // Populate stream DOM
    renderWordsToDOM();

    // Reset HUD
    const hudTimerLabel = container.querySelector('#hud-timer-label');
    const hudTimer = container.querySelector('#hud-timer');
    const hudWpm = container.querySelector('#hud-wpm');
    const hudAcc = container.querySelector('#hud-acc');
    const hudCons = container.querySelector('#hud-cons');
    const hudBurst = container.querySelector('#hud-burst');
    const liveCanvas = container.querySelector('#live-sparkline-canvas') as HTMLCanvasElement;

    if (hudTimerLabel) hudTimerLabel.textContent = config.mode === 'time' ? 'Time' : 'Remaining';
    if (hudTimer) hudTimer.textContent = config.mode === 'time' ? `${config.duration}s` : `${engine.words.length} left`;
    if (hudWpm) hudWpm.textContent = '0';
    if (hudAcc) hudAcc.textContent = '100%';
    if (hudCons) hudCons.textContent = '100%';
    if (hudBurst) hudBurst.textContent = '0';
    if (liveCanvas) renderLiveSparkline(liveCanvas, []);

    positionCaret();

    // Target key for keyboard
    updateTargetKeyHighlight();

    scheduleSafeTimeout(() => {
      if (input) input.focus();
    }, 20);
  }

  function renderWordsToDOM(): void {
    const stream = container.querySelector('#typing-stream') as HTMLElement;
    if (!stream || !engine) return;

    const wordsHTML = engine.words.map((w, wIdx) => {
      const charsHTML = w.targetGraphemes.map((g, gIdx) =>
        `<span class="char pending" data-grapheme-idx="${gIdx}">${escapeHTML(g)}</span>`
      ).join('');
      return `<div class="word${wIdx === 0 ? ' active' : ''}" data-word-idx="${wIdx}">${charsHTML}</div>`;
    }).join('');

    stream.innerHTML = `<div class="typing-caret blink" id="typing-caret"></div>${wordsHTML}`;
    stream.style.transform = 'translate3d(0, 0, 0)';
  }

  function bindEvents(): void {
    // Mode Buttons
    container.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (lessonChapter) {
          setActiveLessonChapter(null);
          lessonChapter = null;
          lastSessionWords = null;
          const banner = container.querySelector('#lesson-banner') as HTMLElement;
          if (banner) banner.style.display = 'none';
          const station = container.querySelector('#lesson-station-container') as HTMLElement;
          if (station) station.style.display = 'none';
          const kbBox = container.querySelector('#kb-live-container') as HTMLElement;
          if (kbBox) kbBox.style.display = settings.showKeyboard ? 'block' : 'none';
          const ribbon = container.querySelector('#test-config-ribbon') as HTMLElement;
          if (ribbon) ribbon.style.display = 'flex';
        }
        config.mode = (btn as HTMLElement).dataset.mode as TypingMode;
        container.querySelectorAll('[data-mode]').forEach(b => {
          b.classList.toggle('active', (b as HTMLElement).dataset.mode === config.mode);
        });

        const customBox = container.querySelector('#custom-text-box') as HTMLElement;
        if (customBox) {
          customBox.style.display = config.mode === 'custom' ? 'block' : 'none';
        }

        const subContainer = container.querySelector('#sub-options-container');
        if (subContainer) {
          subContainer.innerHTML = renderSubOptionsHTML();
          bindSubOptionEvents();
        }
        startSession(true, false);
      });
    });

    // Language Buttons
    container.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        config.lang = (btn as HTMLElement).dataset.lang as LanguageCode;
        container.querySelectorAll('[data-lang]').forEach(b => {
          b.classList.toggle('active', (b as HTMLElement).dataset.lang === config.lang);
        });
        const subContainer = container.querySelector('#sub-options-container');
        if (subContainer) {
          subContainer.innerHTML = renderSubOptionsHTML();
          bindSubOptionEvents();
        }
        startSession(true, false);
      });
    });

    // Sub Options
    bindSubOptionEvents();

    // Toolbar Buttons
    const restartBtn = container.querySelector('#btn-restart');
    restartBtn?.addEventListener('click', () => {
      triggerButtonPress(restartBtn as HTMLElement);
      startSession(true, false);
    });

    const kbToggle = container.querySelector('#btn-toggle-keyboard') as HTMLElement;
    kbToggle?.addEventListener('click', () => {
      const current = settings.showKeyboard;
      settings.showKeyboard = !current;
      updateSetting('showKeyboard', settings.showKeyboard);
      kbToggle.classList.toggle('active', settings.showKeyboard);
      const kbBox = container.querySelector('#kb-live-container') as HTMLElement;
      if (kbBox) kbBox.style.display = settings.showKeyboard ? 'block' : 'none';

      // Mutual exclusion: if turning Keyboard ON, turn Hands Visualizer OFF
      if (settings.showKeyboard && showHandsVisualizer) {
        showHandsVisualizer = false;
        const handsBox = container.querySelector('#hands-visualizer-mount') as HTMLElement;
        if (handsBox) handsBox.style.display = 'none';
        container.querySelector('#btn-toggle-hands')?.classList.remove('active');
        container.querySelector('#btn-toggle-hands-toolbar')?.classList.remove('active');
      }
    });

    const chartToggle = container.querySelector('#btn-toggle-chart') as HTMLElement;
    chartToggle?.addEventListener('click', () => {
      const current = settings.showChart;
      settings.showChart = !current;
      updateSetting('showChart', settings.showChart);
      chartToggle.classList.toggle('active', settings.showChart);
      const chartBox = container.querySelector('#live-sparkline-box') as HTMLElement;
      if (chartBox) chartBox.style.display = settings.showChart ? 'flex' : 'none';
    });

    const pomoToggle = container.querySelector('#btn-toggle-pomo') as HTMLElement;
    pomoToggle?.addEventListener('click', () => {
      if (pomodoro) {
        const isVisible = pomodoro.toggleVisibility();
        pomoToggle.classList.toggle('active', isVisible);
      }
    });

    const focusBtn = container.querySelector('#btn-focus-mode') as HTMLElement;
    focusBtn?.addEventListener('click', () => toggleFocusMode());

    // Hands Visualizer Toggle (from toolbar and lesson banner)
    const toggleHandsVisualizer = () => {
      showHandsVisualizer = !showHandsVisualizer;
      const handsBox = container.querySelector('#hands-visualizer-mount') as HTMLElement;
      if (handsBox) handsBox.style.display = showHandsVisualizer ? 'block' : 'none';
      container.querySelector('#btn-toggle-hands')?.classList.toggle('active', showHandsVisualizer);
      container.querySelector('#btn-toggle-hands-toolbar')?.classList.toggle('active', showHandsVisualizer);

      // Mutual exclusion: if turning Hands Visualizer ON, turn Keyboard OFF
      if (showHandsVisualizer && settings.showKeyboard) {
        settings.showKeyboard = false;
        updateSetting('showKeyboard', false);
        kbToggle?.classList.remove('active');
        const kbBox = container.querySelector('#kb-live-container') as HTMLElement;
        if (kbBox) kbBox.style.display = 'none';
      }

      if (showHandsVisualizer) {
        updateTargetKeyHighlight();
      }
    };

    container.querySelector('#btn-toggle-hands')?.addEventListener('click', toggleHandsVisualizer);
    container.querySelector('#btn-toggle-hands-toolbar')?.addEventListener('click', toggleHandsVisualizer);

    // Beginner Guide Modal Button
    container.querySelector('#btn-lesson-beginner-guide')?.addEventListener('click', () => {
      new BeginnerGuideModal().open();
    });

    // Lesson Banner Actions
    const lessonRestart = container.querySelector('#btn-lesson-restart');
    lessonRestart?.addEventListener('click', () => startSession(true, false));
    const lessonExit = container.querySelector('#btn-lesson-exit');
    lessonExit?.addEventListener('click', () => {
      setActiveLessonChapter(null);
      lessonChapter = null;
      lastSessionWords = null;
      showHandsVisualizer = false;
      const banner = container.querySelector('#lesson-banner') as HTMLElement;
      if (banner) banner.style.display = 'none';
      const ribbon = container.querySelector('#test-config-ribbon') as HTMLElement;
      if (ribbon) ribbon.style.display = 'flex';
      const station = container.querySelector('#lesson-station-container') as HTMLElement;
      if (station) station.style.display = 'none';
      const kbBox = container.querySelector('#kb-live-container') as HTMLElement;
      if (kbBox) kbBox.style.display = settings.showKeyboard ? 'block' : 'none';
      const handsBox = container.querySelector('#hands-visualizer-mount') as HTMLElement;
      if (handsBox) handsBox.style.display = 'none';
      container.querySelector('#btn-toggle-hands')?.classList.remove('active');
      container.querySelector('#btn-toggle-hands-toolbar')?.classList.remove('active');
      startSession(true, false);
    });

    // Drill Weak Keys Button
    const drillBtn = container.querySelector('#btn-drill-weak-keys');
    drillBtn?.addEventListener('click', () => {
      config.mode = 'ai';
      container.querySelectorAll('[data-mode]').forEach(b => {
        b.classList.toggle('active', (b as HTMLElement).dataset.mode === 'ai');
      });
      startSession(true, true);
    });

    // Custom Textarea input
    const customArea = container.querySelector('#custom-textarea') as HTMLTextAreaElement;
    customArea?.addEventListener('input', () => {
      if (customArea.value.length > MAX_CUSTOM_TYPING_CHARS) {
        customArea.value = customArea.value.slice(0, MAX_CUSTOM_TYPING_CHARS);
      }
      config.customText = customArea.value;
      startSession(true, false);
    });

    bindArenaEvents();
    bindGlobalKeydown();
  }

  function bindSubOptionEvents(): void {
    container.querySelectorAll('[data-duration]').forEach(btn => {
      btn.addEventListener('click', () => {
        config.duration = parseInt((btn as HTMLElement).dataset.duration || '30', 10);
        container.querySelectorAll('[data-duration]').forEach(b => {
          b.classList.toggle('active', parseInt((b as HTMLElement).dataset.duration || '0', 10) === config.duration);
        });
        startSession(true, false);
      });
    });

    container.querySelectorAll('[data-words]').forEach(btn => {
      btn.addEventListener('click', () => {
        config.wordCount = parseInt((btn as HTMLElement).dataset.words || '25', 10);
        container.querySelectorAll('[data-words]').forEach(b => {
          b.classList.toggle('active', parseInt((b as HTMLElement).dataset.words || '0', 10) === config.wordCount);
        });
        startSession(true, false);
      });
    });

    container.querySelectorAll('[data-kn-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const knType = (btn as HTMLElement).dataset.knType;
        config.kannadaType = knType === 'kanglish' ? 'kanglish' : 'native';
        container.querySelectorAll('[data-kn-type]').forEach(b => {
          b.classList.toggle('active', (b as HTMLElement).dataset.knType === config.kannadaType);
        });
        startSession(true, false);
      });
    });

    container.querySelectorAll('[data-hi-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const hiType = (btn as HTMLElement).dataset.hiType;
        config.hindiType = hiType === 'hinglish' ? 'hinglish' : 'native';
        container.querySelectorAll('[data-hi-type]').forEach(b => {
          b.classList.toggle('active', (b as HTMLElement).dataset.hiType === config.hindiType);
        });
        startSession(true, false);
      });
    });
  }

  function bindArenaEvents(): void {
    const arena = container.querySelector('#typing-arena') as HTMLElement;
    const input = container.querySelector('#typing-native-input') as HTMLInputElement;
    const unfocusedBanner = container.querySelector('#unfocused-banner') as HTMLElement;

    if (unfocusedBanner && input) {
      unfocusedBanner.onclick = (e) => {
        e.stopPropagation();
        unfocusedBanner.classList.remove('visible');
        input.focus();
      };
    }

    if (arena && input) {
      arena.onclick = () => {
        if (unfocusedBanner) unfocusedBanner.classList.remove('visible');
        input.focus();
      };
      input.onblur = () => {
        const inResults = container.querySelector('.typing-container')?.classList.contains('in-results');
        if (!inResults && unfocusedBanner) {
          unfocusedBanner.classList.add('visible');
        }
      };
      input.onfocus = () => {
        if (unfocusedBanner) unfocusedBanner.classList.remove('visible');
      };
      input.addEventListener('paste', (e) => e.preventDefault());
      input.addEventListener('drop', (e) => e.preventDefault());
      let lastTypedCode = '';
      let lastTypedKey = '';

      input.onkeydown = (e) => {
        lastTypedCode = e.code || '';
        lastTypedKey = e.key || '';

        // Caps Lock detection
        if (e.getModifierState) {
          const capsOn = e.getModifierState('CapsLock');
          const capsBanner = container.querySelector('#caps-warn-banner');
          capsBanner?.classList.toggle('visible', capsOn);
        }

        // Escape handling: end active typing session and calculate whatever was done
        if (e.key === 'Escape') {
          e.preventDefault();
          if (engine && engine.hasStarted && !engine.isFinished) {
            if (focusModeActive) toggleFocusMode(false);
            engine.finish();
            return;
          }
          if (focusModeActive) {
            toggleFocusMode(false);
            return;
          }
          startSession(true, false);
          return;
        }

        // Backspace handling
        if (e.key === 'Backspace') {
          if (liveKeyboard) {
            liveKeyboard.flashKey('Backspace', false);
          }
          if (input.value === '' && engine && engine.currentWordIndex > 0) {
            e.preventDefault();
            engine.handleBackspace();
            input.value = engine.currentTyped;
            updateWordDisplay(engine.currentWordIndex);
            positionCaret();
            scrollStreamIfNeeded();
            updateTargetKeyHighlight();
            playTactileClick('key');
            updateImmediateHUD();
          }
        }
      };

      input.oninput = (e: Event) => {
        if (!engine || engine.isFinished) return;
        const currentVal = (e.target as HTMLInputElement).value;
        const mainContainer = container.querySelector('#main-typing-container');
        mainContainer?.classList.add('actively-typing');

        const prevWordIdx = engine.currentWordIndex;
        const result = engine.handleInput(currentVal);

        // Instant audio & keyboard feedback on keystroke
        if (liveKeyboard && (lastTypedCode || lastTypedKey)) {
          liveKeyboard.flashKey(lastTypedCode || lastTypedKey, !result.isMatch);
        }
        const stationRow = container.querySelector('#lesson-station-keys-row');
        if (stationRow && (lastTypedKey || lastTypedCode)) {
          const typedLookup = (lastTypedKey || '').toLowerCase();
          const hitCard = findStationKeyCard(stationRow, typedLookup);
          if (hitCard) {
            const flashClass = result.isMatch ? 'just-hit' : 'just-error';
            hitCard.classList.add(flashClass);
            scheduleSafeTimeout(() => hitCard.classList.remove(flashClass), 180);
          }
        }
        playTactileClick(result.isMatch ? 'key' : 'error');

        if (engine.currentWordIndex !== prevWordIdx) {
          // Word was committed
          (e.target as HTMLInputElement).value = '';
          updateWordDisplay(prevWordIdx);
          updateWordDisplay(engine.currentWordIndex);
          scrollStreamIfNeeded();
        } else {
          // In-word typing
          updateWordDisplay(engine.currentWordIndex);
        }

        positionCaret();
        updateTargetKeyHighlight();
        updateImmediateHUD();
      };
    }
  }

  function bindGlobalKeydown(): void {
    if (activeKeydownListener) {
      window.removeEventListener('keydown', activeKeydownListener);
    }

    activeKeydownListener = (e: KeyboardEvent) => {
      if (!container.querySelector('#typing-arena')) return;

      // Guard: Ignore all shortcut triggers if any popup modal or backdrop is currently open
      if (document.querySelector('.settings-modal-backdrop, .profile-modal-backdrop, .beginner-guide-backdrop, .modal-backdrop')) {
        return;
      }

      const inResults = container.querySelector('#main-typing-container')?.classList.contains('in-results');

      if (inResults) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const primaryBtn = container.querySelector('.results-actions-stack .btn-primary') as HTMLElement;
          if (primaryBtn) primaryBtn.click();
          else startSession(false, false);
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          const tabBtn = container.querySelector('.results-actions-stack .results-actions-subrow button:first-child') as HTMLElement;
          if (tabBtn) tabBtn.click();
          else {
            const nextBtn = container.querySelector('#btn-results-next') as HTMLElement;
            if (nextBtn) nextBtn.click();
            else startSession(true, false);
          }
          return;
        }
      }

      const isModifierCombo = e.ctrlKey && e.shiftKey;

      if (e.key === 'Tab') {
        e.preventDefault();
        startSession(true, false);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (shortcutsModal?.getIsOpen()) {
          shortcutsModal.close();
          return;
        }

        // If currently typing, end session immediately and calculate results
        if (engine && engine.hasStarted && !engine.isFinished) {
          if (focusModeActive) toggleFocusMode(false);
          engine.finish();
          return;
        }

        if (focusModeActive) {
          toggleFocusMode(false);
          return;
        }
        startSession(true, false);
        return;
      }

      if (isModifierCombo) {
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFocusMode();
          return;
        }
        if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          toggleWordErrorMode();
          return;
        }
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          if (pomodoro) {
            const isVisible = pomodoro.toggleVisibility();
            container.querySelector('#btn-toggle-pomo')?.classList.toggle('active', isVisible);
          }
          return;
        }
        if (e.key === '?' || e.key === '/') {
          e.preventDefault();
          if (shortcutsModal) shortcutsModal.toggle();
          return;
        }
      }
    };

    window.addEventListener('keydown', activeKeydownListener);
  }

  function toggleFocusMode(force?: boolean): void {
    focusModeActive = force !== undefined ? force : !focusModeActive;
    document.body.classList.toggle('focus-mode', focusModeActive);
    const focusBtn = container.querySelector('#btn-focus-mode');
    if (focusBtn) {
      focusBtn.classList.toggle('active', focusModeActive);
      focusBtn.setAttribute('title', focusModeActive ? 'Exit Full Screen Mode (Ctrl+Shift+F or Esc)' : 'Toggle Full Screen / Focus Mode (Ctrl+Shift+F)');
      focusBtn.innerHTML = focusModeActive
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
    }

    let exitBtn = document.getElementById('btn-exit-fullscreen');
    if (focusModeActive) {
      if (!exitBtn) {
        exitBtn = document.createElement('button');
        exitBtn.id = 'btn-exit-fullscreen';
        exitBtn.className = 'btn-floating-exit-fullscreen';
        exitBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <span>Exit Full Screen</span>
          <kbd>Esc</kbd>
        `;
        exitBtn.title = 'Exit Full Screen Mode (Esc)';
        exitBtn.addEventListener('click', () => toggleFocusMode(false));
        document.body.appendChild(exitBtn);
      }
      exitBtn.style.display = 'inline-flex';
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (exitBtn) exitBtn.style.display = 'none';
      if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
        document.exitFullscreen().catch(() => {});
      }
    }

    const input = container.querySelector('#typing-native-input') as HTMLInputElement;
    input?.focus();
  }

  const onFullscreenChange = (): void => {
    if (!document.fullscreenElement && focusModeActive) {
      focusModeActive = false;
      document.body.classList.remove('focus-mode');
      const focusBtn = container.querySelector('#btn-focus-mode');
      if (focusBtn) {
        focusBtn.classList.remove('active');
        focusBtn.setAttribute('title', 'Toggle Full Screen / Focus Mode (Ctrl+Shift+F)');
        focusBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
      }
      const exitBtn = document.getElementById('btn-exit-fullscreen');
      if (exitBtn) exitBtn.style.display = 'none';
    }
  };
  document.addEventListener('fullscreenchange', onFullscreenChange);

  function toggleWordErrorMode(): void {
    settings.wordErrorMode = !settings.wordErrorMode;
    updateSetting('wordErrorMode', settings.wordErrorMode);
    const stream = container.querySelector('#typing-stream');
    stream?.classList.toggle('word-mode', settings.wordErrorMode);
  }

  function updateWordDisplay(wIdx: number): void {
    if (!engine) return;
    const wordState = engine.words[wIdx];
    if (!wordState) return;

    const wordEl = container.querySelector(`.word[data-word-idx="${wIdx}"]`);
    if (!wordEl) return;

    wordEl.classList.toggle('active', wIdx === engine.currentWordIndex);

    const charEls = Array.from(wordEl.querySelectorAll('.char:not(.extra)'));
    wordEl.querySelectorAll('.char.extra').forEach(el => el.remove());

    const targetGraphemes = wordState.targetGraphemes;
    const typedGraphemes = wordState.isCommitted
      ? wordState.typed.split('')
      : engine.currentTyped.split('');

    let wordHasError = false;

    for (let i = 0; i < targetGraphemes.length; i++) {
      const charEl = charEls[i];
      if (!charEl) continue;

      if (i < typedGraphemes.length) {
        const isMatch = typedGraphemes[i] === targetGraphemes[i];
        if (!isMatch) wordHasError = true;
        charEl.className = `char ${isMatch ? 'correct' : 'incorrect'}`;
      } else {
        if (wordState.isCommitted) {
          // Word was committed with missing characters
          wordHasError = true;
          charEl.className = 'char missing incorrect';
        } else {
          charEl.className = 'char pending';
        }
      }
    }

    // Handle overflow characters
    if (typedGraphemes.length > targetGraphemes.length) {
      wordHasError = true;
      const extraGraphemes = typedGraphemes.slice(targetGraphemes.length);
      for (const char of extraGraphemes) {
        const extraSpan = document.createElement('span');
        extraSpan.className = 'char extra incorrect';
        extraSpan.textContent = char;
        wordEl.appendChild(extraSpan);
      }
    }

    wordEl.classList.toggle('has-error', wordHasError);
  }

  function updateImmediateHUD(): void {
    if (!engine) return;
    const hudAcc = container.querySelector('#hud-acc');
    const errVal = container.querySelector('#telemetry-errors');
    const keyVal = container.querySelector('#telemetry-keys');
    const backVal = container.querySelector('#telemetry-backspaces');

    const total = engine.totalKeystrokes;
    const correct = engine.correctKeystrokes;
    const acc = total > 0 ? Math.round((correct / total) * 1000) / 10 : 100;

    if (hudAcc) hudAcc.textContent = `${acc}%`;
    if (errVal) errVal.textContent = String(engine.incorrectKeystrokes);
    if (keyVal) keyVal.textContent = String(engine.totalKeystrokes);
    if (backVal) backVal.textContent = String(engine.backspaces);
  }

  function updateTargetKeyHighlight(): void {
    if (!engine) return;
    const isIndic = config.lang === 'hi' || config.lang === 'kn';
    const activeWord = engine.words[engine.currentWordIndex];
    const stationRow = container.querySelector('#lesson-station-keys-row');

    if (!activeWord) {
      if (liveKeyboard) liveKeyboard.highlightTargetKey(null, isIndic);
      if (handsVisualizer) handsVisualizer.clearActive();
      if (stationRow) {
        stationRow.querySelectorAll('.lesson-key-card').forEach(c => c.classList.remove('active-target'));
      }
      return;
    }
    const currentTypedLen = engine.currentTyped.length;
    const nextExpected = activeWord.target[currentTypedLen] || ' ';
    if (liveKeyboard) liveKeyboard.highlightTargetKey(nextExpected, isIndic);
    if (handsVisualizer) handsVisualizer.update(nextExpected);

    // Highlight target practice keycard in focused lesson station
    if (stationRow) {
      stationRow.querySelectorAll('.lesson-key-card').forEach(c => c.classList.remove('active-target'));
      if (nextExpected) {
        const lookup = nextExpected === ' ' ? 'space' : nextExpected.toLowerCase();
        const activeCard = findStationKeyCard(stationRow, lookup);
        if (activeCard) {
          activeCard.classList.add('active-target');
        }
      }
    }
  }

  function positionCaret(): void {
    if (isDestroyed || !engine || !container.isConnected) return;
    const caret = container.querySelector('#typing-caret') as HTMLElement;
    const stream = container.querySelector('#typing-stream') as HTMLElement;
    const wordEl = container.querySelector(`.word[data-word-idx="${engine.currentWordIndex}"]`) as HTMLElement;
    if (!caret || !stream || !wordEl) return;

    const streamRect = stream.getBoundingClientRect();
    const typedLen = engine.currentTyped.length;
    const charEls = Array.from(wordEl.querySelectorAll('.char')) as HTMLElement[];

    let targetX = 0;
    let targetY = 0;
    let caretHeight = 36;

    if (typedLen === 0) {
      if (charEls.length > 0) {
        const r = charEls[0].getBoundingClientRect();
        targetX = r.left - streamRect.left;
        targetY = r.top - streamRect.top;
        caretHeight = r.height;
      } else {
        const r = wordEl.getBoundingClientRect();
        targetX = r.left - streamRect.left;
        targetY = r.top - streamRect.top;
        caretHeight = r.height;
      }
    } else if (typedLen <= charEls.length) {
      const targetChar = charEls[typedLen - 1];
      const r = targetChar.getBoundingClientRect();
      targetX = r.right - streamRect.left;
      targetY = r.top - streamRect.top;
      caretHeight = r.height;
    } else if (charEls.length > 0) {
      const lastChar = charEls[charEls.length - 1];
      const r = lastChar.getBoundingClientRect();
      targetX = r.right - streamRect.left;
      targetY = r.top - streamRect.top;
      caretHeight = r.height;
    } else {
      const r = wordEl.getBoundingClientRect();
      targetX = r.right - streamRect.left;
      targetY = r.top - streamRect.top;
      caretHeight = r.height;
    }

    if (!Number.isFinite(targetX) || !Number.isFinite(targetY) || !Number.isFinite(caretHeight)) {
      return;
    }

    caret.style.height = `${Math.round(caretHeight || 36)}px`;
    caret.style.transform = `translate3d(${Math.round(targetX)}px, ${Math.round(targetY)}px, 0)`;

    caret.classList.remove('blink');
    if (caretBlinkTimeout !== null) {
      clearTimeout(caretBlinkTimeout);
      caretBlinkTimeout = null;
    }
    caretBlinkTimeout = setTimeout(() => {
      if (!isDestroyed && caret.isConnected) {
        caret.classList.add('blink');
      }
    }, 500);
  }

  function scrollStreamIfNeeded(): void {
    if (isDestroyed || !engine || !container.isConnected) return;
    const stream = container.querySelector('#typing-stream') as HTMLElement;
    const wordEl = container.querySelector(`.word[data-word-idx="${engine.currentWordIndex}"]`) as HTMLElement;
    if (!stream || !wordEl) return;

    const firstWord = stream.querySelector('.word') as HTMLElement;
    if (!firstWord) return;

    const lineDiff = wordEl.offsetTop - firstWord.offsetTop;
    const targetTranslateY = lineDiff > 40 ? -(lineDiff - 40) : 0;
    stream.style.transform = `translate3d(0, ${targetTranslateY}px, 0)`;

    if (caretRafId !== null) {
      cancelAnimationFrame(caretRafId);
    }
    caretRafId = requestAnimationFrame(() => {
      caretRafId = null;
      positionCaret();
    });
  }

  function handleTick(metrics: LiveMetrics): void {
    const hudWpm = container.querySelector('#hud-wpm');
    const hudAcc = container.querySelector('#hud-acc');
    const hudCons = container.querySelector('#hud-cons');
    const hudTimer = container.querySelector('#hud-timer');
    const hudBurst = container.querySelector('#hud-burst');
    const livePeak = container.querySelector('#live-peak-label');
    const liveCanvas = container.querySelector('#live-sparkline-canvas') as HTMLCanvasElement;

    if (hudWpm) hudWpm.textContent = String(metrics.wpm);
    if (hudAcc) hudAcc.textContent = `${metrics.accuracy}%`;
    if (hudCons) hudCons.textContent = `${metrics.consistency}%`;
    if (hudBurst) hudBurst.textContent = String(metrics.burstWpm);
    if (livePeak) livePeak.textContent = `PEAK: ${metrics.peakBurstWpm} WPM`;

    if (config.mode === 'time' && hudTimer) {
      hudTimer.textContent = `${metrics.remainingSeconds}s`;
    } else if (hudTimer && engine) {
      const remainingWords = Math.max(0, engine.words.length - engine.currentWordIndex);
      hudTimer.textContent = `${remainingWords} left`;
    }

    // Telemetry Tile
    const rawVal = container.querySelector('#telemetry-raw');
    const errVal = container.querySelector('#telemetry-errors');
    const keyVal = container.querySelector('#telemetry-keys');
    const backVal = container.querySelector('#telemetry-backspaces');
    const latVal = container.querySelector('#telemetry-latency');
    const wordsVal = container.querySelector('#telemetry-wpm-words');

    if (rawVal) rawVal.textContent = String(metrics.rawWpm);
    if (errVal) errVal.textContent = String(metrics.incorrectChars);
    if (keyVal) keyVal.textContent = String(metrics.totalKeystrokes);
    if (backVal) backVal.textContent = String(metrics.backspaces);
    if (latVal && engine) latVal.textContent = `${engine.firstKeyLatency} ms`;
    if (wordsVal) wordsVal.textContent = String(metrics.wordsPerMinute);

    // Ghost Progress
    if (bestGhostSession && engine) {
      const ghostProgressFill = container.querySelector('#ghost-progress-fill') as HTMLElement;
      const ghostStatusText = container.querySelector('#ghost-status-text');
      const totalWords = engine.words.length;
      const userProgress = (engine.currentWordIndex / Math.max(1, totalWords)) * 100;
      const ghostWpm = bestGhostSession.wpm;
      const elapsedMinutes = metrics.elapsedSeconds / 60;
      const ghostWordEquivalent = ghostWpm * elapsedMinutes;
      const ghostProgress = Math.min(100, (ghostWordEquivalent / Math.max(1, totalWords)) * 100);

      if (ghostProgressFill) ghostProgressFill.style.width = `${Math.round(ghostProgress)}%`;
      if (ghostStatusText) {
        const diff = Math.round(userProgress - ghostProgress);
        ghostStatusText.textContent = diff >= 0
          ? `Ahead of your ghost by +${diff}%`
          : `Behind your ghost by ${diff}%`;
      }
    }

    if (liveCanvas && settings.showChart) {
      renderLiveSparkline(liveCanvas, metrics.liveSamples || [], {
        currentWpm: metrics.wpm,
        burstWpm: metrics.burstWpm,
        peakBurstWpm: metrics.peakBurstWpm,
      });
    }
  }

  function handleComplete(session: SessionResult): void {
    if (isDestroyed || !container.isConnected) return;

    // 1. Clear target key highlight
    if (liveKeyboard) {
      liveKeyboard.highlightTargetKey(null);
    }
    if (handsVisualizer) {
      handsVisualizer.clearActive();
    }

    // 2. Persist session
    saveTestSession(session);

    // 3. Process gamification: XP, streak, badges, daily challenge
    const reward = processSessionCompletion(session);

    // 4. Trigger celebration toasts
    if (reward.leveledUp) {
      scheduleSafeTimeout(() => {
        showLevelUpCelebration(reward.newLevel, getRankTitle(reward.newLevel));
      }, 500);
    }

    reward.newlyUnlockedBadges.forEach((badge, idx) => {
      scheduleSafeTimeout(() => {
        showBadgeCelebration(badge);
      }, 900 + idx * 800);
    });

    // 5. Update header profile pill
    window.dispatchEvent(new CustomEvent('santypes:account-updated'));

    // 6. Lesson Mode completion check
    if (lessonChapter) {
      completeLessonChapter(lessonChapter.id, session.wpm, session.accuracy);
    }

    renderResultsCard(session, reward);
  }

  function renderResultsCard(results: SessionResult, reward?: SessionCompletionReward): void {
    if (isDestroyed || !container.isConnected) return;
    const mainContainer = container.querySelector('#main-typing-container');
    mainContainer?.classList.remove('actively-typing');
    mainContainer?.classList.add('in-results');

    const arena = container.querySelector('#typing-arena');
    if (!arena) return;

    const currentLesson = lessonChapter;
    const isLesson = currentLesson !== null;
    const nextChapterDef = currentLesson ? getNextChapterAfter(currentLesson.id) : null;
    const passedLesson = currentLesson !== null && results.wpm >= (currentLesson.wpmTarget || 0) && results.accuracy >= (currentLesson.accTarget || 90);
    const modeLabel = escapeHTML(String(results.mode || 'words').toUpperCase());

    arena.innerHTML = `
      <div class="results-card">
        <div class="results-top-bar">
          <div class="results-title-group">
            <span class="results-badge">${isLesson ? (passedLesson ? 'CHAPTER COMPLETED' : 'KEEP PRACTICING') : 'SESSION COMPLETE'}</span>
            <span class="results-mode-tag">
              ${isLesson && currentLesson ? escapeHTML(currentLesson.title) : modeLabel + ' · ' + (results.mode === 'time' ? finiteNumber(results.duration, 30, 0, 86400) + 's' : finiteNumber(results.wordTarget, 25, 0, 10000) + ' Words')}
            </span>
          </div>

          <div class="chart-legend compact">
            <span class="legend-item"><span class="legend-dot cyan"></span> Net WPM</span>
            <span class="legend-item"><span class="legend-dot amber"></span> Raw</span>
            <span class="legend-item"><span class="legend-dot rose"></span> Errors</span>
          </div>
        </div>

        <div class="results-split-body">
          <div class="results-sidebar">
            <div class="hero-duo">
              <div class="hero-metric primary">
                <span class="hero-metric-label">WPM</span>
                <span class="hero-metric-val">${results.wpm}</span>
              </div>
              <div class="hero-metric">
                <span class="hero-metric-label">ACC</span>
                <span class="hero-metric-val acc-color">${results.accuracy}%</span>
              </div>
            </div>

            <div class="mini-telemetry-grid">
              <div class="mini-stat">
                <span class="mini-label">Raw WPM</span>
                <span class="mini-val">${results.rawWpm}</span>
              </div>
              <div class="mini-stat">
                <span class="mini-label">Consistency</span>
                <span class="mini-val">${results.consistency}%</span>
              </div>
              <div class="mini-stat">
                <span class="mini-label">Words / Min</span>
                <span class="mini-val">${results.wordsPerMinute}</span>
              </div>
              <div class="mini-stat">
                <span class="mini-label">Reaction</span>
                <span class="mini-val">${results.firstKeyLatency}ms</span>
              </div>
            </div>

            <div class="results-actions-stack">
              ${
                isLesson && currentLesson
                  ? passedLesson
                    ? `
                    <button class="btn-primary btn-full" id="btn-results-next">
                      <span class="btn-inner-left">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span>Next Chapter</span>
                      </span>
                      <kbd>Enter</kbd>
                    </button>
                    ${nextChapterDef ? `<div style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:-2px;">Up next: ${escapeHTML(nextChapterDef.title)}</div>` : ''}
                    <div class="results-actions-subrow">
                      <button class="btn-secondary" id="btn-results-try-again">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        <span>Repeat</span> <kbd>Tab</kbd>
                      </button>
                      <button class="btn-secondary" id="btn-results-analytics">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        <span>Analytics</span>
                      </button>
                    </div>
                    `
                    : `
                    <button class="btn-primary btn-full" id="btn-results-try-again">
                      <span class="btn-inner-left">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        <span>Retry Chapter</span>
                      </span>
                      <kbd>Enter</kbd>
                    </button>
                    <div class="results-actions-subrow">
                      <button class="btn-secondary" id="btn-results-next">
                        <span>Skip</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        <kbd>Tab</kbd>
                      </button>
                      <button class="btn-secondary" id="btn-results-analytics">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        <span>Analytics</span>
                      </button>
                    </div>
                    `
                  : `
                  <button class="btn-primary btn-full" id="btn-results-try-again">
                    <span class="btn-inner-left">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                      <span>Try Again</span>
                    </span>
                    <kbd>Enter</kbd>
                  </button>
                  <div class="results-actions-subrow">
                    <button class="btn-secondary" id="btn-results-next">
                      <span>Next</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      <kbd>Tab</kbd>
                    </button>
                    <button class="btn-secondary" id="btn-results-analytics">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                      <span>Analytics</span>
                    </button>
                  </div>
                  `
              }
              ${
                results.weakKeys && results.weakKeys.length > 0
                  ? `
                  <button class="btn-secondary btn-full" id="btn-results-weak-keys" style="margin-top:6px;border-color:rgba(244,63,94,0.3);color:var(--accent-rose);height:38px;padding:0 14px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;" title="Practice drill focused on high error keys">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    <span>Practice Weak Keys (${escapeHTML(results.weakKeys.slice(0, 3).map((k) => String(k?.key ?? '').toUpperCase()).join(', '))})</span>
                  </button>
                  `
                  : ''
              }
            </div>
          </div>

          <div class="results-graph-column">
            <div class="graph-top-info">
              <span>Peak Burst: <strong>${results.burstPeakWpm || results.wpm}</strong> WPM</span>
              <span>Keystrokes: <strong>${results.totalKeystrokes}</strong></span>
            </div>
            <div class="chart-canvas-wrapper" style="height: 195px; position: relative; width: 100%;">
              <canvas id="results-timeline-chart" style="width: 100%; height: 100%;"></canvas>
              <div id="results-timeline-tooltip" class="chart-tooltip"></div>
            </div>

            ${
              reward
                ? `
                <div class="results-xp-box">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <div>
                      <span style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em;">Session Rewards</span>
                      <div class="xp-pills-row" style="margin-top:2px;">
                        <span class="xp-pill-stat">Base: +${reward.baseXp} XP</span>
                        ${reward.accBonus > 0 ? `<span class="xp-pill-stat bonus">Acc: +${reward.accBonus} XP</span>` : ''}
                        ${reward.streakBonus > 0 ? `<span class="xp-pill-stat bonus">Streak: +${reward.streakBonus} XP</span>` : ''}
                        ${reward.dailyChallengeBonus > 0 ? `<span class="xp-pill-stat bonus">Daily Challenge: +${reward.dailyChallengeBonus} XP</span>` : ''}
                        ${reward.badgeBonus > 0 ? `<span class="xp-pill-stat bonus">Badges: +${reward.badgeBonus} XP</span>` : ''}
                      </div>
                    </div>
                  </div>
                  <span class="xp-pill-stat total">+${reward.earnedXp} TOTAL XP</span>
                </div>
                `
                : ''
            }
          </div>
        </div>
      </div>
    `;

    // Render Canvas Timeline
    const chartCanvas = container.querySelector('#results-timeline-chart') as HTMLCanvasElement;
    const chartTooltip = container.querySelector('#results-timeline-tooltip') as HTMLElement;
    let chartCleanup: (() => void) | null = null;

    if (chartCanvas) {
      chartCleanup = renderTimelineChart(chartCanvas, results.history, {
        tooltipElement: chartTooltip,
        avgWpm: results.wpm,
        peakWpm: results.burstPeakWpm || results.wpm,
      }) || null;
    }

    const tryAgainBtn = container.querySelector('#btn-results-try-again') as HTMLElement;
    const nextBtn = container.querySelector('#btn-results-next') as HTMLElement;
    const analyticsBtn = container.querySelector('#btn-results-analytics') as HTMLElement;
    const weakKeysBtn = container.querySelector('#btn-results-weak-keys') as HTMLElement;

    const cleanup = () => {
      if (chartCleanup) {
        chartCleanup();
        chartCleanup = null;
      }
    };

    tryAgainBtn?.addEventListener('click', () => {
      cleanup();
      triggerButtonPress(tryAgainBtn);
      scheduleSafeTimeout(() => startSession(false, false), 100);
    });

    nextBtn?.addEventListener('click', () => {
      cleanup();
      triggerButtonPress(nextBtn);
      if (lessonChapter) {
        const nextChap = getNextChapterAfter(lessonChapter.id);
        if (nextChap) {
          setActiveLessonChapter(nextChap);
          lessonChapter = nextChap;
          lastSessionWords = null;
          // Update banner in DOM
          const titleEl = container.querySelector('#lesson-title');
          if (titleEl) titleEl.textContent = nextChap.title;
          const goalEl = container.querySelector('#lesson-goal');
          if (goalEl) goalEl.textContent = nextChap.goal;
          const targetPill = container.querySelector('#lesson-banner .mode-pill');
          if (targetPill) targetPill.textContent = `Target: ${nextChap.wpmTarget} WPM · ${nextChap.accTarget}% Acc`;
          refreshLessonStation();
          scheduleSafeTimeout(() => startSession(true, false), 100);
          return;
        } else {
          // All chapters completed! Return to curriculum view
          setActiveLessonChapter(null);
          lessonChapter = null;
          const ribbon = container.querySelector('#test-config-ribbon') as HTMLElement;
          if (ribbon) ribbon.style.display = 'flex';
          if (onNavigate) {
            onNavigate('curriculum');
            return;
          }
        }
      }
      scheduleSafeTimeout(() => startSession(true, false), 100);
    });

    analyticsBtn?.addEventListener('click', () => {
      cleanup();
      if (onNavigate) onNavigate('analytics');
    });

    weakKeysBtn?.addEventListener('click', () => {
      cleanup();
      triggerButtonPress(weakKeysBtn);
      config.mode = 'ai';
      // update ribbon visual active button
      container.querySelectorAll('.config-group button[data-mode]').forEach((b) => {
        b.classList.toggle('active', (b as HTMLElement).dataset.mode === 'ai');
      });
      scheduleSafeTimeout(() => startSession(true, false), 100);
    });
  }

  // Mount shell
  renderDOMShell();

  // Return view teardown function
  return function teardown(): void {
    isDestroyed = true;
    for (const tid of pendingTimers) {
      clearTimeout(tid);
    }
    pendingTimers.clear();
    if (caretBlinkTimeout !== null) {
      clearTimeout(caretBlinkTimeout);
      caretBlinkTimeout = null;
    }
    if (caretRafId !== null) {
      cancelAnimationFrame(caretRafId);
      caretRafId = null;
    }

    if (countdown) {
      countdown.cancel();
      countdown = null;
    }
    if (activeKeydownListener) {
      window.removeEventListener('keydown', activeKeydownListener);
      activeKeydownListener = null;
    }
    if (engine) {
      engine.destroy();
      engine = null;
    }
    if (pomodoro) {
      pomodoro.destroy();
      pomodoro = null;
    }
    if (handsVisualizer) {
      handsVisualizer.clearActive();
      handsVisualizer = null;
    }
    const exitBtn = document.getElementById('btn-exit-fullscreen');
    if (exitBtn) exitBtn.remove();
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.body.classList.remove('focus-mode');
    if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
      document.exitFullscreen().catch(() => {});
    }
  };
}
