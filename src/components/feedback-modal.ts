// Santypes Feedback & Feature Request Modal
// Captures real launch feedback, 3D Games interest votes (consent-gated GA4 + localStorage), and shareable summaries

import { playTactileClick } from '../utils/sound.ts';
import { escapeHTML } from '../utils/html.ts';
import { trackAnalyticsEvent } from '../utils/privacy.ts';
import {
  captureActiveElement,
  focusInitialDialogControl,
  isTopmostModalBackdrop,
  restoreFocusSafe,
  trapTabWithinModal,
} from '../utils/dialog-host.ts';
import { syncConsentBannerVisibility } from './consent-banner.ts';

export type GamesInterestVote = 'yes' | 'later' | 'no';

export interface FeedbackEntry {
  rating: number;
  gamesVote: GamesInterestVote;
  topic: string;
  notes: string;
  submittedAt: string;
}

const FEEDBACK_STORAGE_KEY = 'santypes_feedback_history_v1';

const RATING_LABELS: Array<{ value: number; label: string }> = [
  { value: 1, label: '1 · Needs Work' },
  { value: 2, label: '2 · Okay' },
  { value: 3, label: '3 · Good' },
  { value: 4, label: '4 · Great' },
  { value: 5, label: '5 · Love It' },
];

const GAMES_OPTIONS: Array<{ value: GamesInterestVote; label: string }> = [
  { value: 'yes', label: 'Yes, add 3D Games!' },
  { value: 'later', label: 'Maybe Later' },
  { value: 'no', label: 'Keep Pure Typing' },
];

const TOPICS = ['Typing Test', 'Curriculum', 'Analytics', 'UI / Themes', 'Bug Report'];

export function buildFeedbackSummaryText(entry: FeedbackEntry): string {
  const voteText =
    GAMES_OPTIONS.find((opt) => opt.value === entry.gamesVote)?.label ?? entry.gamesVote;
  const lines = [
    'Santypes Feedback',
    `Rating: ${entry.rating}/5`,
    `Want 3D Typing Games?: ${voteText}`,
    `Area: ${entry.topic}`,
  ];
  if (entry.notes.trim()) {
    lines.push(`Notes: ${entry.notes.trim()}`);
  }
  lines.push(`Submitted: ${entry.submittedAt}`);
  return lines.join('\n');
}

export function getSavedFeedbackHistory(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFeedbackEntry(entry: FeedbackEntry): void {
  try {
    const existing = getSavedFeedbackHistory();
    const updated = [entry, ...existing].slice(0, 10);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

export class FeedbackModal {
  private static activeInstance: FeedbackModal | null = null;
  private backdrop: HTMLElement | null = null;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private rating = 5;
  private gamesVote: GamesInterestVote = 'yes';
  private topic = 'Typing Test';
  private notes = '';
  private submittedEntry: FeedbackEntry | null = null;
  private hasMounted = false;

  public show(): void {
    if (FeedbackModal.activeInstance && FeedbackModal.activeInstance !== this) {
      FeedbackModal.activeInstance.close();
    }
    this.close();
    FeedbackModal.activeInstance = this;
    this.previouslyFocused = captureActiveElement();

    const previous = getSavedFeedbackHistory()[0];
    if (previous) {
      this.rating = previous.rating;
      this.gamesVote = previous.gamesVote;
      this.topic = previous.topic;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'settings-modal-backdrop modal-backdrop visible feedback-modal-backdrop';
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

  private submit(): void {
    const entry: FeedbackEntry = {
      rating: this.rating,
      gamesVote: this.gamesVote,
      topic: this.topic,
      notes: this.notes.trim().slice(0, 500),
      submittedAt: new Date().toISOString(),
    };

    saveFeedbackEntry(entry);

    // Emit ONLY non-PII enums/booleans and ONLY when user opted in to analytics
    trackAnalyticsEvent('user_feedback', {
      rating: entry.rating,
      games_vote: entry.gamesVote,
      topic: entry.topic,
      has_notes: entry.notes.length > 0,
    });
    trackAnalyticsEvent('games_interest_vote', {
      vote: entry.gamesVote,
    });

    this.submittedEntry = entry;
    this.render();
  }

  private render(): void {
    if (!this.backdrop) return;

    const animClass = this.hasMounted ? 'no-reanimate' : '';
    this.hasMounted = true;
    const priorCount = getSavedFeedbackHistory().length;

    if (this.submittedEntry) {
      const voteLabel =
        GAMES_OPTIONS.find((o) => o.value === this.submittedEntry?.gamesVote)?.label ??
        this.submittedEntry.gamesVote;

      this.backdrop.innerHTML = `
        <div class="settings-card-modal feedback-card-modal ${animClass}" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:12px;">
              <div class="settings-header-icon" style="color:var(--accent-cyan);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <h2 class="modal-title" id="feedback-modal-title" style="margin:0;font-size:18px;">Thank You for Your Feedback</h2>
                <span style="font-size:11px;color:var(--text-muted);">Recorded to help shape the next Santypes release</span>
              </div>
            </div>
            <button class="modal-close-btn" id="btn-close-feedback" title="Close (Esc)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="settings-scroll-body feedback-body">
            <div class="feedback-confirm-card">
              <div class="feedback-confirm-row"><span>Rating</span><strong>${escapeHTML(this.submittedEntry.rating)} / 5</strong></div>
              <div class="feedback-confirm-row"><span>3D Typing Games Vote</span><strong>${escapeHTML(voteLabel)}</strong></div>
              <div class="feedback-confirm-row"><span>Focus Area</span><strong>${escapeHTML(this.submittedEntry.topic)}</strong></div>
              ${
                this.submittedEntry.notes
                  ? `<div class="feedback-confirm-notes">"${escapeHTML(this.submittedEntry.notes)}"</div>`
                  : ''
              }
            </div>
            <p class="feedback-helper-note">
              Saved locally in your browser (free-text notes are never transmitted to analytics). Use Copy Summary below if you wish to share it manually.
            </p>
          </div>

          <div class="settings-modal-footer feedback-footer-actions">
            <button type="button" class="btn-secondary" id="btn-feedback-again">Send Another</button>
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
              <button type="button" class="btn-secondary" id="btn-copy-feedback">Copy Summary</button>
              <button type="button" class="btn-primary" id="btn-done-feedback">Done</button>
            </div>
          </div>
        </div>
      `;

      this.backdrop.querySelector('#btn-close-feedback')?.addEventListener('click', () => {
        playTactileClick('button');
        this.close();
      });
      this.backdrop.querySelector('#btn-done-feedback')?.addEventListener('click', () => {
        playTactileClick('button');
        this.close();
      });
      this.backdrop.querySelector('#btn-feedback-again')?.addEventListener('click', () => {
        playTactileClick('button');
        this.submittedEntry = null;
        this.notes = '';
        this.render();
      });
      const copyBtn = this.backdrop.querySelector<HTMLButtonElement>('#btn-copy-feedback');
      copyBtn?.addEventListener('click', async () => {
        playTactileClick('button');
        if (!this.submittedEntry) return;
        const summary = buildFeedbackSummaryText(this.submittedEntry);
        try {
          if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            throw new Error('Clipboard API unavailable');
          }
          await navigator.clipboard.writeText(summary);
          copyBtn.textContent = 'Copied Summary!';
          setTimeout(() => {
            if (copyBtn.isConnected) copyBtn.textContent = 'Copy Summary';
          }, 1800);
        } catch {
          copyBtn.textContent = 'Copy Unavailable';
          setTimeout(() => {
            if (copyBtn.isConnected) copyBtn.textContent = 'Copy Summary';
          }, 1800);
        }
      });
      return;
    }

    this.backdrop.innerHTML = `
      <div class="settings-card-modal feedback-card-modal ${animClass}" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="settings-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div>
              <h2 class="modal-title" id="feedback-modal-title" style="margin:0;font-size:18px;">Share Feedback</h2>
              <span style="font-size:11px;color:var(--text-muted);">Help us prioritize improvements and future 3D typing games</span>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-feedback" title="Close (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="settings-scroll-body feedback-body">
          <div class="settings-group">
            <span class="settings-group-title">1. Overall Experience</span>
            <div class="feedback-pill-row">
              ${RATING_LABELS.map(
                (r) => `
                <button type="button" class="option-pill-btn feedback-rate-btn ${this.rating === r.value ? 'active' : ''}" data-rating="${r.value}">
                  ${r.label}
                </button>`
              ).join('')}
            </div>
          </div>

          <div class="settings-group feedback-games-box">
            <span class="settings-group-title">2. Future Roadmap Vote</span>
            <div class="feedback-poll-question">Would you play 3D Typing Games (combat, racing, extraction) if we add an Arcade mode?</div>
            <div class="feedback-pill-row">
              ${GAMES_OPTIONS.map(
                (opt) => `
                <button type="button" class="option-pill-btn feedback-vote-btn ${this.gamesVote === opt.value ? 'active' : ''}" data-vote="${opt.value}">
                  ${opt.label}
                </button>`
              ).join('')}
            </div>
          </div>

          <div class="settings-group">
            <span class="settings-group-title">3. Topic & Notes (Optional)</span>
            <div class="feedback-pill-row">
              ${TOPICS.map(
                (t) => `
                <button type="button" class="option-pill-btn feedback-topic-btn ${this.topic === t ? 'active' : ''}" data-topic="${t}">
                  ${t}
                </button>`
              ).join('')}
            </div>
            <textarea
              id="feedback-notes-input"
              class="feedback-textarea"
              maxlength="500"
              rows="3"
              placeholder="What felt great, what bugged you, or what should we build next?"
            >${escapeHTML(this.notes)}</textarea>
          </div>
        </div>

        <div class="settings-modal-footer">
          <span style="font-size:12px;color:var(--text-muted);">
            Stored locally in your browser${priorCount > 0 ? ` · Logged: ${priorCount}` : ''}
          </span>
          <div style="display:flex;gap:10px;">
            <button type="button" class="btn-secondary" id="btn-cancel-feedback">Cancel</button>
            <button type="button" class="btn-primary" id="btn-submit-feedback">Submit Feedback</button>
          </div>
        </div>
      </div>
    `;

    this.backdrop.querySelector('#btn-close-feedback')?.addEventListener('click', () => {
      playTactileClick('button');
      this.close();
    });
    this.backdrop.querySelector('#btn-cancel-feedback')?.addEventListener('click', () => {
      playTactileClick('button');
      this.close();
    });

    const rateBtns = this.backdrop.querySelectorAll<HTMLButtonElement>('.feedback-rate-btn');
    rateBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        playTactileClick('button');
        this.rating = Number(btn.dataset.rating || 5);
        rateBtns.forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    const voteBtns = this.backdrop.querySelectorAll<HTMLButtonElement>('.feedback-vote-btn');
    voteBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        playTactileClick('button');
        this.gamesVote = (btn.dataset.vote as GamesInterestVote) || 'yes';
        voteBtns.forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    const topicBtns = this.backdrop.querySelectorAll<HTMLButtonElement>('.feedback-topic-btn');
    topicBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        playTactileClick('button');
        this.topic = btn.dataset.topic || 'Typing Test';
        topicBtns.forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    const notesEl = this.backdrop.querySelector<HTMLTextAreaElement>('#feedback-notes-input');
    notesEl?.addEventListener('input', () => {
      this.notes = notesEl.value;
    });
    notesEl?.addEventListener('keydown', (e) => {
      // Allow free typing including Space/Tab/Enter inside feedback notes
      if (e.key !== 'Escape') e.stopPropagation();
    });

    this.backdrop.querySelector('#btn-submit-feedback')?.addEventListener('click', () => {
      playTactileClick('button');
      this.submit();
    });
  }

  public close(): void {
    if (FeedbackModal.activeInstance === this) {
      FeedbackModal.activeInstance = null;
    }
    const prevFocus = this.previouslyFocused;
    this.previouslyFocused = null;
    this.hasMounted = false;
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
