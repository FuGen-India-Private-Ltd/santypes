// Santypes Core Type Definitions
// 100% Framework-Free Pure TypeScript

export type TypingMode =
  | 'time'
  | 'words'
  | 'quote'
  | 'paragraph'
  | 'story'
  | 'book'
  | 'code'
  | 'numbers'
  | 'punctuation'
  | 'mixed'
  | 'custom'
  | 'ai';

export type LanguageCode = 'en' | 'hi' | 'kn';

export type FingerName =
  | 'L pinky'
  | 'L ring'
  | 'L middle'
  | 'L index'
  | 'R index'
  | 'R middle'
  | 'R ring'
  | 'R pinky'
  | 'Thumb / Other';

export interface LanguageConfig {
  code: LanguageCode;
  label: string;
  nativeName: string;
  charsPerWord: number; // Configurable constant N (default 5)
  isIndic: boolean;
}

export interface TelemetryPoint {
  time: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
}

export interface LiveSample {
  t: number;
  wpm: number;
  burst: number;
}

export interface LiveMetrics {
  wpm: number;
  rawWpm: number;
  wordsPerMinute: number;
  keystrokesPerMinute: number;
  accuracy: number;
  consistency: number;
  burstWpm: number;
  peakBurstWpm: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  correctChars: number;
  incorrectChars: number;
  totalKeystrokes: number;
  backspaces: number;
  completedWordsCount: number;
  liveSamples: LiveSample[];
}

export interface SessionResult {
  id: string;
  completedAt: string;
  mode: TypingMode;
  lang: LanguageCode;
  duration: number;
  wordTarget: number;
  wpm: number;
  rawWpm: number;
  wordsPerMinute: number;
  keystrokesPerMinute: number;
  accuracy: number;
  consistency: number;
  burstPeakWpm: number;
  elapsedSeconds: number;
  totalKeystrokes: number;
  correctChars: number;
  incorrectChars: number;
  backspaces: number;
  firstKeyLatency: number;
  weakKeys: Array<{ key: string; count: number }>;
  fingerAnalysis: Array<{ finger: FingerName; count: number }>;
  history: TelemetryPoint[];
  _chapterId?: string | null;
}

export interface TypingEngineConfig {
  mode: TypingMode;
  lang?: LanguageCode;
  duration?: number;
  wordTarget?: number;
  initialWords: string[];
  charsPerWord?: number;
  onTick?: (metrics: LiveMetrics) => void;
  onComplete?: (session: SessionResult) => void;
  onRequestMoreWords?: (count: number) => string[];
}
