// Santypes Universal Tactile Button Feedback System
// Guarantees responsive, physical-feel button compression, coordinate-based ripples,
// and zero-latency mechanical audio on EVERY clickable element across the app.
// 100% Framework-Free Pure TypeScript

import { playTactileClick } from './sound.ts';

const CLICKABLE_SELECTOR = `
  button,
  [role="button"],
  .btn,
  .btn-primary,
  .btn-secondary,
  .config-btn,
  .restart-btn,
  .icon-btn,
  .nav-tab,
  .profile-pill-btn
`;

/**
 * Initializes the universal tactile listener on the window.
 * Catches all current and future dynamically-inserted buttons.
 */
export function initTactileSystem(): void {
  // 1. Pointer Down: Immediate contact response (Zero latency)
  window.addEventListener('pointerdown', (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    const targetBtn = (target && typeof target.closest === 'function')
      ? (target.closest(CLICKABLE_SELECTOR) as HTMLElement | null)
      : null;
    if (!targetBtn) return;

    // Trigger instant mechanical click sound
    playTactileClick('button');

    // Trigger physical compression & ripple
    triggerButtonPress(targetBtn, e.clientX, e.clientY);
  }, { passive: true });

  // 2. Keyboard accessibility trigger
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // If Space or Enter is pressed on a focused button
    if (e.key === ' ' || e.key === 'Enter') {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && typeof activeEl.matches === 'function' && activeEl.matches(CLICKABLE_SELECTOR)) {
        playTactileClick('button');
        triggerButtonPress(activeEl);
      }
    }
  });
}

/**
 * Visually triggers a button press animation with guaranteed minimum display duration
 * and a localized ripple originating from the click coordinate.
 */
export function triggerButtonPress(
  btn: HTMLElement | null,
  clientX: number | null = null,
  clientY: number | null = null
): void {
  if (!btn) return;

  // Add pressed class for physical depression
  btn.classList.add('btn-pressed');

  // Create localized ripple element
  createRipple(btn, clientX, clientY);

  // Keep pressed state for at least 120ms so fast taps and immediate focus changes
  // never abort or hide the physical button depression
  setTimeout(() => {
    btn.classList.remove('btn-pressed');
  }, 120);
}

/**
 * Spawns a localized ripple wave originating from the exact click coordinate.
 */
function createRipple(btn: HTMLElement, clientX: number | null, clientY: number | null): void {
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'tactile-ripple';

  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;

  if (clientX !== null && clientY !== null) {
    ripple.style.left = `${clientX - rect.left - size / 2}px`;
    ripple.style.top = `${clientY - rect.top - size / 2}px`;
  } else {
    // Center ripple if triggered via keyboard
    ripple.style.left = `${rect.width / 2 - size / 2}px`;
    ripple.style.top = `${rect.height / 2 - size / 2}px`;
  }

  btn.appendChild(ripple);

  // Clean up ripple element after animation completes
  setTimeout(() => {
    ripple.remove();
  }, 400);
}
