// Santypes Precision Typing Engine
// Deterministic keystroke tracking, timer management, and standard WPM calculations

export class TypingEngine {
  constructor(config = {}) {
    this.targetText = config.targetText || "";
    this.mode = config.mode || "time"; // "time" | "words" | "quote"
    this.duration = config.duration || 30; // seconds for time mode
    this.wordTarget = config.wordTarget || 25; // word count for words mode
    
    this.onTick = config.onTick || null;
    this.onComplete = config.onComplete || null;

    this.startTime = null;
    this.endTime = null;
    this.hasStarted = false;
    this.isFinished = false;

    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.remainingSeconds = this.duration;

    // Keystroke telemetry
    this.totalKeystrokes = 0;
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.currentSecondErrors = 0;
    this.history = []; // Array of { time, wpm, rawWpm, accuracy, errors } recorded every second
    this.wpmBuckets = []; // Per-second net WPM for consistency calculation

    // Real-time live telemetry
    this.keystrokeTimestamps = [];
    this.peakBurstWpm = 0;
    this.liveSamples = []; // Array of { t, wpm, burst } sampled dynamically
    this.lastSampleTime = 0;
  }

  // Call on very first keystroke
  start() {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.startTime = performance.now();

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 100);
  }

  tick() {
    if (!this.hasStarted || this.isFinished) return;

    const now = performance.now();
    this.elapsedSeconds = (now - this.startTime) / 1000;

    if (this.mode === "time") {
      this.remainingSeconds = Math.max(0, this.duration - this.elapsedSeconds);
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.finish();
        return;
      }
    }

    const metrics = this.getMetrics();

    // Record high-resolution sample for live graph every 200ms
    if (this.elapsedSeconds - this.lastSampleTime >= 0.2) {
      this.lastSampleTime = this.elapsedSeconds;
      this.liveSamples.push({
        t: Math.round(this.elapsedSeconds * 10) / 10,
        wpm: metrics.wpm,
        burst: metrics.burstWpm,
      });
      // Cap at 150 points for performance
      if (this.liveSamples.length > 150) {
        this.liveSamples.shift();
      }
    }

    // Record 1-second sample if a full second has passed
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
      this.onTick({
        ...metrics,
        liveSamples: this.liveSamples,
      });
    }
  }

  recordKeystroke(isCorrect) {
    if (!this.hasStarted) {
      this.start();
    }

    const now = performance.now();
    this.keystrokeTimestamps.push(now);

    this.totalKeystrokes++;
    if (isCorrect) {
      this.correctChars++;
    } else {
      this.incorrectChars++;
      this.currentSecondErrors++;
    }
  }

  // Calculate standard typing metrics + live burst velocity
  getMetrics() {
    const elapsedMinutes = Math.max(0.001, (this.elapsedSeconds || 0.001) / 60);

    // Standard formula: 5 characters = 1 word
    const rawWpm = Math.round((this.totalKeystrokes / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round((this.correctChars / 5) / elapsedMinutes));
    const accuracy = this.totalKeystrokes > 0
      ? Math.round((this.correctChars / this.totalKeystrokes) * 100)
      : 100;

    // Instant Burst WPM calculated across recent keystrokes in last 1.5s
    const now = performance.now();
    const recentStrokes = this.keystrokeTimestamps.filter(t => now - t <= 1500).length;
    const burstWpm = Math.round((recentStrokes / 5) / (1.5 / 60));
    if (burstWpm > this.peakBurstWpm) {
      this.peakBurstWpm = burstWpm;
    }

    return {
      wpm: netWpm,
      rawWpm: rawWpm,
      burstWpm: burstWpm,
      peakBurstWpm: this.peakBurstWpm,
      accuracy: accuracy,
      elapsedSeconds: Math.round(this.elapsedSeconds * 10) / 10,
      remainingSeconds: this.isFinished ? 0 : Math.max(0, Math.ceil(this.remainingSeconds)),
      correctChars: this.correctChars,
      incorrectChars: this.incorrectChars,
      totalKeystrokes: this.totalKeystrokes,
    };
  }

  calculateConsistency() {
    if (this.wpmBuckets.length < 2) return 100;

    const mean = this.wpmBuckets.reduce((a, b) => a + b, 0) / this.wpmBuckets.length;
    if (mean === 0) return 100;

    const variance = this.wpmBuckets.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / this.wpmBuckets.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Consistency % = max(0, 100 - (CV * 100))
    return Math.round(Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100))));
  }

  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.endTime = performance.now();
    this.remainingSeconds = 0;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const finalMetrics = this.getMetrics();
    const finalSeconds = Math.max(1, Math.round(this.elapsedSeconds * 10) / 10);

    // Ensure final data point is captured in history for graphs
    if (this.history.length === 0) {
      this.history.push({
        time: Math.ceil(finalSeconds),
        wpm: finalMetrics.wpm,
        rawWpm: finalMetrics.rawWpm,
        accuracy: finalMetrics.accuracy,
        errors: this.incorrectChars,
      });
    } else {
      const lastPoint = this.history[this.history.length - 1];
      if (lastPoint.time < Math.floor(finalSeconds)) {
        this.history.push({
          time: Math.ceil(finalSeconds),
          wpm: finalMetrics.wpm,
          rawWpm: finalMetrics.rawWpm,
          accuracy: finalMetrics.accuracy,
          errors: this.currentSecondErrors,
        });
      }
    }

    const peakWpm = this.history.reduce((max, pt) => Math.max(max, pt.wpm), finalMetrics.wpm);
    const avgWpm = this.history.length > 0
      ? Math.round(this.history.reduce((sum, pt) => sum + pt.wpm, 0) / this.history.length)
      : finalMetrics.wpm;

    const summary = {
      ...finalMetrics,
      peakWpm,
      avgWpm,
      consistency: this.calculateConsistency(),
      mode: this.mode,
      duration: this.duration,
      wordTarget: this.wordTarget,
      history: this.history,
      completedAt: new Date().toISOString(),
    };

    if (this.onComplete) {
      this.onComplete(summary);
    }

    return summary;
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isFinished = true;
  }
}
