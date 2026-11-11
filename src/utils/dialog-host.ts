// Shared Accessible Modal Host, Focus Trap & In-App Confirmation Dialog
// Manages singleton backdrop mounting, Escape & Tab-trap capture handling, focus restoration, and clean teardown

import { escapeHTML } from './html.ts';
import { syncConsentBannerVisibility } from '../components/consent-banner.ts';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function captureActiveElement(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.activeElement instanceof HTMLElement ? document.activeElement : null;
}

export function restoreFocusSafe(el: HTMLElement | null): void {
  if (!el || !el.isConnected) return;
  try {
    el.focus({ preventScroll: true });
  } catch {
    el.focus();
  }
}

export function isTopmostModalBackdrop(backdrop: HTMLElement): boolean {
  if (typeof document === 'undefined' || !backdrop.isConnected) return false;
  const overlays = document.querySelectorAll('.modal-backdrop.visible, .settings-modal-backdrop');
  if (overlays.length === 0) return false;
  return overlays[overlays.length - 1] === backdrop;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter((el) => {
    if (el.closest('[hidden]') || el.getAttribute('aria-hidden') === 'true') return false;
    const closedDetails = el.closest('details:not([open])');
    if (closedDetails && el.tagName.toLowerCase() !== 'summary') return false;
    if (typeof getComputedStyle === 'function') {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
    }
    return true;
  });
}

export function focusInitialDialogControl(backdrop: HTMLElement): void {
  const preferred =
    backdrop.querySelector<HTMLElement>(
      '[autofocus]:not([disabled]), .modal-close-btn:not([disabled]), button:not([disabled])'
    ) || getFocusableElements(backdrop)[0];

  if (preferred) {
    try {
      preferred.focus({ preventScroll: true });
    } catch {
      preferred.focus();
    }
    return;
  }

  const dialog = backdrop.querySelector<HTMLElement>('[role="dialog"], [role="alertdialog"]');
  if (dialog) {
    if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
    dialog.focus({ preventScroll: true });
  }
}

export function trapTabWithinModal(e: KeyboardEvent, backdrop: HTMLElement): void {
  if (e.key !== 'Tab' || !isTopmostModalBackdrop(backdrop)) return;

  const focusables = getFocusableElements(backdrop);
  if (focusables.length === 0) {
    e.preventDefault();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  if (e.shiftKey) {
    if (!active || !backdrop.contains(active) || active === first) {
      e.preventDefault();
      last.focus();
    }
  } else if (!active || !backdrop.contains(active) || active === last) {
    e.preventDefault();
    first.focus();
  }
}

export class DialogHost {
  private static activeHost: DialogHost | null = null;
  private backdrop: HTMLElement | null = null;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private onCloseCallback: (() => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;

  public open(className: string, onClose?: () => void): HTMLElement {
    if (DialogHost.activeHost && DialogHost.activeHost !== this) {
      DialogHost.activeHost.close();
    }
    this.close();
    DialogHost.activeHost = this;
    this.previouslyFocused = captureActiveElement();
    this.onCloseCallback = onClose || null;

    const backdrop = document.createElement('div');
    backdrop.className = `settings-modal-backdrop modal-backdrop visible ${className}`.trim();
    this.backdrop = backdrop;
    document.body.appendChild(backdrop);
    syncConsentBannerVisibility();

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

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

    queueMicrotask(() => {
      if (this.backdrop === backdrop && backdrop.isConnected) {
        const active = document.activeElement;
        if (!active || !backdrop.contains(active)) {
          focusInitialDialogControl(backdrop);
        }
      }
    });

    return backdrop;
  }

  public getBackdrop(): HTMLElement | null {
    return this.backdrop;
  }

  public close(): void {
    if (DialogHost.activeHost === this) {
      DialogHost.activeHost = null;
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
    if (this.onCloseCallback) {
      const cb = this.onCloseCallback;
      this.onCloseCallback = null;
      cb();
    }
    syncConsentBannerVisibility();
    restoreFocusSafe(prevFocus);
  }
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  dangerous?: boolean;
}

/** Accessible non-blocking in-app replacement for native window.confirm() */
export function confirmActionDialog(options: ConfirmDialogOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const host = new DialogHost();
    const finish = (accepted: boolean) => {
      if (settled) return;
      settled = true;
      host.close();
      resolve(accepted);
    };

    const backdrop = host.open('confirm-modal-backdrop', () => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    });

    const confirmBtnClass = options.dangerous ? 'btn-danger-outline confirm-action-btn-danger' : 'btn-primary';
    backdrop.innerHTML = `
      <div class="settings-card-modal confirm-card-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message">
        <div class="modal-header">
          <h2 class="modal-title" id="confirm-dialog-title" style="margin:0;font-size:17px;">${escapeHTML(options.title)}</h2>
          <button type="button" class="modal-close-btn" id="btn-close-confirm-dialog" aria-label="Close confirmation dialog" title="Cancel (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="settings-scroll-body" style="padding:18px 22px;">
          <p id="confirm-dialog-message" class="privacy-copy" style="margin:0;">${escapeHTML(options.message)}</p>
        </div>
        <div class="settings-modal-footer" style="justify-content:flex-end;gap:10px;">
          <button type="button" class="btn-secondary" id="btn-confirm-dialog-cancel" autofocus>${escapeHTML(options.cancelLabel ?? 'Cancel')}</button>
          <button type="button" class="${confirmBtnClass}" id="btn-confirm-dialog-accept">${escapeHTML(options.confirmLabel ?? 'Confirm')}</button>
        </div>
      </div>
    `;

    backdrop.querySelector('#btn-close-confirm-dialog')?.addEventListener('click', () => finish(false));
    backdrop.querySelector('#btn-confirm-dialog-cancel')?.addEventListener('click', () => finish(false));
    backdrop.querySelector('#btn-confirm-dialog-accept')?.addEventListener('click', () => finish(true));
  });
}
