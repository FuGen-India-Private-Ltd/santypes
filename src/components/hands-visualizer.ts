// Santypes Interactive Hands & Finger Motion Visualizer Component
// Pure TypeScript - SVG & Modern CSS Biomechanical Visualization

import {
  FingerGuidance,
  getFingerGuidance,
  FINGER_COLORS,
  FingerCode,
} from '../core/finger-guide.ts';
import { escapeHTML } from '../utils/html.ts';

export interface HandsVisualizerOptions {
  interactive?: boolean; // Allow clicking fingers to inspect key ranges
  showCoachingStrip?: boolean; // Render real-time verbal direction text
  compact?: boolean;
}

export class HandsVisualizer {
  private container: HTMLElement;
  private options: HandsVisualizerOptions;
  private activeFingerCode: FingerCode | null = null;
  private currentGuidance: FingerGuidance | null = null;
  private fingerElements: Map<FingerCode, HTMLElement[]> = new Map();
  private coachingEl: HTMLElement | null = null;
  private onFingerClick?: (code: FingerCode) => void;

  constructor(container: HTMLElement, options: HandsVisualizerOptions = {}) {
    this.container = container;
    this.options = {
      interactive: true,
      showCoachingStrip: true,
      compact: false,
      ...options,
    };
    this.render();
  }

  public setOnFingerClick(callback: (code: FingerCode) => void): void {
    this.onFingerClick = callback;
  }

  public render(): void {
    this.container.innerHTML = '';
    this.fingerElements.clear();

    const wrapper = document.createElement('div');
    wrapper.className = `hands-visualizer ${this.options.compact ? 'compact' : ''}`;

    // 1. Hands Container (Left Hand & Right Hand)
    const handsGrid = document.createElement('div');
    handsGrid.className = 'hands-grid';

    // LEFT HAND
    const leftHand = this.createHandElement('left', [
      { code: 'lp', label: 'Pinky', key: 'A' },
      { code: 'lr', label: 'Ring', key: 'S' },
      { code: 'lm', label: 'Middle', key: 'D' },
      { code: 'li', label: 'Index', key: 'F', bump: true },
      { code: 'thumb', label: 'Thumb', key: 'Space' },
    ]);

    // RIGHT HAND
    const rightHand = this.createHandElement('right', [
      { code: 'thumb', label: 'Thumb', key: 'Space' },
      { code: 'ri', label: 'Index', key: 'J', bump: true },
      { code: 'rm', label: 'Middle', key: 'K' },
      { code: 'rr', label: 'Ring', key: 'L' },
      { code: 'rp', label: 'Pinky', key: ';' },
    ]);

    handsGrid.appendChild(leftHand);
    handsGrid.appendChild(rightHand);
    wrapper.appendChild(handsGrid);

    // 2. Coaching Strip (Verbal instruction and live direction)
    if (this.options.showCoachingStrip) {
      this.coachingEl = document.createElement('div');
      this.coachingEl.className = 'hand-coaching-strip';
      this.coachingEl.innerHTML = `
        <div class="coaching-placeholder">
          <span>Place all 8 fingers on the Home Row (<strong>ASDF</strong> & <strong>JKL;</strong>)</span>
          <span style="font-size:11px;color:var(--text-muted)">Feel the tactile bumps on F and J with your index fingers</span>
        </div>
      `;
      wrapper.appendChild(this.coachingEl);
    }

    this.container.appendChild(wrapper);
  }

  private createHandElement(
    side: 'left' | 'right',
    fingers: Array<{ code: FingerCode; label: string; key: string; bump?: boolean }>
  ): HTMLElement {
    const handBox = document.createElement('div');
    handBox.className = `hand-card hand-${side}`;

    const handHeader = document.createElement('div');
    handHeader.className = 'hand-header';
    handHeader.innerHTML = `
      <span class="hand-side-badge">${side === 'left' ? 'Left Hand' : 'Right Hand'}</span>
      <span class="hand-anchor-label">${side === 'left' ? 'Home: A · S · D · F' : 'Home: J · K · L · ;'}</span>
    `;
    handBox.appendChild(handHeader);

    const fingersRow = document.createElement('div');
    fingersRow.className = 'hand-fingers-row';

    for (const f of fingers) {
      const fingerEl = document.createElement('div');
      fingerEl.className = `finger-pillar finger-${f.code}`;
      fingerEl.dataset.fingerCode = f.code;
      fingerEl.style.setProperty('--finger-accent', FINGER_COLORS[f.code]);

      fingerEl.innerHTML = `
        <div class="finger-motion-indicator"></div>
        <div class="finger-pad">
          <span class="finger-home-key ${f.key === 'Space' ? 'key-space' : ''}">${f.key}</span>
          ${f.bump ? '<span class="tactile-bump-bar" title="Tactile bump on keycap"></span>' : ''}
        </div>
        <div class="finger-label-wrap">
          <span class="finger-name-dot"></span>
          <span class="finger-name-label">${f.label}</span>
        </div>
      `;

      if (this.options.interactive) {
        fingerEl.addEventListener('click', () => {
          if (this.onFingerClick) {
            this.onFingerClick(f.code);
          }
        });
      }

      if (!this.fingerElements.has(f.code)) {
        this.fingerElements.set(f.code, []);
      }
      this.fingerElements.get(f.code)!.push(fingerEl);
      fingersRow.appendChild(fingerEl);
    }

    handBox.appendChild(fingersRow);
    return handBox;
  }

  public getActiveFinger(): FingerCode | null {
    return this.activeFingerCode;
  }

  public getCurrentGuidance(): FingerGuidance | null {
    return this.currentGuidance;
  }

  /**
   * Update active target key guidance in real-time.
   */
  public update(char: string | null): void {
    if (!char) {
      this.clearActive();
      return;
    }

    const guidance = getFingerGuidance(char);
    this.currentGuidance = guidance;
    this.activeFingerCode = guidance.fingerCode;

    // Reset all finger styles
    this.fingerElements.forEach(els => {
      els.forEach(el => {
        el.classList.remove('active', 'reaching', 'anchored');
        const motionEl = el.querySelector('.finger-motion-indicator');
        if (motionEl) {
          motionEl.textContent = '';
        }
      });
    });

    // Highlight target finger(s)
    const targetEls = this.fingerElements.get(guidance.fingerCode);
    if (targetEls) {
      targetEls.forEach(targetEl => {
        targetEl.classList.add('active');
        if (guidance.isHomeKey) {
          targetEl.classList.add('anchored');
        } else {
          targetEl.classList.add('reaching');
        }

        const motionEl = targetEl.querySelector('.finger-motion-indicator');
        if (motionEl) {
          motionEl.textContent = guidance.motionArrow;
        }
      });
    }

    // Update coaching strip (all character/instruction fields escaped against HTML injection)
    if (this.coachingEl) {
      const color = escapeHTML(guidance.fingerColor);
      this.coachingEl.innerHTML = `
        <div class="coaching-content">
          <div class="coaching-left">
            <div class="coaching-target-badge" style="border-color:${color};color:${color}">
              <span class="target-char">${escapeHTML(guidance.displayKey)}</span>
            </div>
            <div class="coaching-meta">
              <div class="coaching-finger-title" style="color:${color}">
                <span>${escapeHTML(guidance.handLabel)}</span> · <strong>${escapeHTML(guidance.fingerName)}</strong>
              </div>
              <div class="coaching-instruction-text">
                ${escapeHTML(guidance.instruction)}
              </div>
            </div>
          </div>
          <div class="coaching-motion-badge" style="background:${color}18;border-color:${color}40;color:${color}">
            <span class="arrow">${escapeHTML(guidance.motionArrow)}</span>
            <span>${escapeHTML(guidance.motionLabel)}</span>
          </div>
        </div>
      `;
    }
  }

  /**
   * Clear active finger highlights.
   */
  public clearActive(): void {
    this.activeFingerCode = null;
    this.currentGuidance = null;
    this.fingerElements.forEach(els => {
      els.forEach(el => {
        el.classList.remove('active', 'reaching', 'anchored');
        const motionEl = el.querySelector('.finger-motion-indicator');
        if (motionEl) motionEl.textContent = '';
      });
    });

    if (this.coachingEl) {
      this.coachingEl.innerHTML = `
        <div class="coaching-placeholder">
          <span>Place all 8 fingers on the Home Row (<strong>ASDF</strong> & <strong>JKL;</strong>)</span>
          <span style="font-size:11px;color:var(--text-muted)">Feel the tactile bumps on F and J with your index fingers</span>
        </div>
      `;
    }
  }
}

