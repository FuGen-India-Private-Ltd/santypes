// Santypes Balanced Privacy & Analytics Consent Banner
// Non-blocking opt-in consent notice with equal-weight Accept / Essential-Only buttons

import {
  denyAnalyticsConsent,
  getAnalyticsConsentStatus,
  grantAnalyticsConsent,
} from '../utils/privacy.ts';
import { playTactileClick } from '../utils/sound.ts';
import { PrivacyModal } from './privacy-modal.ts';

const BANNER_ID = 'santypes-consent-banner';

export function removeConsentBanner(): void {
  document.getElementById(BANNER_ID)?.remove();
}

export function syncConsentBannerVisibility(): void {
  if (typeof document === 'undefined') return;
  const banner = document.getElementById(BANNER_ID);
  if (!banner) return;
  const hasOpenModal = Boolean(
    document.querySelector(
      '.modal-backdrop.visible, .settings-modal-backdrop, .profile-modal-backdrop, .feedback-modal-backdrop, .privacy-modal-backdrop, .faq-modal-backdrop, .terms-modal-backdrop'
    )
  );
  banner.classList.toggle('is-temporarily-hidden', hasOpenModal);
}

export function mountConsentBannerIfNeeded(): void {
  if (typeof document === 'undefined') return;
  removeConsentBanner();

  if (getAnalyticsConsentStatus() !== 'unset') return;

  const banner = document.createElement('aside');
  banner.id = BANNER_ID;
  banner.className = 'consent-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Privacy and Cookie Consent');

  banner.innerHTML = `
    <div class="consent-banner-text">
      <strong>Your Privacy Choice</strong>
      <span>
        Your typing history &amp; custom drills stay 100% locally in your browser.
        Allow optional anonymous Google Analytics to help improve Santypes?
      </span>
    </div>
    <div class="consent-banner-actions">
      <button type="button" class="consent-link-btn" id="btn-consent-learn">Privacy &amp; IT Notice</button>
      <button type="button" class="btn-secondary consent-btn" id="btn-consent-deny">Essential Only</button>
      <button type="button" class="btn-secondary consent-btn consent-btn-accept" id="btn-consent-accept">Accept Analytics</button>
    </div>
  `;

  document.body.appendChild(banner);
  syncConsentBannerVisibility();

  banner.querySelector('#btn-consent-learn')?.addEventListener('click', () => {
    playTactileClick('button');
    new PrivacyModal().show();
  });

  banner.querySelector('#btn-consent-deny')?.addEventListener('click', () => {
    playTactileClick('button');
    denyAnalyticsConsent();
    removeConsentBanner();
  });

  banner.querySelector('#btn-consent-accept')?.addEventListener('click', () => {
    playTactileClick('button');
    grantAnalyticsConsent();
    removeConsentBanner();
  });
}
