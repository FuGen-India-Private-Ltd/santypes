// Santypes Keyboard Shortcuts Modal Component (Ctrl+Shift+?)

import {
  captureActiveElement,
  focusInitialDialogControl,
  isTopmostModalBackdrop,
  restoreFocusSafe,
  trapTabWithinModal,
} from '../utils/dialog-host.ts';

export class ShortcutsModal {
  private container: HTMLElement;
  private modalEl: HTMLElement | null = null;
  private isOpen: boolean = false;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    const existing = this.container.querySelector('#shortcuts-modal');
    if (existing) existing.remove();

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'shortcuts-modal';
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.setAttribute('aria-hidden', 'true');

    this.modalEl.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="shortcuts-modal-title">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <h3 id="shortcuts-modal-title" style="margin:0;">Keyboard Shortcuts</h3>
          </div>
          <button type="button" class="icon-btn modal-close-btn" id="btn-close-shortcuts" aria-label="Close keyboard shortcuts" style="display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-row">
            <span class="shortcut-desc">Restart / Next Test</span>
            <span class="shortcut-keys"><kbd>Tab</kbd></span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Reset Test / Dismiss / Exit Focus</span>
            <span class="shortcut-keys"><kbd>Esc</kbd></span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Toggle Focus Mode</span>
            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd></span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Toggle Word-Error Mode</span>
            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd></span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Toggle Pomodoro Focus Bar</span>
            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Show Shortcuts Cheatsheet</span>
            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>?</kbd></span>
          </div>
        </div>
      </div>
    `;

    const closeBtn = this.modalEl.querySelector('#btn-close-shortcuts');
    closeBtn?.addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.container.appendChild(this.modalEl);
  }

  public open(): void {
    this.previouslyFocused = captureActiveElement();
    this.isOpen = true;
    if (!this.modalEl) return;
    this.modalEl.classList.add('visible');
    this.modalEl.setAttribute('aria-hidden', 'false');
    focusInitialDialogControl(this.modalEl);

    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener, true);
    }
    this.keydownListener = (e: KeyboardEvent) => {
      if (!this.modalEl || !this.isOpen || !isTopmostModalBackdrop(this.modalEl)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.close();
        return;
      }
      trapTabWithinModal(e, this.modalEl);
    };
    window.addEventListener('keydown', this.keydownListener, true);
  }

  public close(): void {
    this.isOpen = false;
    this.modalEl?.classList.remove('visible');
    this.modalEl?.setAttribute('aria-hidden', 'true');
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener, true);
      this.keydownListener = null;
    }
    const prevFocus = this.previouslyFocused;
    this.previouslyFocused = null;
    restoreFocusSafe(prevFocus);
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }
}
