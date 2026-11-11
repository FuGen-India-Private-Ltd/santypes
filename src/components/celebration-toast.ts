// Santypes Celebration Banner & Achievement Notification Toast
// Dynamic celebration with glowing animations and sound triggers

import { BadgeDefinition, getBadgeCategorySvg } from '../core/gamification.ts';
import { playTactileClick } from '../utils/sound.ts';
import { escapeHTML, finiteNumber } from '../utils/html.ts';

export function showNotificationToast(msg: string): void {
  const existing = document.querySelector('.santypes-general-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'santypes-general-toast animate-pop-in';
  toast.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #fff;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    z-index: 99999;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  toast.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    <span>${escapeHTML(msg)}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 2600);
}

function getCelebrationStack(): HTMLElement {
  let stack = document.getElementById('santypes-celebration-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'santypes-celebration-stack';
    stack.className = 'achievement-toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}

function mountCelebrationToast(container: HTMLElement): void {
  const stack = getCelebrationStack();
  const existingCount = stack.children.length;
  stack.appendChild(container);

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    container.classList.add('animate-slide-out');
    setTimeout(() => {
      container.remove();
      if (stack.children.length === 0) {
        stack.remove();
      }
    }, 380);
  };

  container.addEventListener('click', dismiss);
  setTimeout(dismiss, 4500 + Math.min(existingCount, 4) * 550);
}

export function showBadgeCelebration(badge: BadgeDefinition): void {
  playTactileClick('button');

  const container = document.createElement('div');
  container.className = 'achievement-toast animate-pop-in';
  container.innerHTML = `
    <div class="achievement-icon-wrapper">
      ${getBadgeCategorySvg(badge.category)}
      <div class="achievement-glow-ring"></div>
    </div>
    <div class="achievement-toast-body">
      <div class="achievement-toast-label" style="display:inline-flex;align-items:center;gap:5px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
        <span>ACHIEVEMENT UNLOCKED</span>
      </div>
      <div class="achievement-toast-title">${escapeHTML(badge.title)}</div>
      <div class="achievement-toast-desc">${escapeHTML(badge.description)}</div>
    </div>
    <div class="achievement-toast-reward">
      +${finiteNumber(badge.xpReward, 0, 0)} XP
    </div>
  `;

  mountCelebrationToast(container);
}

export function showLevelUpCelebration(newLevel: number, rankTitle: string): void {
  playTactileClick('button');

  const container = document.createElement('div');
  container.className = 'achievement-toast level-up-toast animate-pop-in';
  container.innerHTML = `
    <div class="achievement-icon-wrapper level-halo">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    </div>
    <div class="achievement-toast-body">
      <div class="achievement-toast-label" style="display:inline-flex;align-items:center;gap:5px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
        <span>LEVEL UP</span>
      </div>
      <div class="achievement-toast-title">Reached Level ${escapeHTML(newLevel)}</div>
      <div class="achievement-toast-desc">Rank: <strong>${escapeHTML(rankTitle)}</strong></div>
    </div>
  `;

  mountCelebrationToast(container);
}

