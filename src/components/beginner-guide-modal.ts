// Santypes Beginner Hand Placement & Touch-Typing Rules Modal
// Pure TypeScript - Zero external UI dependencies

import { FINGER_COLORS, FINGER_NAMES, FingerCode } from '../core/finger-guide.ts';
import {
  captureActiveElement,
  focusInitialDialogControl,
  isTopmostModalBackdrop,
  restoreFocusSafe,
  trapTabWithinModal,
} from '../utils/dialog-host.ts';

type BeginnerGuideTab = 'posture' | 'fingers' | 'reaches' | 'checklist';
const VALID_GUIDE_TABS = new Set<BeginnerGuideTab>(['posture', 'fingers', 'reaches', 'checklist']);

export class BeginnerGuideModal {
  private static activeInstance: BeginnerGuideModal | null = null;
  private modalEl: HTMLElement | null = null;
  private activeTab: BeginnerGuideTab = 'posture';
  private selectedFingerCode: FingerCode = 'li'; // Default to Left Index
  private escListener: ((e: KeyboardEvent) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;

  public open(): void {
    if (BeginnerGuideModal.activeInstance && BeginnerGuideModal.activeInstance !== this) {
      BeginnerGuideModal.activeInstance.close();
    }
    this.close();
    BeginnerGuideModal.activeInstance = this;
    this.previouslyFocused = captureActiveElement();

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop visible beginner-guide-backdrop';
    this.render();
    document.body.appendChild(this.modalEl);
    focusInitialDialogControl(this.modalEl);

    // Close on escape & trap Tab inside dialog
    this.escListener = (e: KeyboardEvent) => {
      if (!this.modalEl || !isTopmostModalBackdrop(this.modalEl)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.close();
        return;
      }
      trapTabWithinModal(e, this.modalEl);
    };
    window.addEventListener('keydown', this.escListener, true);
  }

  public close(): void {
    if (BeginnerGuideModal.activeInstance === this) {
      BeginnerGuideModal.activeInstance = null;
    }
    const prevFocus = this.previouslyFocused;
    this.previouslyFocused = null;
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
    if (this.escListener) {
      window.removeEventListener('keydown', this.escListener, true);
      this.escListener = null;
    }
    restoreFocusSafe(prevFocus);
  }

  private render(): void {
    if (!this.modalEl) return;

    this.modalEl.innerHTML = `
      <div class="beginner-modal-card" role="dialog" aria-modal="true" aria-labelledby="beginner-guide-modal-title">
        <!-- Top Bar -->
        <div class="beginner-modal-top">
          <div class="top-title-group">
            <span class="beginner-pill" style="display:inline-flex;align-items:center;gap:6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              <span>Touch-Typing Primer for Beginners</span>
            </span>
            <h2 class="beginner-modal-title" id="beginner-guide-modal-title">Hand Placement & Finger Guidance</h2>
          </div>
          <button type="button" class="icon-btn modal-close-btn" id="btn-close-beginner-guide" aria-label="Close modal" style="display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Tab Ribbon -->
        <div class="beginner-tabs">
          <button class="beginner-tab-btn ${this.activeTab === 'posture' ? 'active' : ''}" data-tab="posture">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>
            <span>Posture & Home Row</span>
          </button>
          <button class="beginner-tab-btn ${this.activeTab === 'fingers' ? 'active' : ''}" data-tab="fingers">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
            <span>Finger-to-Key Matrix</span>
          </button>
          <button class="beginner-tab-btn ${this.activeTab === 'reaches' ? 'active' : ''}" data-tab="reaches">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            <span>Reach & Shift Rules</span>
          </button>
          <button class="beginner-tab-btn ${this.activeTab === 'checklist' ? 'active' : ''}" data-tab="checklist">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Beginner Checklist</span>
          </button>
        </div>

        <!-- Body Content -->
        <div class="beginner-modal-body">
          ${this.renderTabContent()}
        </div>

        <!-- Footer -->
        <div class="beginner-modal-footer">
          <div style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <em>Rule #1: Accuracy builds permanent muscle memory. Speed comes naturally.</em>
          </div>
          <button class="btn-primary" id="btn-beginner-got-it" style="padding:8px 20px;display:inline-flex;align-items:center;gap:8px;">
            <span>Got it, let's practice!</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderTabContent(): string {
    switch (this.activeTab) {
      case 'posture':
        return `
          <div class="guide-grid-2col">
            <div class="guide-feature-card">
              <div class="feature-icon-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <h3 class="feature-title">The Home Row Resting Anchor</h3>
              <p class="feature-desc">
                Your 8 fingers have permanent "home" keys where they must rest naturally whenever idle.
              </p>
              <div class="home-row-demo">
                <div class="demo-hand">
                  <span class="demo-hand-label">Left Hand</span>
                  <div class="demo-keys">
                    <span class="demo-key" style="border-color:${FINGER_COLORS.lp};color:${FINGER_COLORS.lp}">A<small>Pinky</small></span>
                    <span class="demo-key" style="border-color:${FINGER_COLORS.lr};color:${FINGER_COLORS.lr}">S<small>Ring</small></span>
                    <span class="demo-key" style="border-color:${FINGER_COLORS.lm};color:${FINGER_COLORS.lm}">D<small>Mid</small></span>
                    <span class="demo-key" style="border-color:${FINGER_COLORS.li};color:${FINGER_COLORS.li}">F<small>Index Bump</small></span>
                  </div>
                </div>
                <div class="demo-hand">
                  <span class="demo-hand-label">Right Hand</span>
                  <div class="demo-keys">
                    <span class="demo-key" style="border-color:${FINGER_COLORS.ri};color:${FINGER_COLORS.ri}">J<small>Index Bump</small></span>
                    <span class="demo-key" style="border-color:${FINGER_COLORS.rm};color:${FINGER_COLORS.rm}">K<small>Mid</small></span>
                    <span class="demo-key" style="border-color:${FINGER_COLORS.rr};color:${FINGER_COLORS.rr}">L<small>Ring</small></span>
                    <span class="demo-key" style="border-color:${FINGER_COLORS.rp};color:${FINGER_COLORS.rp}">;<small>Pinky</small></span>
                  </div>
                </div>
              </div>
              <p style="font-size:12px;color:var(--text-secondary);margin-top:10px;">
                Both thumbs rest lightly floating over the <strong>Spacebar</strong>.
              </p>
            </div>

            <div class="guide-feature-card">
              <div class="feature-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"></rect><circle cx="12" cy="15" r="1.5" fill="currentColor"></circle></svg>
              </div>
              <h3 class="feature-title">Tactile Bumps on F and J</h3>
              <p class="feature-desc">
                Almost every physical keyboard has a tiny raised ridge or dot on the <strong>F</strong> and <strong>J</strong> keycaps.
              </p>
              <ul class="guide-bullets">
                <li>Your <strong>Left Index Finger</strong> finds the bump on <strong>F</strong>.</li>
                <li>Your <strong>Right Index Finger</strong> finds the bump on <strong>J</strong>.</li>
                <li>Once your index fingers touch these ridges, your other 6 fingers automatically drop into place on <em>A, S, D</em> and <em>K, L, ;</em> without ever looking down!</li>
              </ul>
            </div>

            <div class="guide-feature-card">
              <div class="feature-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M6 14v-2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3"></path></svg>
              </div>
              <h3 class="feature-title">Wrist & Finger Ergonomics</h3>
              <p class="feature-desc">
                Treat keyboarding like playing a grand piano:
              </p>
              <ul class="guide-bullets">
                <li><strong>Hover Wrists:</strong> Do NOT rest your wrists flat against the table or sharp laptop edge while typing. Keep wrists straight and slightly elevated.</li>
                <li><strong>Curved Fingers:</strong> Curve your fingers gently, as if holding a tennis ball or egg. Strike with the rounded fingertip pads.</li>
                <li><strong>Light Tap:</strong> Mechanical and membrane switches actuate with light pressure. Never pound the keys.</li>
              </ul>
            </div>

            <div class="guide-feature-card">
              <div class="feature-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
              </div>
              <h3 class="feature-title">The #1 Rule: Eye Discipline</h3>
              <p class="feature-desc">
                <strong>Never look down at your keyboard.</strong> Look only at the screen.
              </p>
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                When you look down, you bypass your brain's muscle memory circuitry. When you make a mistake, do not look down to find the key — feel for the <strong>F</strong> and <strong>J</strong> bumps to re-anchor, then try again.
              </p>
            </div>
          </div>
        `;

      case 'fingers':
        return `
          <div class="finger-matrix-wrapper">
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;">
              Click any finger below to view all keys, numbers, and symbols assigned to it:
            </p>

            <div class="finger-selector-bar">
              ${(['lp', 'lr', 'lm', 'li', 'ri', 'rm', 'rr', 'rp', 'thumb'] as FingerCode[]).map(code => `
                <button class="finger-chip-btn ${this.selectedFingerCode === code ? 'active' : ''}" data-select-finger="${code}" style="--chip-color:${FINGER_COLORS[code]}">
                  <span class="chip-dot" style="background:${FINGER_COLORS[code]}"></span>
                  <span>${FINGER_NAMES[code]}</span>
                </button>
              `).join('')}
            </div>

            <div class="finger-detail-box">
              ${this.renderFingerDetail(this.selectedFingerCode)}
            </div>
          </div>
        `;

      case 'reaches':
        return `
          <div class="guide-grid-2col">
            <div class="guide-feature-card">
              <div class="feature-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              </div>
              <h3 class="feature-title">The "Snap-Back" Anchor Rule</h3>
              <p class="feature-desc">
                When you need to press a key on the top or bottom row (like <em>R, E, V, C</em>):
              </p>
              <ul class="guide-bullets">
                <li><strong>Only the assigned finger leaves home.</strong> Your other 7 fingers stay quietly anchored.</li>
                <li>Reach out smoothly, tap the key with light cadence.</li>
                <li><strong>Snap back immediately</strong> to the home key. Never leave fingers lingering in the top or bottom rows!</li>
              </ul>
            </div>

            <div class="guide-feature-card">
              <div class="feature-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 8h-4v10H9V11H5l7-8z"></path></svg>
              </div>
              <h3 class="feature-title">The Opposite Shift Key Rule</h3>
              <p class="feature-desc">
                Keyboards have two Shift keys for a scientific reason:
              </p>
              <ul class="guide-bullets">
                <li>If the character is on the <strong>LEFT HAND</strong> (e.g. <em>A, S, D, F, R, E</em>), hold <strong>Right Shift</strong> with your Right Pinky!</li>
                <li>If the character is on the <strong>RIGHT HAND</strong> (e.g. <em>J, K, L, U, I, O</em>), hold <strong>Left Shift</strong> with your Left Pinky!</li>
                <li><strong>Never</strong> stretch one hand to hold Shift and hit a letter at the same time. This ruins hand alignment.</li>
              </ul>
            </div>

            <div class="guide-feature-card">
              <div class="feature-icon-badge">
                <svg width="24" height="14" viewBox="0 0 28 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="2" width="26" height="12" rx="3"></rect><line x1="7" y1="9" x2="21" y2="9"></line></svg>
              </div>
              <h3 class="feature-title">Spacebar Mechanics</h3>
              <p class="feature-desc">
                Use whichever thumb feels natural (most typists prefer their dominant hand's thumb).
              </p>
              <ul class="guide-bullets">
                <li>Strike the spacebar with the side of your thumb.</li>
                <li>Do not move your palm or lift your fingers off the home row.</li>
              </ul>
            </div>

            <div class="guide-feature-card">
              <div class="feature-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <h3 class="feature-title">Rhythm & Cadence (Metronome Typing)</h3>
              <p class="feature-desc">
                Touch-typing is about steady rhythm, not bursts of frantic speed:
              </p>
              <ul class="guide-bullets">
                <li>Type like walking steps: <em>tap... tap... tap... tap...</em></li>
                <li>Typing in steady 25 WPM without pauses is much faster than typing 60 WPM for two words and getting stuck for 3 seconds on a typo!</li>
              </ul>
            </div>
          </div>
        `;

      case 'checklist':
        return `
          <div class="guide-checklist-box">
            <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:12px;">
              Ready to Practice? Quick 5-Step Pre-Flight Checklist
            </h3>
            <div class="checklist-items">
              <div class="check-item">
                <span class="check-num">1</span>
                <div>
                  <strong>Check your posture:</strong> Sit straight, feet flat on the floor, elbows resting comfortably at a 90-degree angle.
                </div>
              </div>
              <div class="check-item">
                <span class="check-num">2</span>
                <div>
                  <strong>Blindly find F and J:</strong> Without looking at your keyboard, slide your index fingers until you feel the tactile bump on each key.
                </div>
              </div>
              <div class="check-item">
                <span class="check-num">3</span>
                <div>
                  <strong>Drop remaining fingers on home row:</strong> Rest pinky, ring, and middle fingers on A-S-D and K-L-; respectively.
                </div>
              </div>
              <div class="check-item">
                <span class="check-num">4</span>
                <div>
                  <strong>Hover your wrists:</strong> Lift your palms so they aren't dragging against the desk surface.
                </div>
              </div>
              <div class="check-item">
                <span class="check-num">5</span>
                <div>
                  <strong>Eyes locked onto screen:</strong> Begin the lesson. If you make a mistake, don't look down — feel the tactile bumps and keep going!
                </div>
              </div>
            </div>
          </div>
        `;
    }
  }

  private renderFingerDetail(code: FingerCode): string {
    const fingerData: Record<FingerCode, {
      name: string;
      hand: string;
      home: string;
      keys: Array<{ k: string; type: string; arrow: string }>;
      advice: string;
    }> = {
      lp: {
        name: 'Left Pinky',
        hand: 'Left Hand',
        home: 'A',
        keys: [
          { k: 'A', type: 'Home Anchor', arrow: '•' },
          { k: 'Q', type: 'Reach UP', arrow: '↑' },
          { k: 'Z', type: 'Reach DOWN', arrow: '↓' },
          { k: '1', type: 'Reach FAR UP (!)', arrow: '↑' },
          { k: '`', type: 'Far Up Left (~)', arrow: '↖' },
          { k: 'Tab', type: 'Reach Left', arrow: '←' },
          { k: 'Shift', type: 'Hold Left Shift', arrow: '↑' },
        ],
        advice: 'Left Pinky is the smallest finger. Keep it relaxed and strike lightly. Do not tense your shoulder.',
      },
      lr: {
        name: 'Left Ring Finger',
        hand: 'Left Hand',
        home: 'S',
        keys: [
          { k: 'S', type: 'Home Anchor', arrow: '•' },
          { k: 'W', type: 'Reach UP', arrow: '↑' },
          { k: 'X', type: 'Reach DOWN', arrow: '↓' },
          { k: '2', type: 'Reach FAR UP (@)', arrow: '↑' },
        ],
        advice: 'Ring fingers share a tendon with the middle finger. It takes patient practice to isolate it. Accuracy over speed!',
      },
      lm: {
        name: 'Left Middle Finger',
        hand: 'Left Hand',
        home: 'D',
        keys: [
          { k: 'D', type: 'Home Anchor', arrow: '•' },
          { k: 'E', type: 'Reach UP', arrow: '↑' },
          { k: 'C', type: 'Reach DOWN', arrow: '↓' },
          { k: '3', type: 'Reach FAR UP (#)', arrow: '↑' },
        ],
        advice: 'Strong, agile finger. One of the most frequently used fingers for the letter E in English.',
      },
      li: {
        name: 'Left Index Finger',
        hand: 'Left Hand',
        home: 'F (Tactile Bump)',
        keys: [
          { k: 'F', type: 'Home Anchor (Tactile Bump)', arrow: '•' },
          { k: 'G', type: 'Reach Inward Right', arrow: '→' },
          { k: 'R', type: 'Reach UP', arrow: '↑' },
          { k: 'T', type: 'Reach UP & Right', arrow: '↗' },
          { k: 'V', type: 'Reach DOWN', arrow: '↓' },
          { k: 'B', type: 'Reach DOWN & Right', arrow: '↘' },
          { k: '4', type: 'Reach FAR UP ($)', arrow: '↑' },
          { k: '5', type: 'Reach FAR UP (%)', arrow: '↗' },
        ],
        advice: 'The most versatile finger on the left hand. It covers two columns (F/R/V/4 and G/T/B/5). Always snap back to F!',
      },
      ri: {
        name: 'Right Index Finger',
        hand: 'Right Hand',
        home: 'J (Tactile Bump)',
        keys: [
          { k: 'J', type: 'Home Anchor (Tactile Bump)', arrow: '•' },
          { k: 'H', type: 'Reach Inward Left', arrow: '←' },
          { k: 'U', type: 'Reach UP', arrow: '↑' },
          { k: 'Y', type: 'Reach UP & Left', arrow: '↖' },
          { k: 'M', type: 'Reach DOWN', arrow: '↓' },
          { k: 'N', type: 'Reach DOWN & Left', arrow: '↙' },
          { k: '6', type: 'Reach FAR UP (^)', arrow: '↖' },
          { k: '7', type: 'Reach FAR UP (&)', arrow: '↑' },
        ],
        advice: 'The anchor for the right hand. Covers two columns (J/U/M/7 and H/Y/N/6). Feel for the J bump constantly.',
      },
      rm: {
        name: 'Right Middle Finger',
        hand: 'Right Hand',
        home: 'K',
        keys: [
          { k: 'K', type: 'Home Anchor', arrow: '•' },
          { k: 'I', type: 'Reach UP', arrow: '↑' },
          { k: ',', type: 'Reach DOWN (<)', arrow: '↓' },
          { k: '8', type: 'Reach FAR UP (*)', arrow: '↑' },
        ],
        advice: 'Key finger for common vowel I and comma. Keep wrists elevated so you reach UP to I cleanly.',
      },
      rr: {
        name: 'Right Ring Finger',
        hand: 'Right Hand',
        home: 'L',
        keys: [
          { k: 'L', type: 'Home Anchor', arrow: '•' },
          { k: 'O', type: 'Reach UP', arrow: '↑' },
          { k: '.', type: 'Reach DOWN (>)', arrow: '↓' },
          { k: '9', type: 'Reach FAR UP (()', arrow: '↑' },
        ],
        advice: 'Very important for period (.) and the letter O. Snap back to L after each stroke.',
      },
      rp: {
        name: 'Right Pinky',
        hand: 'Right Hand',
        home: ';',
        keys: [
          { k: ';', type: 'Home Anchor (:)', arrow: '•' },
          { k: 'P', type: 'Reach UP', arrow: '↑' },
          { k: '/', type: 'Reach DOWN (?)', arrow: '↓' },
          { k: "'", type: 'Reach Right (")', arrow: '→' },
          { k: '0', type: 'Reach FAR UP ())', arrow: '↑' },
          { k: '-', type: 'Reach FAR UP (_)', arrow: '↗' },
          { k: '=', type: 'Reach FAR UP (+)', arrow: '↗' },
          { k: 'Enter', type: 'Reach Right', arrow: '→' },
          { k: 'Bksp', type: 'Reach Far Right', arrow: '←' },
        ],
        advice: 'Handles punctuation, quotes, Enter, and Backspace. Keep hand grounded on JKL so your pinky doesn\'t drift.',
      },
      thumb: {
        name: 'Thumbs (Both Hands)',
        hand: 'Either Hand',
        home: 'Spacebar',
        keys: [
          { k: 'Space', type: 'Resting Position', arrow: '•' },
        ],
        advice: 'Use the thumb of your dominant hand to lightly tap Space. Keep other 8 fingers resting on ASDF JKL;.',
      },
    };

    const data = fingerData[code];
    return `
      <div class="finger-detail-header">
        <div>
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">${data.hand}</span>
          <h4 style="font-size:18px;font-weight:800;color:#ffffff;margin:2px 0 0 0;">${data.name}</h4>
          <span style="font-size:12px;color:var(--text-muted)">Home Resting Anchor: <strong>${data.home}</strong></span>
        </div>
        <div class="finger-pill-badge">
          ${data.keys.length} Key Assignments
        </div>
      </div>

      <div class="finger-key-cards">
        ${data.keys.map(k => {
          const isHome = k.type.includes('Home Anchor');
          return `
            <div class="finger-key-tile ${isHome ? 'is-home-key' : ''}">
              <span class="tile-char ${isHome ? 'char-home' : ''}">${k.k}</span>
              <div class="tile-info">
                <span class="tile-type">${k.type}</span>
                <span class="tile-arrow">${k.arrow}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="finger-advice-tip">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5h6.18z"></path></svg>
        <span><strong>Pro Tip:</strong> ${data.advice}</span>
      </div>
    `;
  }

  private bindEvents(): void {
    if (!this.modalEl) return;

    // Close buttons
    this.modalEl.querySelector('#btn-close-beginner-guide')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-beginner-got-it')?.addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Tab buttons
    this.modalEl.querySelectorAll('.beginner-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab as BeginnerGuideTab | undefined;
        if (tab && VALID_GUIDE_TABS.has(tab)) {
          this.activeTab = tab;
          this.render();
          if (this.modalEl) focusInitialDialogControl(this.modalEl);
        }
      });
    });

    // Finger selector chips
    this.modalEl.querySelectorAll('[data-select-finger]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = (btn as HTMLElement).dataset.selectFinger as FingerCode;
        if (code) {
          this.selectedFingerCode = code;
          const detailContainer = this.modalEl?.querySelector('.finger-detail-box');
          if (detailContainer) {
            detailContainer.innerHTML = this.renderFingerDetail(code);
          }
          // Update active chip
          this.modalEl?.querySelectorAll('.finger-chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });
  }
}
