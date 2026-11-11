import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildFeedbackSummaryText,
  getSavedFeedbackHistory,
  saveFeedbackEntry,
  FeedbackEntry,
} from '../src/components/feedback-modal';

const memStorage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => memStorage.get(k) ?? null,
    setItem: (k: string, v: string) => memStorage.set(k, v),
    removeItem: (k: string) => memStorage.delete(k),
    clear: () => memStorage.clear(),
  },
  configurable: true,
});

describe('Feedback Modal Helpers', () => {
  beforeEach(() => {
    memStorage.clear();
  });

  it('formats feedback summary cleanly with and without notes', () => {
    const entry: FeedbackEntry = {
      rating: 5,
      gamesVote: 'yes',
      topic: 'Typing Test',
      notes: 'Super smooth typing feel!',
      submittedAt: '2026-11-10T10:00:00.000Z',
    };

    const summary = buildFeedbackSummaryText(entry);
    expect(summary).toContain('Rating: 5/5');
    expect(summary).toContain('Want 3D Typing Games?: Yes, add 3D Games!');
    expect(summary).toContain('Area: Typing Test');
    expect(summary).toContain('Notes: Super smooth typing feel!');

    const minimal = buildFeedbackSummaryText({ ...entry, notes: '   ', gamesVote: 'no' });
    expect(minimal).toContain('Want 3D Typing Games?: Keep Pure Typing');
    expect(minimal).not.toContain('Notes:');
  });

  it('persists latest feedback entries capped to 10 records', () => {
    for (let i = 0; i < 12; i++) {
      saveFeedbackEntry({
        rating: 4,
        gamesVote: 'later',
        topic: 'Analytics',
        notes: `entry-${i}`,
        submittedAt: `2026-11-10T10:00:0${i % 10}.000Z`,
      });
    }

    const history = getSavedFeedbackHistory();
    expect(history).toHaveLength(10);
    expect(history[0].notes).toBe('entry-11');
  });

  it('keeps local feedback records free of contact emails or mailto links', () => {
    const summary = buildFeedbackSummaryText({
      rating: 5,
      gamesVote: 'yes',
      topic: 'Typing Test',
      notes: 'Clean and private',
      submittedAt: '2026-11-10T10:00:00.000Z',
    });

    expect(summary).not.toMatch(/mailto:|@/i);
  });
});
