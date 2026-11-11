// Santypes Privacy, Data Governance & Government IT Compliance Modal
// Transparent disclosure & user controls aligned with India DPDP Act 2023,
// IT Act 2000 (Sec 43A & SPDI Rules 2011), CERT-In hygiene, and GDPR / ePrivacy.

import { playTactileClick } from '../utils/sound.ts';
import { escapeHTML } from '../utils/html.ts';
import {
  PRIVACY_POLICY_VERSION,
  collectAllLocalUserData,
  denyAnalyticsConsent,
  eraseAllLocalUserData,
  getAnalyticsConsentStatus,
  grantAnalyticsConsent,
  isGlobalPrivacyControlEnabled,
} from '../utils/privacy.ts';
import {
  captureActiveElement,
  confirmActionDialog,
  focusInitialDialogControl,
  isTopmostModalBackdrop,
  restoreFocusSafe,
  trapTabWithinModal,
} from '../utils/dialog-host.ts';
import { showNotificationToast } from './celebration-toast.ts';
import {
  mountConsentBannerIfNeeded,
  syncConsentBannerVisibility,
} from './consent-banner.ts';

export class PrivacyModal {
  private static activeInstance: PrivacyModal | null = null;
  private backdrop: HTMLElement | null = null;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;

  public show(): void {
    if (PrivacyModal.activeInstance && PrivacyModal.activeInstance !== this) {
      PrivacyModal.activeInstance.close();
    }
    this.close();
    PrivacyModal.activeInstance = this;
    this.previouslyFocused = captureActiveElement();

    const backdrop = document.createElement('div');
    backdrop.className = 'settings-modal-backdrop modal-backdrop visible privacy-modal-backdrop';
    this.backdrop = backdrop;

    this.render();
    document.body.appendChild(backdrop);
    syncConsentBannerVisibility();
    focusInitialDialogControl(backdrop);

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
  }

  private render(): void {
    if (!this.backdrop) return;
    const status = getAnalyticsConsentStatus();
    const isGranted = status === 'granted';
    const gpcActive = isGlobalPrivacyControlEnabled();
    const statusLabel =
      status === 'granted'
        ? 'Opted In (Anonymous Analytics Active)'
        : status === 'denied'
        ? gpcActive
          ? 'Essential Only (Global Privacy Control Honored)'
          : 'Essential Only (Analytics Disabled)'
        : 'Not Decided Yet (Analytics Disabled by Default)';

    this.backdrop.innerHTML = `
      <div class="settings-card-modal privacy-card-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="settings-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div>
              <h2 class="modal-title" id="privacy-modal-title" style="margin:0;font-size:18px;">Privacy, Consent &amp; IT Compliance</h2>
              <span style="font-size:11px;color:var(--text-muted);">Policy Version ${escapeHTML(PRIVACY_POLICY_VERSION)} · DPDP Act 2023, IT Rules &amp; GDPR Controls</span>
            </div>
          </div>
          <button type="button" class="modal-close-btn" id="btn-close-privacy" aria-label="Close Privacy Notice" title="Close (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="settings-scroll-body">
          <div class="settings-group">
            <span class="settings-group-title">1. Local-First Processing Notice (Zero Account Server)</span>
            <p class="privacy-copy">
              Santypes operates <strong>100% locally in your browser</strong> without mandatory user registration, passwords, or backend storage of typing keystrokes, speed history, custom practice drills, settings, or feedback drafts.
              All practice metrics remain solely inside browser <code>localStorage</code> on your device until you clear or export them.
            </p>
          </div>

          <div class="settings-group">
            <span class="settings-group-title">2. Third-Party Services &amp; Analytics Consent</span>
            <p class="privacy-copy">
              <strong>Google Analytics 4 (Optional):</strong> Loaded <strong>only</strong> after your explicit opt-in consent, with IP anonymization enabled and ad-personalization signals disabled. Free-text feedback notes are <strong>never</strong> transmitted to analytics.
            </p>
            <p class="privacy-copy">
              <strong>Self-Hosted Typography (Zero Font CDN Requests):</strong> All interface, code, Kannada, and Devanagari font files are bundled directly inside Santypes and served from <code>'self'</code>. Your browser never contacts external font CDNs when loading pages. Feedback drafts and copied summaries remain strictly in your browser.
            </p>
            ${
              gpcActive && !isGranted
                ? `<p class="privacy-copy privacy-gpc-banner"><strong>Browser Signal Respected:</strong> Global Privacy Control (GPC) is enabled in your browser, so optional analytics remain off automatically unless you explicitly toggle them on below.</p>`
                : ''
            }
            <div class="settings-row">
              <div class="settings-row-info">
                <span class="settings-label">Optional Anonymous Usage Analytics</span>
                <span class="settings-desc" id="privacy-consent-status">${escapeHTML(statusLabel)}</span>
              </div>
              <label class="switch-control">
                <input type="checkbox" id="toggle-privacy-analytics" aria-label="Optional Anonymous Usage Analytics" ${isGranted ? 'checked' : ''} />
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-group">
            <span class="settings-group-title">3. Your Statutory Data Rights (Access, Portability &amp; Erasure)</span>
            <div class="privacy-actions-row">
              <button type="button" class="btn-secondary" id="btn-privacy-export">Export All Local Data (JSON)</button>
              <button type="button" class="btn-danger-outline" id="btn-privacy-erase">Delete All Local Data</button>
            </div>
          </div>

          <div class="settings-group">
            <span class="settings-group-title">4. Data Protection, Grievance Contact &amp; Security Disclosure</span>
            <p class="privacy-copy">
              Santypes stores zero server-side personal data or accounts. Because all practice telemetry, preferences, and feedback drafts live exclusively in your browser's local storage, you hold full direct control to inspect, export, or erase your data at any moment above.
            </p>
            <p class="privacy-copy">
              <strong>Support, Grievance &amp; Security Reporting:</strong> Review our RFC 9116 disclosure metadata at <code>/.well-known/security.txt</code>, submit support/privacy inquiries via <a href="https://github.com/suhas-hoskere/santypes/issues" target="_blank" rel="noopener noreferrer" class="feedback-email-link">GitHub Issues</a>, or submit security reports via <a href="https://github.com/suhas-hoskere/santypes/security" target="_blank" rel="noopener noreferrer" class="feedback-email-link">GitHub Security Advisories</a>.
            </p>
          </div>
        </div>

        <div class="settings-modal-footer">
          <a href="/.well-known/security.txt" target="_blank" rel="noopener noreferrer" class="feedback-email-link" style="font-size:12px;">Security Disclosure Policy (RFC 9116)</a>
          <button type="button" class="btn-primary" id="btn-done-privacy" style="min-height:36px;padding:0 22px;font-weight:800;">Done</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.backdrop) return;

    this.backdrop.querySelector('#btn-close-privacy')?.addEventListener('click', () => {
      playTactileClick('button');
      this.close();
    });
    this.backdrop.querySelector('#btn-done-privacy')?.addEventListener('click', () => {
      playTactileClick('button');
      this.close();
    });

    const toggle = this.backdrop.querySelector<HTMLInputElement>('#toggle-privacy-analytics');
    toggle?.addEventListener('change', () => {
      playTactileClick('button');
      if (toggle.checked) {
        grantAnalyticsConsent();
        showNotificationToast('Optional analytics enabled.');
      } else {
        denyAnalyticsConsent();
        showNotificationToast('Analytics disabled and cookies cleared.');
      }
      this.render();
    });

    this.backdrop.querySelector('#btn-privacy-export')?.addEventListener('click', () => {
      playTactileClick('button');
      try {
        const payload = collectAllLocalUserData();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `santypes_personal_data_${Date.now()}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showNotificationToast('All local personal data exported!');
      } catch {
        showNotificationToast('Unable to export data in this environment.');
      }
    });

    this.backdrop.querySelector('#btn-privacy-erase')?.addEventListener('click', async () => {
      playTactileClick('button');
      const confirmed = await confirmActionDialog({
        title: 'Delete All Local Data?',
        message:
          'Permanently delete ALL Santypes history, custom drills, progress, badges, feedback drafts, and preferences from this browser? This cannot be undone.',
        confirmLabel: 'Delete All Data',
        dangerous: true,
      });
      if (confirmed) {
        eraseAllLocalUserData();
        showNotificationToast('All local data erased permanently.');
        this.render();
      }
    });
  }

  public close(): void {
    if (PrivacyModal.activeInstance === this) {
      PrivacyModal.activeInstance = null;
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
    mountConsentBannerIfNeeded();
    syncConsentBannerVisibility();
    restoreFocusSafe(prevFocus);
  }
}
