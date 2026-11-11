# Santypes Typing Metrics Specification

> **Specification Version:** 2.0  
> **Applicable Modules:** Core Typing Engine ([`src/core/metrics.ts`](file:///d:/projects/santypes/src/core/metrics.ts)), Telemetry, Analytics

---

## 1. Overview & Core Philosophy

Santypes adopts a precision-first, multilingual scoring standard. In traditional typing trainers built exclusively for English prose, the classic assumption is:

$$\text{Standard Word} = 5 \text{ Characters (including spaces)}$$

While this heuristic approximates English word lengths well, it collapses when applied to:
1. **Complex Indic Scripts (Hindi, Kannada):** Where combinations of base consonants, viramas, matras, and conjuncts produce multicode-unit graphemes.
2. **Programming Languages & Code Snippets:** Where syntax, indentation, and symbols differ radically from standard dictionary prose.
3. **Phonetic Transliteration & IMEs:** Where typing keystroke counts do not equal character counts.

To provide exact, comparable, and transparent telemetry across all languages and modes, Santypes computes **three standardized velocity metrics** alongside precision and rhythm telemetry for every session.

---

## 2. Standardized Metrics Formulas

### 2.1 Headline Net WPM (Grapheme-Based)
Headline Net Words Per Minute is the primary competitive rating displayed on leaderboards, results cards, and the live HUD. It measures the net velocity of correctly typed unicode grapheme clusters.

$$\text{Net WPM} = \max\left(0, \frac{\left(\frac{G_{\text{correct}}}{N_{\text{lang}}}\right) - U_{\text{errors}}}{T_{\text{minutes}}}\right)$$

Where:
- $G_{\text{correct}}$: Total count of correctly typed grapheme clusters in completed words.
- $N_{\text{lang}}$: Standardized graphemes-per-word constant defined per language in [`src/core/config.ts`](file:///d:/projects/santypes/src/core/config.ts). Currently $N_{\text{lang}} = 5$ for English, Hindi, and Kannada.
- $U_{\text{errors}}$: Uncorrected error penalty. Computed as $\frac{\text{Uncorrected Error Graphemes}}{N_{\text{lang}}}$.
- $T_{\text{minutes}}$: Elapsed time in minutes, evaluated as $\max\left(\frac{1}{60}, \frac{T_{\text{seconds}}}{60}\right)$.

---

### 2.2 Words Per Minute (`wordsPerMinute`)
A natural language velocity metric measuring completed space-delimited words.

$$\text{wordsPerMinute} = \frac{W_{\text{completed}}}{T_{\text{minutes}}}$$

Where $W_{\text{completed}}$ is the exact count of fully completed whitespace-separated tokens that match the target words with 100% accuracy. Stored on every session for linguistic analysis.

---

### 2.3 Keystrokes Per Minute (`keystrokesPerMinute`)
Measures the physical mechanical input frequency (action velocity) across all keys struck during the test.

$$\text{keystrokesPerMinute} = \frac{K_{\text{total}}}{T_{\text{minutes}}}$$

Where $K_{\text{total}} = K_{\text{characters}} + K_{\text{backspaces}} + K_{\text{spaces}}$.

---

### 2.4 Raw WPM
Measures gross speed without penalties for uncorrected errors:

$$\text{Raw WPM} = \frac{\left(\frac{G_{\text{total}}}{N_{\text{lang}}}\right)}{T_{\text{minutes}}}$$

---

### 2.5 Accuracy
The ratio of correct keystrokes to total attempts:

$$\text{Accuracy (\%)} = \begin{cases} 
100 & \text{if } K_{\text{total}} = 0 \\
\max\left(0, \min\left(100, \frac{K_{\text{correct}}}{K_{\text{total}}} \times 100\right)\right) & \text{if } K_{\text{total}} > 0
\end{cases}$$

---

### 2.6 Consistency Percentage (Coefficient of Variation)
Measures the typist's rhythmic stability across 1-second interval WPM samples. A flat, steady velocity achieves near 100% consistency, whereas irregular bursts with long hesitation pauses drop consistency.

$$\mu = \frac{1}{M}\sum_{i=1}^{M} \text{WPM}_i$$

$$\sigma = \sqrt{\frac{1}{M}\sum_{i=1}^{M} (\text{WPM}_i - \mu)^2}$$

$$\text{Coefficient of Variation (CV)} = \frac{\sigma}{\mu}$$

$$\text{Consistency (\%)} = \begin{cases}
100 & \text{if } M < 2 \text{ or } \mu = 0 \\
\max\left(0, \min\left(100, \text{round}\left(100 \times (1 - \text{CV})\right)\right)\right) & \text{otherwise}
\end{cases}$$

---

### 2.7 Rolling Burst Velocity (Instant WPM)
Used for the real-time Live HUD and Canvas Sparkline Waveform. Evaluates the typing velocity in a high-resolution rolling window of the last 1,500 milliseconds:

$$\text{Burst WPM} = \frac{\left(\frac{K_{1.5\text{s}}}{N_{\text{lang}}}\right)}{\left(\frac{1.5}{60}\right)}$$

---

### 2.8 First-Key Latency
The reaction latency (in milliseconds) from when the text appears or the 3-2-1 countdown ends to the exact moment the very first keystroke is pressed:

$$\text{Latency} = t_{\text{first\_keystroke}} - t_{\text{arena\_ready}}$$

---

## 3. Session Object Schema

Every completed session persists the following data structure:

```typescript
export interface SessionResult {
  id: string;                      // Unique identifier
  completedAt: string;             // ISO 8601 timestamp
  mode: TypingMode;                // 'time' | 'words' | 'quote' | 'paragraph' | 'story' | 'book' | 'code' | 'numbers' | 'punctuation' | 'mixed' | 'custom' | 'ai'
  lang: string;                    // 'en' | 'hi' | 'kn'
  duration: number;                // Configured duration (0 for word target modes)
  wordTarget: number;              // Target word count (0 for time modes)
  wpm: number;                     // Headline Net WPM (Grapheme-based)
  rawWpm: number;                  // Raw WPM
  wordsPerMinute: number;          // Space-delimited completed words / min
  keystrokesPerMinute: number;     // Physical keystrokes / min
  accuracy: number;                // Accuracy percentage (0-100)
  consistency: number;             // Rhythm consistency percentage (0-100)
  burstPeakWpm: number;            // Peak rolling burst speed
  elapsedSeconds: number;          // Total elapsed seconds
  totalKeystrokes: number;         // Total keys pressed
  correctChars: number;            // Correct graphemes/characters
  incorrectChars: number;          // Incorrect graphemes/characters
  backspaces: number;              // Backspace count
  firstKeyLatency: number;         // Latency in ms to first stroke
  weakKeys: Array<{ key: string; count: number }>;        // Aggregated error keys
  fingerAnalysis: Array<{ finger: string; count: number }>; // Finger error counts
  history: Array<{ time: number; wpm: number; rawWpm: number; accuracy: number; errors: number }>;
}
```

---

## 4. Multi-Language Grapheme Cluster Segmentation

To support Hindi and Kannada without OpenType font shaping degradation:
1. Strings are segmented using browser-native `Intl.Segmenter(lang, { granularity: 'grapheme' })`.
2. A single grapheme cluster (e.g. `ಕ` + `್` + `ಷ` = `ಕ್ಷ`) is treated as **one indivisible atomic unit**.
3. In-word DOM rendering nests complete graphemes within single `.char` nodes, ensuring browser font rendering engines shape matras and conjuncts with full fidelity.
