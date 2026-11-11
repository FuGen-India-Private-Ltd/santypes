// Santypes Profile, XP Progress & Badges Showcase Modal
// 100% Framework-Free Pure TypeScript

import { ALL_BADGES, getBadgeCategorySvg, getDailyChallenge, getLevelProgress, UnlockedBadge } from '../core/gamification.ts';
import { getAccountState } from '../stubs/account-stub.ts';
import { getTestHistoryRaw } from '../stubs/storage-stub.ts';
import { escapeHTML, finiteNumber, getLocalDateKey, safeShortDate } from '../utils/html.ts';
import {
  captureActiveElement,
  focusInitialDialogControl,
  isTopmostModalBackdrop,
  restoreFocusSafe,
  trapTabWithinModal,
} from '../utils/dialog-host.ts';
import { syncConsentBannerVisibility } from './consent-banner.ts';

type BadgeFilter = 'all' | 'unlocked' | 'locked';

export class ProfileModal {
  private static activeInstance: ProfileModal | null = null;
  private backdrop: HTMLElement | null = null;
  private currentFilter: BadgeFilter = 'all';
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;

  public show(): void {
    if (ProfileModal.activeInstance && ProfileModal.activeInstance !== this) {
      ProfileModal.activeInstance.close();
    }
    this.close();
    ProfileModal.activeInstance = this;
    this.previouslyFocused = captureActiveElement();

    const state = getAccountState();
    const levelInfo = getLevelProgress(state.xp);
    const history = getTestHistoryRaw();
    const today = getLocalDateKey();
    const dailyChallenge = getDailyChallenge(today);
    const isDailyDone = state.dailyChallenge.date === today && state.dailyChallenge.completed;

    const unlockedMap = state.unlockedBadges || {};
    const unlockedCount = Object.keys(unlockedMap).length;
    const totalBadges = ALL_BADGES.length;

    const totalSeconds = (Array.isArray(history) ? history : []).reduce(
      (sum, s) => sum + finiteNumber(s?.elapsedSeconds, 0, 0, 86400),
      0
    );
    const totalMinutes = Math.floor(totalSeconds / 60);

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop visible profile-modal-backdrop';
    this.backdrop = backdrop;

    backdrop.innerHTML = `
      <div class="modal-card profile-card-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="profile-avatar-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M15 8.5a2.5 2.5 0 0 0-2.8-1.5c-1.6 0-2.7 1-2.7 2.3 0 2.5 5 1.8 5 4.4 0 1.4-1.2 2.3-2.8 2.3a2.8 2.8 0 0 1-2.9-1.8" stroke-width="2.2"></path><line x1="8" y1="19" x2="16" y2="19" stroke-width="1.8" opacity="0.4"></line></svg>
            </div>
            <div>
              <div class="profile-rank-tag">${levelInfo.rankTitle}</div>
              <h2 class="modal-title" id="profile-modal-title" style="margin:0;">Typist Profile & Badges</h2>
            </div>
          </div>
          <button type="button" class="modal-close-btn" id="btn-close-profile" aria-label="Close profile dialog" title="Close (Esc)" style="display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-scroll-content">
          <!-- 1. Hero Player Level & XP Card -->
          <div class="profile-hero-card">
            <div class="profile-level-badge-large">
              <span class="level-sub">LEVEL</span>
              <span class="level-num">${levelInfo.level}</span>
            </div>

            <div class="profile-xp-details">
              <div class="profile-xp-header">
                <span class="profile-xp-label">XP Progress</span>
                <span class="profile-xp-values">
                  <strong>${levelInfo.currentXp - levelInfo.xpForCurrentLevel}</strong> / ${levelInfo.xpForNextLevel - levelInfo.xpForCurrentLevel} XP
                  <span class="muted">(${levelInfo.progressPercent}%)</span>
                </span>
              </div>
              <div class="profile-xp-track">
                <div class="profile-xp-fill" style="width: ${levelInfo.progressPercent}%;"></div>
              </div>
              <div class="profile-xp-footer">
                <span>Total XP Earned: <strong>${levelInfo.currentXp.toLocaleString()} XP</strong></span>
                <span>Next Rank at Level ${levelInfo.level < 3 ? 3 : levelInfo.level < 6 ? 6 : levelInfo.level < 10 ? 10 : levelInfo.level < 15 ? 15 : levelInfo.level < 20 ? 20 : 30}</span>
              </div>
            </div>
          </div>

          <!-- 2. Quick Stats Row -->
          <div class="profile-stats-row">
            <div class="pstat-box">
              <span class="pstat-val" style="display:inline-flex;align-items:center;gap:6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                <span>${state.streak.current}</span>
                <small>days</small>
              </span>
              <span class="pstat-label">Current Streak (Best: ${state.streak.best}d)</span>
            </div>
            <div class="pstat-box">
              <span class="pstat-val" style="display:inline-flex;align-items:center;gap:6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                <span>${unlockedCount}</span>
                <small>/ ${totalBadges}</small>
              </span>
              <span class="pstat-label">Badges Unlocked</span>
            </div>
            <div class="pstat-box">
              <span class="pstat-val" style="display:inline-flex;align-items:center;gap:6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>${history.length}</span>
              </span>
              <span class="pstat-label">Tests Completed</span>
            </div>
            <div class="pstat-box">
              <span class="pstat-val" style="display:inline-flex;align-items:center;gap:6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>${totalMinutes}</span>
                <small>mins</small>
              </span>
              <span class="pstat-label">Time in Flow</span>
            </div>
          </div>

          <!-- 3. Daily Challenge Card -->
          <div class="daily-challenge-card ${isDailyDone ? 'completed' : ''}">
            <div class="dc-icon-col">
              <span class="dc-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <div class="dc-body">
              <div class="dc-meta">
                <span class="dc-pill">Daily Challenge</span>
                <span class="dc-reward">+${dailyChallenge.xpReward} XP</span>
              </div>
              <h3 class="dc-title">${escapeHTML(dailyChallenge.title)}</h3>
              <p class="dc-desc">${escapeHTML(dailyChallenge.description)}</p>
            </div>
            <div class="dc-status">
              ${
                isDailyDone
                  ? `<span class="badge-status-completed" style="display:inline-flex;align-items:center;gap:4px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> COMPLETED</span>`
                  : `<span class="badge-status-pending">IN PROGRESS</span>`
              }
            </div>
          </div>

          <!-- 4. Badges Showcase Section -->
          <div class="badges-section-header">
            <div>
              <h3 class="section-title">Milestone Achievements</h3>
              <span class="section-sub">Earn badges by hitting speed thresholds, accuracy benchmarks, and continuous practice streaks.</span>
            </div>

            <!-- Filter Controls -->
            <div class="badge-filters">
              <button class="filter-chip active" data-filter="all">All (${totalBadges})</button>
              <button class="filter-chip" data-filter="unlocked">Unlocked (${unlockedCount})</button>
              <button class="filter-chip" data-filter="locked">Locked (${totalBadges - unlockedCount})</button>
            </div>
          </div>

          <!-- 5. Badges Grid -->
          <div class="badges-grid" id="badges-grid-container">
            ${this.renderBadgesGridHTML(unlockedMap)}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    syncConsentBannerVisibility();
    focusInitialDialogControl(backdrop);

    // Event Bindings
    const closeBtn = backdrop.querySelector('#btn-close-profile');
    closeBtn?.addEventListener('click', () => this.close());

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

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

    // Filter Chips
    const filterChips = backdrop.querySelectorAll<HTMLButtonElement>('.filter-chip');
    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const nextFilter = chip.dataset.filter;
        this.currentFilter =
          nextFilter === 'unlocked' || nextFilter === 'locked' ? nextFilter : 'all';

        const grid = backdrop.querySelector('#badges-grid-container');
        if (grid) {
          grid.innerHTML = this.renderBadgesGridHTML(unlockedMap);
        }
      });
    });
  }

  private renderBadgesGridHTML(unlockedMap: Record<string, UnlockedBadge>): string {
    const filtered = ALL_BADGES.filter((badge) => {
      const isUnlocked = Object.hasOwn(unlockedMap, badge.id) && Boolean(unlockedMap[badge.id]);
      if (this.currentFilter === 'unlocked') return isUnlocked;
      if (this.currentFilter === 'locked') return !isUnlocked;
      return true;
    });

    if (filtered.length === 0) {
      return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-muted);">
          No badges found matching this filter.
        </div>
      `;
    }

    return filtered
      .map((badge) => {
        const isUnlocked = Object.hasOwn(unlockedMap, badge.id) && Boolean(unlockedMap[badge.id]);
        const unlockedInfo = isUnlocked ? unlockedMap[badge.id] : null;
        const dateStr = safeShortDate(unlockedInfo?.unlockedAt);

        return `
          <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
            <div class="badge-icon-box">
              <span class="badge-emoji">${getBadgeCategorySvg(badge.category)}</span>
              ${!isUnlocked ? `<span class="badge-lock-overlay"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>` : ''}
            </div>
            <div class="badge-info">
              <div class="badge-header-row">
                <span class="badge-title">${escapeHTML(badge.title)}</span>
                <span class="badge-xp-chip">+${finiteNumber(badge.xpReward, 0, 0)} XP</span>
              </div>
              <p class="badge-desc">${escapeHTML(badge.description)}</p>
              <div class="badge-footer">
                <span class="badge-cat-tag ${badge.category}">${badge.category.toUpperCase()}</span>
                <span class="badge-unlock-date" style="display:inline-flex;align-items:center;gap:4px;">${isUnlocked ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Unlocked ${dateStr}` : 'Locked'}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  public close(): void {
    if (ProfileModal.activeInstance === this) {
      ProfileModal.activeInstance = null;
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
    syncConsentBannerVisibility();
    restoreFocusSafe(prevFocus);
  }
}
