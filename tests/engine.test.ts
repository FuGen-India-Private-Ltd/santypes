import { describe, it, expect, vi } from 'vitest';
import { TypingEngine } from '../src/core/engine.ts';

describe('TypingEngine State Machine', () => {
  it('starts timer on first character typed', () => {
    const engine = new TypingEngine({
      mode: 'words',
      initialWords: ['hello', 'world'],
      duration: 30,
    });

    expect(engine.hasStarted).toBe(false);
    engine.handleInput('h');
    expect(engine.hasStarted).toBe(true);
    expect(engine.firstKeyLatency).toBeGreaterThanOrEqual(0);
    engine.destroy();
  });

  it('handles word progression via Spacebar without skipping on accidental double spaces', () => {
    const engine = new TypingEngine({
      mode: 'words',
      initialWords: ['the', 'quick'],
    });

    engine.handleInput('the');
    expect(engine.currentWordIndex).toBe(0);

    // Press space to commit 'the'
    engine.handleInput('the ');
    expect(engine.currentWordIndex).toBe(1);
    expect(engine.currentTyped).toBe('');
    expect(engine.words[0].isCommitted).toBe(true);
    expect(engine.words[0].isCorrect).toBe(true);
    expect(engine.completedWordsCount).toBe(1);

    // Accidental double space: does NOT skip word 1
    engine.handleInput(' ');
    expect(engine.currentWordIndex).toBe(1);
    expect(engine.currentTyped).toBe('');

    engine.destroy();
  });

  it('allows backspacing back into the previous word when input is empty', () => {
    const engine = new TypingEngine({
      mode: 'words',
      initialWords: ['alpha', 'beta'],
    });

    engine.handleInput('alpha ');
    expect(engine.currentWordIndex).toBe(1);

    // Backspace on empty input steps back to 'alpha'
    engine.handleBackspace();
    expect(engine.currentWordIndex).toBe(0);
    expect(engine.currentTyped).toBe('alpha');
    expect(engine.words[0].isCommitted).toBe(false);

    engine.destroy();
  });

  it('triggers onComplete callback when finishing in non-time mode', () => {
    const onComplete = vi.fn();
    const engine = new TypingEngine({
      mode: 'words',
      initialWords: ['one', 'two'],
      onComplete,
    });

    engine.handleInput('one ');
    engine.handleInput('two'); // Auto finishes on last word exact match

    expect(engine.isFinished).toBe(true);
    expect(onComplete).toHaveBeenCalled();
    const session = onComplete.mock.calls[0][0];
    expect(session.completedWordsCount).toBe(undefined); // session has wordsPerMinute
    expect(session.wordsPerMinute).toBeGreaterThanOrEqual(0);
    expect(session.keystrokesPerMinute).toBeGreaterThanOrEqual(0);
    expect(session.wpm).toBeGreaterThanOrEqual(0);
    expect(session.accuracy).toBe(100);

    engine.destroy();
  });

  it('dynamically requests more words in time mode so typist never runs out', () => {
    const moreWordsMock = vi.fn().mockReturnValue(['more', 'words', 'added']);
    const engine = new TypingEngine({
      mode: 'time',
      duration: 30,
      initialWords: Array.from({ length: 16 }, (_, i) => `word${i}`),
      onRequestMoreWords: moreWordsMock,
    });

    // Type through first few words until index >= length - 15 (which is 16 - 15 = 1)
    engine.handleInput('word0 ');
    engine.handleInput('word1 ');

    expect(moreWordsMock).toHaveBeenCalled();
    expect(engine.words.length).toBeGreaterThan(16);

    engine.destroy();
  });

  it('detects keystroke mistakes immediately and caches grapheme metrics on word commit', () => {
    const engine = new TypingEngine({
      mode: 'words',
      initialWords: ['apple', 'banana'],
    });

    // Typing correct initial character
    const res1 = engine.handleInput('a');
    expect(res1.isMatch).toBe(true);
    expect(res1.hasErrorsInWord).toBe(false);

    // Typing wrong second character ('x' instead of 'p')
    const res2 = engine.handleInput('ax');
    expect(res2.isMatch).toBe(false);
    expect(res2.hasErrorsInWord).toBe(true);

    // Commit with mistake
    engine.handleInput('ax ');
    expect(engine.words[0].isCommitted).toBe(true);
    expect(engine.words[0].isCorrect).toBe(false);
    expect(engine.words[0].correctGraphemes).toBe(1);
    expect(engine.words[0].uncorrectedErrors).toBe(4);

    engine.destroy();
  });

  it('correctly compares Indic multi-codepoint grapheme clusters during forward input', () => {
    // "ಕನ್ನಡ": ಕ, ನ್, ನ, ಡ
    const engine = new TypingEngine({
      mode: 'words',
      lang: 'kn',
      initialWords: ['ಕನ್ನಡ'],
    });

    // Type first grapheme 'ಕ'
    const step1 = engine.handleInput('ಕ');
    expect(step1.isMatch).toBe(true);
    expect(step1.hasErrorsInWord).toBe(false);

    // Type second grapheme 'ನ್' (Ka + virama, 2 code units, 1 grapheme)
    const step2 = engine.handleInput('ಕನ್');
    expect(step2.isMatch).toBe(true);
    expect(step2.hasErrorsInWord).toBe(false);

    engine.destroy();
  });

  it('ends active session early on finish() (Escape key trigger) and calculates whatever was typed', () => {
    const onComplete = vi.fn();
    const engine = new TypingEngine({
      mode: 'words',
      initialWords: ['quick', 'brown', 'fox', 'jumps', 'over'],
      onComplete,
    });

    // Type 2 words out of 5
    engine.handleInput('quick ');
    engine.handleInput('brown ');

    expect(engine.hasStarted).toBe(true);
    expect(engine.isFinished).toBe(false);
    expect(engine.completedWordsCount).toBe(2);

    // User presses Escape while typing: finish early
    const result = engine.finish();

    expect(engine.isFinished).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.wpm).toBeGreaterThan(0);
    expect(result.rawWpm).toBeGreaterThan(0);
    expect(result.accuracy).toBe(100);
    expect(result.totalKeystrokes).toBeGreaterThan(0);
    expect(result.elapsedSeconds).toBeGreaterThan(0);

    engine.destroy();
  });

  it('survives empty words, repeated boundary backspaces, zero-keystroke finish, and double destroy', () => {
    const onComplete = vi.fn();
    const engine = new TypingEngine({
      mode: 'words',
      initialWords: [],
      onComplete,
    });

    // Repeated backspaces & input on empty state must not throw
    engine.handleBackspace();
    engine.handleBackspace();
    const resEmpty = engine.handleInput('a');
    expect(resEmpty.isMatch).toBe(true);
    expect(engine.currentWordIndex).toBe(0);

    // Zero-keystroke metrics and immediate finish stay finite
    const m = engine.getMetrics();
    expect(Number.isFinite(m.wpm)).toBe(true);
    expect(Number.isFinite(m.accuracy)).toBe(true);
    const summary = engine.finish();
    expect(Number.isFinite(summary.wpm)).toBe(true);
    expect(Number.isFinite(summary.consistency)).toBe(true);

    // Double destroy is safe
    engine.destroy();
    engine.destroy();
  });
});

