// Santypes Core Typing Engine
// Deterministic keystroke state machine & telemetry collector
// 100% Framework-Free Pure TypeScript

import {
  TypingMode,
  LanguageCode,
  LiveMetrics,
  LiveSample,
  SessionResult,
  TelemetryPoint,
  TypingEngineConfig,
} from './types.ts';
import { getLanguageConfig } from './config.ts';
import {
  calculateNetWpm,
  calculateRawWpm,
  calculateWordsPerMinute,
  calculateKeystrokesPerMinute,
  calculateAccuracy,
  calculateConsistency,
  calculateBurstWpm,
  fingerForKey,
  summarizeWeakKeys,
  summarizeFingerMap,
} from './metrics.ts';
import { segmentGraphemes } from './grapheme.ts';

export interface WordState {
  target: string;
  targetGraphemes: string[];
  typed: string;
  isCommitted: boolean;
  isCorrect: boolean;
  correctGraphemes?: number;
  uncorrectedErrors?: number;
}

export class TypingEngine {
  public mode: TypingMode;
  public lang: LanguageCode;
  public duration: number;
  public wordTarget: number;
  public charsPerWord: number;

  public words: WordState[] = [];
  public currentWordIndex: number = 0;
  public currentTyped: string = '';

  public hasStarted: boolean = false;
  public isFinished: boolean = false;
  public readyAt: number;
  public startTime: number | null = null;
  public endTime: number | null = null;
  public firstKeyLatency: number = 0;

  public totalKeystrokes: number = 0;
  public correctKeystrokes: number = 0;
  public incorrectKeystrokes: number = 0;
  public backspaces: number = 0;
  public completedWordsCount: number = 0;

  public errorMap: Record<string, number> = Object.create(null);
  public fingerMap: Record<string, number> = Object.create(null);

  public keystrokeTimestamps: number[] = [];
  public peakBurstWpm: number = 0;
  public liveSamples: LiveSample[] = [];
  public history: TelemetryPoint[] = [];
  public wpmBuckets: number[] = [];

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private elapsedSeconds: number = 0;
  private remainingSeconds: number = 0;
  private lastSampleTime: number = 0;
  private currentSecondErrors: number = 0;

  private onTick?: (metrics: LiveMetrics) => void;
  private onComplete?: (session: SessionResult) => void;
  private onRequestMoreWords?: (count: number) => string[];

  constructor(config: TypingEngineConfig) {
    this.mode = config.mode;
    this.lang = config.lang || 'en';
    this.duration = config.duration || (this.mode === 'time' ? 30 : 0);
    this.wordTarget = config.wordTarget || (config.initialWords ? config.initialWords.length : 25);

    const langConf = getLanguageConfig(this.lang);
    this.charsPerWord = config.charsPerWord || langConf.charsPerWord;

    this.onTick = config.onTick;
    this.onComplete = config.onComplete;
    this.onRequestMoreWords = config.onRequestMoreWords;

    this.readyAt = performance.now();
    this.remainingSeconds = this.duration;

    this.setInitialWords(config.initialWords || []);
  }

  public setInitialWords(wordStrings: string[]): void {
    this.words = wordStrings.map(w => ({
      target: w,
      targetGraphemes: segmentGraphemes(w, this.lang),
      typed: '',
      isCommitted: false,
      isCorrect: false,
    }));
  }

  public appendWords(newWordStrings: string[]): void {
    for (const w of newWordStrings) {
      this.words.push({
        target: w,
        targetGraphemes: segmentGraphemes(w, this.lang),
        typed: '',
        isCommitted: false,
        isCorrect: false,
      });
    }
  }

  public start(): void {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.startTime = performance.now();
    this.firstKeyLatency = Math.max(0, Math.round(this.startTime - this.readyAt));

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 100);
  }

  /**
   * Handle forward typing inside the active word.
   */
  public handleInput(typedValue: string): { isMatch: boolean; hasErrorsInWord: boolean } {
    if (this.isFinished) return { isMatch: true, hasErrorsInWord: false };
    if (!this.hasStarted) this.start();

    // Check if space was typed to commit word
    if (typedValue.endsWith(' ')) {
      const trimmed = typedValue.slice(0, -1);
      const activeWord = this.words[this.currentWordIndex];
      const isCorrect = activeWord ? trimmed === activeWord.target : false;
      this.commitActiveWord(trimmed);
      return { isMatch: isCorrect, hasErrorsInWord: !isCorrect };
    }

    const prevLen = this.currentTyped.length;
    const newLen = typedValue.length;
    const prevGraphemes = segmentGraphemes(this.currentTyped, this.lang);
    const typedGraphemes = segmentGraphemes(typedValue, this.lang);
    this.currentTyped = typedValue;

    const activeWord = this.words[this.currentWordIndex];
    if (!activeWord) return { isMatch: true, hasErrorsInWord: false };

    let lastKeystrokeMatch = true;

    if (newLen > prevLen) {
      // Keystroke(s) typed forward
      const addedCount = newLen - prevLen;
      this.totalKeystrokes += addedCount;
      const targetGraphemes = activeWord.targetGraphemes;

      for (let i = prevGraphemes.length; i < typedGraphemes.length; i++) {
        const expected = targetGraphemes[i];
        const typed = typedGraphemes[i] || '';
        const isMatch = expected !== undefined && typed === expected;

        if (isMatch) {
          this.correctKeystrokes++;
        } else {
          lastKeystrokeMatch = false;
          this.incorrectKeystrokes++;
          this.currentSecondErrors++;
          if (expected) {
            const charKey = expected.toLowerCase();
            this.errorMap[charKey] = (this.errorMap[charKey] || 0) + 1;
            const finger = fingerForKey(expected);
            this.fingerMap[finger] = (this.fingerMap[finger] || 0) + 1;
          }
        }
      }
      this.recordKeystrokeTimestamp();
    }

    // Auto-finish on final word in non-time modes as soon as exact word is completed
    if (
      this.mode !== 'time' &&
      this.currentWordIndex === this.words.length - 1 &&
      this.currentTyped === activeWord.target
    ) {
      this.commitActiveWord(this.currentTyped);
    }

    const hasErrorsInWord = !activeWord.target.startsWith(typedValue);
    return { isMatch: lastKeystrokeMatch, hasErrorsInWord };
  }

  public handleBackspace(): void {
    if (this.isFinished) return;
    this.backspaces++;
    this.totalKeystrokes++;
    this.recordKeystrokeTimestamp();

    if (this.currentTyped.length === 0 && this.currentWordIndex > 0) {
      // Step back to previous word
      this.currentWordIndex--;
      const prevWord = this.words[this.currentWordIndex];
      this.currentTyped = prevWord.typed;
      prevWord.isCommitted = false;
      if (prevWord.isCorrect) {
        this.completedWordsCount = Math.max(0, this.completedWordsCount - 1);
      }
    }
  }

  private commitActiveWord(finalTyped: string): void {
    // Avoid double-space skipping on empty input
    if (finalTyped.length === 0) {
      this.currentTyped = '';
      return;
    }

    const activeWord = this.words[this.currentWordIndex];
    if (!activeWord) return;

    activeWord.typed = finalTyped;
    activeWord.isCommitted = true;
    activeWord.isCorrect = finalTyped === activeWord.target;

    const targetG = activeWord.targetGraphemes;
    const typedG = segmentGraphemes(finalTyped, this.lang);
    let wordCorrect = 0;
    let wordUncorrected = 0;
    for (let j = 0; j < targetG.length; j++) {
      if (j < typedG.length && typedG[j] === targetG[j]) {
        wordCorrect++;
      } else {
        wordUncorrected++;
      }
    }
    activeWord.correctGraphemes = wordCorrect;
    activeWord.uncorrectedErrors = wordUncorrected;

    // Space key stroke
    this.totalKeystrokes++;
    if (activeWord.isCorrect) {
      this.correctKeystrokes++;
      this.completedWordsCount++;
    } else {
      this.incorrectKeystrokes++;
      this.currentSecondErrors++;
    }
    this.recordKeystrokeTimestamp();

    this.currentWordIndex++;
    this.currentTyped = '';

    // In time mode, replenish stream when typist nears the end
    if (this.mode === 'time' && this.currentWordIndex >= this.words.length - 15) {
      if (this.onRequestMoreWords) {
        const more = this.onRequestMoreWords(40);
        this.appendWords(more);
      }
    }

    // Completion in non-time mode
    if (this.mode !== 'time' && this.currentWordIndex >= this.words.length) {
      this.finish();
    }
  }

  private recordKeystrokeTimestamp(): void {
    const now = performance.now();
    this.keystrokeTimestamps.push(now);

    // Prune timestamps older than 3 seconds
    if (this.keystrokeTimestamps.length > 80) {
      const cutoff = now - 3000;
      this.keystrokeTimestamps = this.keystrokeTimestamps.filter(t => t >= cutoff);
    }
  }

  public tick(): void {
    if (!this.hasStarted || this.isFinished) return;

    const now = performance.now();
    this.elapsedSeconds = (now - (this.startTime || now)) / 1000;

    if (this.mode === 'time') {
      this.remainingSeconds = Math.max(0, this.duration - this.elapsedSeconds);
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.finish();
        return;
      }
    }

    const metrics = this.getMetrics();

    // High resolution live sample for velocity wave every 200ms
    if (this.elapsedSeconds - this.lastSampleTime >= 0.2) {
      this.lastSampleTime = this.elapsedSeconds;
      this.liveSamples.push({
        t: Math.round(this.elapsedSeconds * 10) / 10,
        wpm: metrics.wpm,
        burst: metrics.burstWpm,
      });
      if (this.liveSamples.length > 150) {
        this.liveSamples.shift();
      }
    }

    // 1-second interval sample for history and consistency
    const currentSecond = Math.floor(this.elapsedSeconds);
    if (currentSecond > this.wpmBuckets.length && this.elapsedSeconds >= 1) {
      this.wpmBuckets.push(metrics.wpm);
      this.history.push({
        time: currentSecond,
        wpm: metrics.wpm,
        rawWpm: metrics.rawWpm,
        accuracy: metrics.accuracy,
        errors: this.currentSecondErrors,
      });
      this.currentSecondErrors = 0;
    }

    if (this.onTick) {
      this.onTick(metrics);
    }
  }

  public getMetrics(): LiveMetrics {
    const elapsedMinutes = Math.max(1 / 60, (this.elapsedSeconds || 0.001) / 60);

    // Count correct graphemes across committed words + current word
    let correctGraphemes = 0;
    let uncorrectedErrors = 0;

    for (let i = 0; i <= this.currentWordIndex && i < this.words.length; i++) {
      const w = this.words[i];
      if (w.isCommitted) {
        correctGraphemes += (w.correctGraphemes || 0);
        uncorrectedErrors += (w.uncorrectedErrors || 0);
      } else if (i === this.currentWordIndex) {
        const targetG = w.targetGraphemes;
        const typedG = segmentGraphemes(this.currentTyped, this.lang);
        for (let j = 0; j < typedG.length; j++) {
          if (j < targetG.length && typedG[j] === targetG[j]) {
            correctGraphemes++;
          } else {
            uncorrectedErrors++;
          }
        }
      }
    }

    const netWpm = calculateNetWpm(correctGraphemes, uncorrectedErrors, elapsedMinutes, this.charsPerWord);
    const rawWpm = calculateRawWpm(this.totalKeystrokes, elapsedMinutes, this.charsPerWord);
    const wordsPerMinute = calculateWordsPerMinute(this.completedWordsCount, elapsedMinutes);
    const keystrokesPerMinute = calculateKeystrokesPerMinute(this.totalKeystrokes, elapsedMinutes);
    const accuracy = calculateAccuracy(this.correctKeystrokes, this.totalKeystrokes);
    const consistency = calculateConsistency(this.wpmBuckets);

    // Instant burst velocity in last 1.5s
    const now = performance.now();
    const recentStrokes = this.keystrokeTimestamps.filter(t => now - t <= 1500).length;
    const burstWpm = calculateBurstWpm(recentStrokes, 1.5, this.charsPerWord);
    if (burstWpm > this.peakBurstWpm) {
      this.peakBurstWpm = burstWpm;
    }

    return {
      wpm: netWpm,
      rawWpm,
      wordsPerMinute,
      keystrokesPerMinute,
      accuracy,
      consistency,
      burstWpm,
      peakBurstWpm: this.peakBurstWpm,
      elapsedSeconds: Math.round(this.elapsedSeconds * 10) / 10,
      remainingSeconds: this.mode === 'time' ? Math.max(0, Math.ceil(this.remainingSeconds)) : 0,
      correctChars: correctGraphemes,
      incorrectChars: uncorrectedErrors,
      totalKeystrokes: this.totalKeystrokes,
      backspaces: this.backspaces,
      completedWordsCount: this.completedWordsCount,
      liveSamples: this.liveSamples,
    };
  }

  public finish(): SessionResult {
    if (this.isFinished) return this.buildSessionResult();
    this.isFinished = true;
    this.endTime = performance.now();
    if (this.startTime) {
      this.elapsedSeconds = Math.max(0.1, (this.endTime - this.startTime) / 1000);
    }
    this.remainingSeconds = 0;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const session = this.buildSessionResult();

    if (this.onComplete) {
      this.onComplete(session);
    }
    return session;
  }

  private buildSessionResult(): SessionResult {
    const finalMetrics = this.getMetrics();
    const finalSeconds = Math.max(1, Math.round(this.elapsedSeconds * 10) / 10);

    if (this.wpmBuckets.length === 0 && finalMetrics.wpm > 0) {
      this.wpmBuckets.push(finalMetrics.wpm);
    }

    // Ensure final point is in history
    if (this.history.length === 0) {
      this.history.push({
        time: Math.ceil(finalSeconds),
        wpm: finalMetrics.wpm,
        rawWpm: finalMetrics.rawWpm,
        accuracy: finalMetrics.accuracy,
        errors: finalMetrics.incorrectChars,
      });
    }

    return {
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      completedAt: new Date().toISOString(),
      mode: this.mode,
      lang: this.lang,
      duration: this.duration,
      wordTarget: this.wordTarget,
      wpm: finalMetrics.wpm,
      rawWpm: finalMetrics.rawWpm,
      wordsPerMinute: finalMetrics.wordsPerMinute,
      keystrokesPerMinute: finalMetrics.keystrokesPerMinute,
      accuracy: finalMetrics.accuracy,
      consistency: finalMetrics.consistency,
      burstPeakWpm: this.peakBurstWpm,
      elapsedSeconds: finalSeconds,
      totalKeystrokes: this.totalKeystrokes,
      correctChars: finalMetrics.correctChars,
      incorrectChars: finalMetrics.incorrectChars,
      backspaces: this.backspaces,
      firstKeyLatency: this.firstKeyLatency,
      weakKeys: summarizeWeakKeys(this.errorMap, 8),
      fingerAnalysis: summarizeFingerMap(this.fingerMap),
      history: this.history,
    };
  }

  public destroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isFinished = true;
  }
}
