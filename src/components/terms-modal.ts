// Santypes Terms of Use & Acceptable Use Modal

import { TERMS_EFFECTIVE_DATE, TERMS_SECTIONS, TERMS_VERSION } from '../core/legal-content.ts';
import { DialogHost } from '../utils/dialog-host.ts';
import { escapeHTML } from '../utils/html.ts';
import { playTactileClick } from '../utils/sound.ts';
import { PrivacyModal } from './privacy-modal.ts';

export class TermsModal {
  private host = new DialogHost();

  public show(): void {
    const backdrop = this.host.open('terms-modal-backdrop');
    backdrop.innerHTML = `
      <div class="settings-card-modal privacy-card-modal terms-card-modal" role="dialog" aria-modal="true" aria-labelledby="terms-modal-title">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="settings-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <div>
              <h2 class="modal-title" id="terms-modal-title" style="margin:0;font-size:18px;">Terms of Use</h2>
              <span style="font-size:11px;color:var(--text-muted);">Version ${escapeHTML(TERMS_VERSION)} · Effective ${escapeHTML(TERMS_EFFECTIVE_DATE)}</span>
            </div>
          </div>
          <button type="button" class="modal-close-btn" id="btn-close-terms" aria-label="Close Terms of Use" title="Close (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="settings-scroll-body">
          ${TERMS_SECTIONS.map(
            (section) => `
              <div class="settings-group">
                <span class="settings-group-title">${escapeHTML(section.title)}</span>
                <p class="privacy-copy">${escapeHTML(section.body)}</p>
              </div>
            `
          ).join('')}
        </div>

        <div class="settings-modal-footer faq-footer">
          <div class="faq-footer-links">
            <button type="button" class="footer-link-btn" id="btn-terms-open-privacy">Privacy &amp; IT Notice</button>
            <span class="footer-sep" aria-hidden="true">·</span>
            <a href="/terms.html" target="_blank" rel="noopener noreferrer" class="footer-link-btn">Open Standalone Page</a>
          </div>
          <button type="button" class="btn-primary" id="btn-done-terms" style="min-height:36px;padding:0 22px;font-weight:800;">Accept &amp; Close</button>
        </div>
      </div>
    `;

    const close = () => {
      playTactileClick('button');
      this.host.close();
    };

    backdrop.querySelector('#btn-close-terms')?.addEventListener('click', close);
    backdrop.querySelector('#btn-done-terms')?.addEventListener('click', close);
    backdrop.querySelector('#btn-terms-open-privacy')?.addEventListener('click', () => {
      playTactileClick('button');
      this.host.close();
      new PrivacyModal().show();
    });
  }

  public close(): void {
    this.host.close();
  }
}
