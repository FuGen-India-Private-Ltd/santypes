// Santypes Interactive FAQ & Help Q&A Modal

import { FAQ_ITEMS, filterFaqItems } from '../core/legal-content.ts';
import { DialogHost } from '../utils/dialog-host.ts';
import { escapeHTML } from '../utils/html.ts';
import { playTactileClick } from '../utils/sound.ts';
import { FeedbackModal } from './feedback-modal.ts';
import { PrivacyModal } from './privacy-modal.ts';

export class FaqModal {
  private host = new DialogHost();

  public show(): void {
    const backdrop = this.host.open('faq-modal-backdrop');
    backdrop.innerHTML = `
      <div class="settings-card-modal privacy-card-modal faq-card-modal" role="dialog" aria-modal="true" aria-labelledby="faq-modal-title">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="settings-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h2 class="modal-title" id="faq-modal-title" style="margin:0;font-size:18px;">Frequently Asked Questions</h2>
              <span style="font-size:11px;color:var(--text-muted);">Quick answers on metrics, languages, shortcuts, privacy &amp; support</span>
            </div>
          </div>
          <button type="button" class="modal-close-btn" id="btn-close-faq" aria-label="Close FAQ" title="Close (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="settings-scroll-body faq-body">
          <div class="faq-search-row">
            <input
              type="search"
              id="faq-search-input"
              class="custom-lesson-input faq-search-input"
              placeholder="Search questions (e.g. WPM, paste, privacy, Kannada, shortcuts)..."
              aria-label="Search FAQ questions"
              maxlength="120"
            />
          </div>
          <div class="faq-list" id="faq-list-container">
            ${this.renderItemsHTML(FAQ_ITEMS)}
          </div>
        </div>

        <div class="settings-modal-footer faq-footer">
          <div class="faq-footer-links">
            <button type="button" class="footer-link-btn" id="btn-faq-open-privacy">Privacy Notice</button>
            <span class="footer-sep" aria-hidden="true">·</span>
            <button type="button" class="footer-link-btn" id="btn-faq-open-feedback">Send Feedback</button>
            <span class="footer-sep" aria-hidden="true">·</span>
            <a href="/faq.html" target="_blank" rel="noopener noreferrer" class="footer-link-btn">Open Standalone Page</a>
          </div>
          <button type="button" class="btn-primary" id="btn-done-faq" style="min-height:36px;padding:0 22px;font-weight:800;">Done</button>
        </div>
      </div>
    `;

    this.bindEvents(backdrop);
  }

  private renderItemsHTML(items: readonly (typeof FAQ_ITEMS)[number][]): string {
    if (items.length === 0) {
      return `<p class="privacy-copy" style="text-align:center;padding:18px 0;">No FAQ entries matched your search.</p>`;
    }

    return items
      .map(
        (item, idx) => `
          <details class="faq-item" ${idx === 0 ? 'open' : ''}>
            <summary class="faq-question">
              <span class="faq-q-cat">${escapeHTML(item.category)}</span>
              <span class="faq-q-text">${escapeHTML(item.question)}</span>
            </summary>
            <p class="faq-answer">${escapeHTML(item.answer)}</p>
          </details>
        `
      )
      .join('');
  }

  private bindEvents(backdrop: HTMLElement): void {
    const close = () => {
      playTactileClick('button');
      this.host.close();
    };

    backdrop.querySelector('#btn-close-faq')?.addEventListener('click', close);
    backdrop.querySelector('#btn-done-faq')?.addEventListener('click', close);

    const searchInput = backdrop.querySelector<HTMLInputElement>('#faq-search-input');
    const listContainer = backdrop.querySelector<HTMLElement>('#faq-list-container');
    searchInput?.addEventListener('input', () => {
      if (!listContainer) return;
      const filtered = filterFaqItems(searchInput.value);
      listContainer.innerHTML = this.renderItemsHTML(filtered);
    });

    backdrop.querySelector('#btn-faq-open-privacy')?.addEventListener('click', () => {
      playTactileClick('button');
      this.host.close();
      new PrivacyModal().show();
    });

    backdrop.querySelector('#btn-faq-open-feedback')?.addEventListener('click', () => {
      playTactileClick('button');
      this.host.close();
      new FeedbackModal().show();
    });
  }

  public close(): void {
    this.host.close();
  }
}
