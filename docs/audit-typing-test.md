# Comprehensive Audit & Technical Specification: Typing Test Module

> **Target File:** `docs/audit-typing-test.md`  
> **Audited Scope:** Santypes Web Build & Original V1 Reference (`Santypes_v1_0_production.html`)  
> **Prettified V1 Reference:** `v1-pretty.js` (4,779 lines)

---

## 1. Current State of the New Build

### 1.1 Stack, Tooling & Folder Structure
- **Core Runtime:** Pure browser-native Vanilla JavaScript (ES Modules, `"type": "module"` in [`package.json`](../package.json)).
- **Build Tool:** Vite `^5.4.0` (executing via `vite v5.4.21`).
- **Styling Architecture:** Plain Vanilla CSS split into tokens, typography, and component stylesheets:
  - [`src/styles/variables.css`](../src/styles/variables.css): Color systems (Neon Cyan `#00f2fe`, Amber `#f59e0b`, Rose `#f43f5e`, Purple `#8b5cf6`), font definitions (JetBrains Mono, Outfit, Noto Sans Devanagari & Kannada), and themes (`oled`, `dark`, `serika`).
  - [`src/styles/base.css`](../src/styles/base.css): Layout resets, sticky header, pill navigation, toast notifications, keyboard badges (`<kbd>`).
  - [`src/styles/typing.css`](../src/styles/typing.css): Word-stream layout, character status styling (`.correct`, `.incorrect`, `.extra`, `.pending`), smooth hardware-accelerated caret, results split card, and sparkline container.
  - [`src/styles/index.css`](../src/styles/index.css): Master manifest importing variables, base, and typing CSS.
- **Dependencies:**
  - `three: "^0.185.1"` (Installed in `dependencies`, reserved for future 3D arcade games).
  - `vite: "^5.4.0"` (Installed in `devDependencies`).
- **Directory Structure:**
  ```text
  santypes/
  ├── index.html                  # Shell layout (Header, Nav Tabs, Sound/Theme toggles, #app-root)
  ├── 404.html                    # Single-page fallback
  ├── package.json                # Vite + Three.js scripts
  ├── vite.config.js              # Server configuration (port 3000, build outDir: 'dist')
  ├── firebase.json / .firebaserc # Static deployment configuration
  └── src/
      ├── main.js                 # App orchestrator, tab router, sound & theme switchers
      ├── data/
      │   └── corpora.js          # Common words (300), paragraphs, code snippets, Kannada, Hindi, quotes
      ├── engine/
      │   └── typing-engine.js    # TypingEngine class (timer, telemetry, standard WPM & consistency)
      ├── utils/
      │   ├── chart.js            # Dependency-free HTML5 2D Canvas charting (timeline, live wave, distribution)
      │   ├── sound.js            # Web Audio API synthesizers for mechanical click, keypress, and error sounds
      │   └── tactile.js          # Universal CSS transform ripple & active feedback
      └── views/
          ├── typing-test-view.js # Arena view controller, sub-options ribbon, live HUD, results modal
          └── analytics-view.js   # Lifetime performance dashboard, session history, CSV export
  ```

### 1.2 Scripts & Execution Status
- **Scripts:**
  - `npm run dev`: Runs `vite` development server.
  - `npm run build`: Runs `vite build`.
  - `npm run preview`: Runs `vite preview`.
- **Linting & Testing:** None exist. There is no `npm test`, no Vitest/Jest configuration, no ESLint/Prettier script, and no `tsconfig.json` or TypeScript compiler.
- **Build Verification:**
  - `npm run build` executed and passed cleanly with **0 errors**:
    - Transformed 11 modules in 854ms.
    - Generated `dist/index.html` (2.87 kB), `dist/assets/index-CR3o1gdx.css` (22.30 kB), `dist/assets/index-eH0bPRnV.js` (60.99 kB).

### 1.3 What is Already Implemented
1. **Word-Streaming Typing Arena:**
   - Instead of a single static block of text, text is tokenized into word containers (`<div class="word">`) containing individual character spans (`<span class="char">`).
   - Words wrap cleanly into a 3-line viewport with auto-scroll translation (`translate3d(0, -lineDiff, 0)`).
   - Spacebar commits the active word, prevents double-space skipping, and advances the index.
   - Backspacing back to an empty word jumps back to the previous word and restores its typed text.
   - Typing beyond the target word length appends overflow characters with `.char.extra`.
2. **7 Active Modes:**
   - **Time:** 15s, 30s, 60s, 120s (with infinite dynamic stream replenishment `appendWordsToStream` when approaching the end).
   - **Words:** 10, 25, 50, 100 words.
   - **Paragraph:** Short, Medium, Long.
   - **Code:** C, JavaScript, Python, HTML/CSS.
   - **Kannada:** Native Script, Kanglish (Roman transliteration).
   - **Hindi:** Native Devanagari, Hinglish (Roman transliteration).
   - **Quote:** All, Short, Medium, Long (displays author credit banner).
3. **Real-time Live HUD & Waveform:**
   - Displays Remaining/Time, Net WPM, Accuracy, and Instant Burst WPM (keystroke frequency in rolling 1.5s window).
   - Live Canvas Sparkline Waveform updating at 5 Hz with peak velocity indicator.
4. **Mechanical Sound & Tactile Animation:**
   - Procedural Web Audio API synthesizers (no external MP3/WAV assets) with micro-pitch randomized mechanical switches.
   - Tactile button press simulation with hardware-accelerated spring animations.
5. **In-Arena Results Card & Analytics View:**
   - Upon completion, the typing arena swaps to a results card displaying Net WPM, Accuracy, Raw WPM, Consistency (Coefficient of Variation), Total Time, Correct/Incorrect keystrokes, and an interactive Canvas timeline chart.
   - Persists up to 100 sessions to `localStorage["santypes_test_history"]`.
   - Separate Analytics tab provides lifetime aggregates, speed distribution histograms, and CSV downloads.

### 1.4 Half-Finished, Duplicated, or Inconsistent Aspects
1. **Uncommitted Git Deletions:** Git status has 28 deleted files in `js/`, 4 deleted files in `css/`, and `SESSION_LOG.md` unstaged from an earlier refactoring attempt.
2. **Missing 5 Modes from V1:** Missing `story`, `book`, `numbers`, `punctuation`, `mixed`, custom text input, and AI-adaptive weak-key text.
3. **Missing V1 Training Aids:**
   - No Live Virtual Keyboard visualizer with finger color mapping.
   - No Ghost race against previous best runs.
   - No Focus mode (`Ctrl+Shift+F`).
   - No Pomodoro timer bar.
   - No Word-Error mode (`Ctrl+Shift+W`).
   - No 3-2-1 Countdown overlay.
   - No WPM Goal target bar.
   - No Caps Lock warning badge.
   - No Lesson mode integration banner.
   - No Weak-key drills.
   - No Keyboard shortcuts modal (`Ctrl+Shift+?`).
4. **Telemetry Incompleteness:** The new engine only increments `correctChars` and `incorrectChars`. It does not record an `errorMap` (per-character errors), `fingerMap` (per-finger errors), `firstKeyLatency`, or `backspaces`.
5. **No i18n Support:** V1 had foundational internationalization tags (`data-i18n`); the new build is English-only UI.
6. **Plain JS vs TypeScript:** Codebase is `.js` despite modern typing platform ambitions.

---

## 2. V1 Typing Test Page: Behavior Inventory

The original behavior reference is `Santypes_v1_0_production.html`. Its minified script was prettified into `v1-pretty.js`. The corresponding HTML layout is located in section `<section id="test" class="view">`.

### 2.1 The 12 Modes & Configuration
Defined in `#modeSelect` and handled in `pickText(mode, lang)` ([line 2539](v1-pretty.js#L2539)):
1. `time`: Fixed concatenation of 1 paragraph, 1 story, 1 quote, and 1 mixed item from `corpora[lang]`, shuffled. Timed run.
2. `words`: Identical text generation to `time`, but finishes when `test.input.split(/\s+/).length >= test.wordTarget`.
3. `quote`: Random quote chosen via `randomOf(s.quote)`.
4. `paragraph`: Random paragraph chosen via `randomOf(s.paragraph)`.
5. `story`: Narrative prose from `randomOf(s.story)`.
6. `book`: Classic literature excerpts from `randomOf(s.book)`.
7. `code`: Programming language snippets from `randomOf(s.code)`.
8. `numbers`: Number sequences and numerical data from `randomOf(s.numbers)`.
9. `punctuation`: Symbol-heavy text from `randomOf(s.punctuation)`.
10. `mixed`: Combined alphanumeric and punctuation from `randomOf(s.mixed)`.
11. `custom`: Custom text read from `<textarea id="customText">` (revealed when `modeSelect.value === 'custom'`).
12. `ai`: Adaptive text generated by `buildAdaptiveText(lang)` ([line 2574](v1-pretty.js#L2574)).
- **Durations:** 15, 30, 60, 120, 300 seconds (`#durationSelect`).
- **Word Target:** Number input 10–500, default 50 (`#wordTarget`).
- **Languages:** English (`en`), Hindi (`hi`), Kannada (`kn`) (`#languageSelect`).
- **Font Size:** 18px–44px, default 28px (`#fontSizeInput`), syncs to `#settingsFontSize` and persists in `state.settings.fontSize`.

### 2.2 Text Selection & Anti-Repeat Logic
- **`randomOf(array)` ([line 217](v1-pretty.js#L217)):**
  - Generates a cache key: `array.length + ":" + array[0].slice(0, 12)`.
  - Maintains `_recentPicks[key]` storing the last 2 selected indices.
  - Filters available options: `array.map((_, i) => i).filter(i => !_recentPicks[key].includes(i))`.
  - Guarantees no identical snippet is chosen twice in a row.
- **`buildAdaptiveText(lang)` ([line 2574](v1-pretty.js#L2574)):**
  - Calls `computeWeakKeys()` ([line 3121](v1-pretty.js#L3121)) to retrieve the top 5 keys with the highest historical error rate.
  - Takes the first quote from `corpora[lang].quote[0]`.
  - Appends synthetic drill repetitions: `Focus keys: k e y s ... Practice them with calm rhythm and minimal backspacing.`

### 2.3 Input Handling & Typing Surface
- **Hidden Input Diffing:** Uses `<input class="hidden-input" id="hiddenInput">` positioned offscreen at `left: -9999px`.
- **`onInput(e)` ([line 2758](v1-pretty.js#L2758)):**
  - Reads `t = e.target.value`.
  - If `!test.startAt && t.length > 0`: Records `test.startAt = performance.now()`, computes `test.firstKeyLatency = test.startAt - test.startedRequestedAt`, starts 100ms timer via `setInterval(tick, 100)`.
  - Increments `test.keystrokes = t.length + test.backspaces`.
  - If `t.length > s.length` (forward typing): Checks `a = (s === n)` where `s = test.text[e]`, `n = t[e]`.
  - If incorrect: Increments `test.errors++`, `test.errorMap[s.toLowerCase()]++`, `test.fingerMap[fingerForKey(s)]++`.
  - Appends to unused array: `test.timestamps.push({ t, correct, i, expected, typed })`.
  - Triggers UI updates: `flashKey(n, !a)`, `renderTypingText()`, `highlightTargetKeys()`, `sampleMetrics()`, `updateLiveMetrics()`, `drawLiveComboChart()`, `maybeFinish()`, `updateGhost()`.
- **`onKeyDown(e)` ([line 2800](v1-pretty.js#L2800)):**
  - Intercepts `"Backspace"`: Increments `test.backspaces++` and invokes `sampleMetrics()`.
  - Plays audio: If `1 === e.key.length && state.settings.soundEnabled`, calls `beep()`.
  - Caps Lock Warning: Queries `e.getModifierState("CapsLock")` and toggles `.visible` on `<div id="capsWarn">`.

### 2.4 Metrics Calculation & Telemetry
- **`countCorrect(expected, typed)` ([line 2870](v1-pretty.js#L2870)):**
  - Compares `typed[i] === expected[i]` for `0 <= i < typed.length`.
- **`uncorrectedErrors(expected, typed)` ([line 2875](v1-pretty.js#L2875)):**
  - Counts `typed[i] !== expected[i]` divided by 5: `errors / 5`.
- **WPM Formulas:**
  - Elapsed minutes: `e = Math.max(1/60, elapsedMs / 60000)`.
  - **Raw WPM:** `(typed.length / 5) / e`. Clamped `[0, 300]`.
  - **Net WPM:** `((correctChars / 5) - uncorrectedErrors) / e`. Clamped `[0, 300]`.
  - **Accuracy:** `typed.length ? (correctChars / typed.length) * 100 : 100`. Clamped `[0, 100]`.
- **`consistencyFromSeries(series)` ([line 2880](v1-pretty.js#L2880)):**
  - If `series.length < 3`: returns 100%.
  - Calculates mean: `t = avg(series)`.
  - Calculates variance and standard deviation: `stdDev = Math.sqrt(avg(series.map(x => (x - t) ** 2)))`.
  - Formula: `clamp(100 - (3 * stdDev), 10, 100)`.
- **Series Sampling (`sampleMetrics`) ([line 2855](v1-pretty.js#L2855)):**
  - Evaluates current Net WPM and Accuracy, pushes rounded values to `test.speedSeries` and `test.accSeries`.
  - Truncates to last 120 points.
- **Finger Mapping (`fingerForKey`) ([line 3071](v1-pretty.js#L3071)):**
  - Maps alphanumeric characters and punctuation to 8 fingers:
    - Left Hand: Pinky (`q, a, z, 1`), Ring (`w, s, x, 2`), Middle (`e, d, c, 3`), Index (`r, f, v, t, g, b, 4, 5`).
    - Right Hand: Index (`y, h, n, u, j, m, 6, 7`), Middle (`i, k, ,, 8`), Ring (`o, l, ., 9`), Pinky (`p, ;, /, [, ], -, =, 0`).

### 2.5 Finish Conditions, Session Object & Side Effects
- **`maybeFinish()` & `tick()` Finish Triggers:**
  - In `time` mode: `e >= test.duration` in `tick()`.
  - In `words` mode: `test.input.trim().split(/\s+/).filter(Boolean).length >= test.wordTarget`.
  - In other modes: `test.input.length >= test.text.length`.
- **Session Object Shape Saved on Finish (`finishTest`) ([line 2942](v1-pretty.js#L2942)):**
  ```javascript
  {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + "",
    createdAt: new Date().toISOString(),
    mode: test.mode,
    lang: test.lang,
    duration: "words" === test.mode ? 0 : test.duration,
    _chapterId: test._chapterId || null,
    wordTarget: test.wordTarget,
    text: test.text,
    typed: test.input,
    wpm: round2(netWpm),
    rawWpm: round2(rawWpm),
    accuracy: round2(accuracy),
    consistency: round2(consistency),
    errors: test.errors,
    keystrokes: test.keystrokes,
    backspaces: test.backspaces,
    firstKeyLatency: test.firstKeyLatency,
    weakKeys: summarizeWeakKeys(test.errorMap),       // Array of { key, count }
    fingerAnalysis: summarizeFingerMap(test.fingerMap), // Array of { finger, count }
    speedSeries: compressSeries(test.speedSeries),      // Downsampled to 60 points
    accuracySeries: compressSeries(test.accSeries),     // Downsampled to 60 points
  }
  ```
- **Side Effects on Finish:**
  1. `state.sessions.push(session)` (capped at 1,000 entries).
  2. `updateStreak()`: Checks if today is consecutive with previous session day; updates `state.streak.current` and `state.streak.best`.
  3. `awardXp(session)`: Awards base XP (WPM * durationFactor) + accuracy bonus (up to 50 XP) + streak multiplier.
  4. `updateAchievements()`: Checks unlock conditions for 24 distinct badges (e.g. "Speed Demon", "Centurion", "Night Owl").
  5. `persistAccountState()`: Serializes `state` to `localStorage["santypes_state"]`.
  6. `renderLastResult()`, `renderDashboard()`, `updateQuickStats()`, `updateGoalBar()`.
  7. If lesson run (`test._chapterId`): Evaluates target WPM and accuracy, marks chapter completed via `setChapterProgress()`.

### 2.6 Training Aids & Interactive Controls
- **Ghost Race (`updateGhost`) ([line 2885](v1-pretty.js#L2885)):**
  - `getGhostData(mode)` selects the user's historical highest-WPM session in the current mode.
  - Computes ghost character progress: `Math.floor(5 * ghost.wpm * (elapsedSeconds / 60))`.
  - Sets `#ghostBar` width percentage and updates `#ghostText`: `"Ahead of your ghost by X%"` or `"Behind your ghost by X%"`.
- **Live Canvas Chart (`drawLiveComboChart`) ([line 2643](v1-pretty.js#L2643)):**
  - Draws onto 160x180 `<canvas id="liveComboCanvas">`.
  - Renders solid line with gradient fill for Net WPM series and dashed line for Accuracy series.
- **Live Virtual Keyboard (`buildLiveKeyboard`) ([line 3861](v1-pretty.js#L3861)):**
  - Renders 4 rows (`KB_LAYOUT`) under the text arena into `<div id="kbLive">`.
  - Each key gets finger color class: `f-lp`, `f-lr`, `f-lm`, `f-li`, `f-ri`, `f-rm`, `f-rr`, `f-rp`.
  - `highlightTargetKeys(text, index)`: Adds `.target-key` to the next expected key cap.
  - `flashKey(char, isError)`: Triggers `.just-pressed` (160ms) or `.just-error` (400ms) animation.
- **Focus Mode (`toggleFocusMode`) ([line 4220](v1-pretty.js#L4220)):**
  - Toggles `.focus-mode` class on `document.body`.
  - Hides header, side navigation, settings, live stats, and ghost cards via CSS, keeping only the typing surface, live timer, and live combo canvas visible.
- **Pomodoro Timer Bar ([lines 4315–4380](v1-pretty.js#L4315)):**
  - 25m work / 5m break interval timer.
  - Conic-gradient ring (`#pomoRing`) showing percentage elapsed, `#pomoToggleBtn`, `#pomoResetBtn`.
- **Word-Error Mode (`toggleWordErrorMode`) ([line 4409](v1-pretty.js#L4409)):**
  - Toggles `.word-mode` on `#typingText`. Highlights entire current word in red upon a typo instead of just the single character.
- **3-2-1 Countdown (`runCountdown`) ([line 4232](v1-pretty.js#L4232)):**
  - Displays full-screen modal `<div id="countdownOverlay">` with pop animation (`countPop .9s`), counting 3 → 2 → 1 → starts test.
- **Keyboard Shortcuts ([line 3552](v1-pretty.js#L3552)):**
  - `Tab`: Starts test with countdown (or restarts current).
  - `Esc`: Restarts / cancels test; exits Focus Mode; closes shortcuts modal.
  - `Enter`: Swaps to Results view when not in an active test.
  - `Ctrl+Shift+F`: Toggle Focus Mode.
  - `Ctrl+Shift+W`: Toggle Word-Error Mode.
  - `Ctrl+Shift+P`: Toggle Pomodoro Bar.
  - `Ctrl+Shift+?`: Open Keyboard Shortcuts Help Modal.
- **Lesson Mode Banner ([line 2308](v1-pretty.js#L2308)):**
  - Displays `<div id="lessonModeBanner">` with chapter title, target WPM/accuracy badge, "Restart lesson", and "Exit lesson".
- **Weak-Key Drill (`buildWeakKeyDrill`) ([line 4384](v1-pretty.js#L4384)):**
  - Synthesizes 40 pseudo-words mixing home row anchors (`a,s,d,f,j,k,l`) with the user's top weak keys, sets mode to `custom`, and begins a targeted drill.
- **WPM Goal Bar ([lines 94–96](section-test.html#L94)):**
  - User-configurable numeric target (`#wpmGoalInput`). Live width percentage on `<span id="goalBar">` tracks `(liveWpm / goal) * 100`.

---

## 3. Defects and Risks in V1

### 3.1 Defect Confirmations & Technical Root Causes

#### 1. "time" mode text runs out before the timer ends
- **Status:** **CONFIRMED.**
- **Code Reference:** `pickText(e, t)` ([lines 2541–2550](v1-pretty.js#L2541)):
  ```javascript
  if ("time" === e || "words" === e) {
    const e = [s.paragraph, s.story, s.quote, s.mixed]
      .map((e) => (e && e.length ? randomOf(e) : ""))
      .filter(Boolean);
    // Fisher-Yates shuffle
    return e.join(" ") || randomOf(corpora.en.paragraph);
  }
  ```
- **Consequence:** Joins exactly 1 paragraph + 1 story + 1 quote + 1 mixed snippet (~120–180 words total). A typist typing at 100+ WPM on a 120s or 300s test exhausts the entire text string. Once `test.input.length >= test.text.length`, line 2853 triggers `finishTest()` prematurely, truncating the timed session!

#### 2. Words/History labels render "50ws"
- **Status:** **CONFIRMED.**
- **Code References:** [`v1-pretty.js` line 3323](v1-pretty.js#L3323) & [line 3434](v1-pretty.js#L3434):
  ```javascript
  // Line 3323 (renderLastResult):
  `${e.duration || e.wordTarget + "w"}s`

  // Line 3434 (renderHistory):
  `<span class="muted" style="font-size:12px">${t.duration || t.wordTarget + "w"}s</span>`
  ```
- **Consequence:** In `words` mode, `duration` is recorded as `0` (falsy). The expression `t.duration || t.wordTarget + "w"` evaluates to `"50w"`. Concatenating `"s"` produces the bizarre label `"50ws"`.

#### 3. Character-by-character comparison breaks for Indic Scripts (Hindi / Kannada)
- **Status:** **CONFIRMED.**
- **Code References:** `renderTypingText` ([line 2590](v1-pretty.js#L2590)) & `onInput` ([line 2769](v1-pretty.js#L2769)):
  ```javascript
  // DOM split
  s.innerHTML = e.split("").map(e => `<span class="pending">${escapeHtml(e)}</span>`).join("");

  // Input diff
  const s = test.text[e] || "", n = t[e] || "", a = s === n;
  ```
- **Consequences:**
  1. `e.split("")` splits by UTF-16 code units rather than grapheme clusters. Indic scripts utilize base consonants combined with dependent vowel signs (matras, e.g. "ि", "ಾ"), viramas ("्", "್"), and conjuncts (ottu). Wrapping every code unit in an isolated `<span>` severs the rendering engine's OpenType complex script shaping. Matras detach and render onto dotted circles (◌ಿ).
  2. The standard English typing metric "5 chars = 1 word" is invalid for Indic scripts. In Kannada or Hindi, a single word might comprise 4 graphemes but 10–14 Unicode code units, or require multi-key transliteration inputs. Calculating WPM purely as `(totalCodeUnits / 5) / minutes` distorts the typist's actual speed.

#### 4. Per-keystroke timestamps are collected but never used
- **Status:** **CONFIRMED.**
- **Code References:** [`v1-pretty.js` line 2728](v1-pretty.js#L2728) & [line 2783](v1-pretty.js#L2783):
  ```javascript
  // Initialized at 2728:
  timestamps: [],

  // Appended to at 2783:
  test.timestamps.push({ t: performance.now(), correct: a, i: e, expected: s, typed: n });
  ```
- **Consequence:** `test.timestamps` is never read anywhere in the application. It is not passed to charts, not saved in the session object, and not analyzed for rhythm or IKI (inter-key interval). It exists purely as an uncollected memory leak during long sessions.

#### 5. Whole-text re-scan on every keystroke
- **Status:** **CONFIRMED.**
- **Code Reference:** `renderTypingText` ([lines 2596–2620](v1-pretty.js#L2596)):
  ```javascript
  const o = s.children; // Array of ALL character spans
  for (let t = 0; t < o.length; t++) {
    const s = o[t], n = e[t], i = a[t];
    // Compares classes, reassigns className and textContent across ALL characters
  }
  // Then forces layout reflows:
  n.style.transform = `translate(${i.offsetLeft + (e ? i.offsetWidth : 0)}px, ${i.offsetTop}px)`;
  e.scrollTop = Math.max(0, (s - 1) * t);
  ```
- **Consequence:** On a 500-word excerpt (approx. 2,800 characters), typing a single character triggers a loop over all 2,800 DOM elements, updating class names and querying `offsetLeft`/`offsetTop`/`offsetHeight`. This forces immediate synchronous layout recalculations and drops frame rates well below 60fps on standard hardware.

### 3.2 Mobile / Touch, IME, Paste, and Autofill Analysis

1. **Mobile / Touch Scrolling Bug:**
   - The hidden input is styled as `.hidden-input { position: absolute; left: -9999px; opacity: 0; }`.
   - On mobile Safari (iOS) and Chrome (Android), programmatically calling `focus()` on an element positioned at `-9999px` causes the viewport to aggressively snap and scroll horizontally off-screen toward `-9999px`, breaking layout orientation.
2. **IME Composition Breakage:**
   - V1 does not listen for `compositionstart`, `compositionupdate`, or `compositionend`.
   - When typing with an IME (e.g. Japanese, Pinyin, or Indic phonetic IMEs), intermediate composing keystrokes fire `input` events before the glyph is finalized. V1's `onInput` immediately grades incomplete intermediate phonemes against target text, generating bursts of false errors and error beeps.
3. **Unprotected Paste Exploitation:**
   - `<input class="hidden-input">` has no `paste` event handler and lacks `onpaste="return false;"`.
   - Pasting a 1,000-character paragraph into the hidden input triggers `onInput`. Since `t.length > s.length`, V1 inspects only the single last character `t[t.length - 1]`. If the pasted text exceeds `test.text.length`, `maybeFinish()` finishes the test in 0 milliseconds, recording an illegitimate 300+ WPM session.
4. **Browser Autofill & Extensions:**
   - Lacks anti-autofill attributes such as `data-gramm="false"`, `data-lpignore="true"`, `autocapitalize="none"`. Browser password managers and grammar checkers attach overlays to the input, intercepting keystrokes and causing typing latency.

### 3.3 Additional Defects Discovered in V1

1. **Naive String Diffing & Index-Shift Catastrophe:**
   - V1 compares typed characters to target text strictly by character index `t[i] === e[i]`.
   - If a typist accidentally misses a single space or inserts one extra character early in a 100-word test, **every single subsequent character is shifted by 1 index**. As a result, every remaining word is marked red as an error, even if typed with 100% precision.
2. **Infinite Duration in Word Target Mode:**
   - In `words` mode, `test.duration` is `0`. If a typist stops halfway through a test, `tick()` never terminates the session because it checks `e >= test.duration && "words" !== test.mode`. The timer ticks indefinitely until the window is closed.
3. **Web Audio Allocation Leak in `beep()`:**
   - Every keypress invokes `beep()` ([line 2811](v1-pretty.js#L2811)), creating a new audio buffer `e.createBuffer(1, n, e.sampleRate)`, filling a channel array with noise, and instantiating a new `BiquadFilter` and `GainNode`. This generates unnecessary garbage collection pressure at high typing speeds.

---

## 4. Gap Analysis: New Build vs. V1 Requirements

| Feature / Requirement | Original V1 Status | New Build Current Status | Gap / Action Required |
| :--- | :--- | :--- | :--- |
| **Typing Modes** | 12 modes: `time`, `words`, `quote`, `paragraph`, `story`, `book`, `code`, `numbers`, `punctuation`, `mixed`, `custom`, `ai` | 7 modes: `time`, `words`, `paragraph`, `code`, `kannada`, `hindi`, `quote` | Missing 5 modes (`story`, `book`, `numbers`, `punctuation`, `mixed`), `custom`, and `ai` adaptive generator. |
| **Streaming Engine Architecture** | Naive monolithic character diffing (`left: -9999px` input, whole-text re-scan) | Word-by-word streaming tokenization (`<div class="word">`, `.char.extra`, dynamic word replenishment) | **Keep New Build Architecture!** It eliminates V1's index-shift catastrophe and text-exhaustion bugs. |
| **Live HUD** | 3 static text tiles + side panel | 4 HUD tiles (Time, WPM, Acc, Burst) + Canvas Velocity Waveform | New build has superior live HUD; needs WPM Goal bar integration. |
| **Live Keyboard Visualizer** | Full 4-row keyboard with 8-finger color coding, target key highlight, hit/error key flashing | Not implemented | Must port virtual keyboard visualizer with finger mappings and key animations. |
| **Ghost Racer** | Real-time race against personal best in mode (`#ghostBar`, ahead/behind %) | Not implemented | Engine must query best historical session and render ghost progress bar. |
| **Training Aids** | Focus Mode (`Ctrl+Shift+F`), Pomodoro (`Ctrl+Shift+P`), Word-Error Mode (`Ctrl+Shift+W`), 3-2-1 Countdown | None implemented | Port Focus mode, Pomodoro timer bar, word-error mode, and 3-2-1 countdown overlay. |
| **Shortcuts & Hotkeys** | `Tab`, `Esc`, `Enter`, `Ctrl+Shift+F/W/P/?` | `Tab`, `Esc` (restart only), Enter in results | Add missing `Ctrl+Shift+*` bindings and Shortcuts modal. |
| **Telemetry & Metrics** | Net/Raw WPM, Acc, Consistency (CV), `firstKeyLatency`, `backspaces`, `errorMap`, `fingerMap`, 120-pt series | Net/Raw/Burst/Peak WPM, Acc, Consistency (CV), 1-sec history series | Engine must record `firstKeyLatency`, `backspaces`, `errorMap`, and `fingerMap`. |
| **Session Object Schema** | Comprehensive (includes `weakKeys`, `fingerAnalysis`, `firstKeyLatency`, `backspaces`, `_chapterId`) | Simplified (lacks `weakKeys`, `fingerAnalysis`, `firstKeyLatency`, `backspaces`) | Align session object schema so Analytics, Results, and Heatmaps can consume it. |
| **Indic Script Support** | Broken character-by-character split (breaks matras and conjuncts) | Word-level rendering with Kannada & Hindi corpora | Implement `Intl.Segmenter` grapheme cluster awareness so Indic glyphs stay intact. |
| **Lesson Mode Integration** | Lesson banner with target criteria, progress tracking | Disabled navigation tabs, no banner | Add stub listener/renderer for lesson mode chapters. |
| **Security & Input Hygiene** | Offscreen input, no paste block, no grammar/autofill protection | Native hidden input with `onpaste="return false;"` and anti-autofill attributes | Retain new build's sanitized input attributes. |

---

## 5. Proposed Plan: Typing Test Page Only

### 5.1 Architecture: Separation of Concerns
To ensure clean isolation, maintainability, and zero regression, the Typing Test page should be split into **Pure Framework-Free TypeScript Core** (logic, calculations, text generation) and **UI DOM Components**.

```
src/
├── core/                         # 100% Framework-Free Pure TypeScript
│   ├── types.ts                  # Shared data models, Session, Config, Metrics interfaces
│   ├── engine.ts                 # Deterministic Typing Engine (keystroke state machine)
│   ├── metrics.ts                # Pure mathematical calculations (WPM, CV consistency, finger/error map)
│   ├── corpora-generator.ts      # Text selector, anti-repeat ring buffer, procedural text generators
│   └── indic-segmenter.ts        # Intl.Segmenter wrapper for proper Hindi/Kannada grapheme clustering
├── components/                   # DOM / UI Components
│   ├── typing-arena.ts           # Word-stream viewport, caret positioning, dynamic replenishment
│   ├── live-hud.ts               # Top stats bar, goal bar, live velocity canvas sparkline
│   ├── live-keyboard.ts          # Virtual keyboard, 8-finger color mapping, target-key highlighter
│   ├── ghost-racer.ts            # Ghost runner calculations and comparative progress bar
│   ├── pomodoro-bar.ts           # 25m/5m interval ring and session tracker
│   ├── countdown-overlay.ts      # 3-2-1 pop countdown overlay
│   ├── shortcuts-modal.ts        # Hotkey cheatsheet modal (Ctrl+Shift+?)
│   └── results-modal.ts          # End-of-test performance breakdown card
├── views/
│   └── typing-test-view.ts       # Page orchestrator assembling components and binding shortcuts
└── stubs/                        # External contracts for decoupled development
    ├── storage-stub.ts           # LocalStorage wrapper (sessions, ghost lookup, persistence)
    ├── navigation-stub.ts        # View routing triggers (to Results, Analytics, Curriculum)
    ├── curriculum-stub.ts        # Lesson chapter loader and progress reporter
    └── account-stub.ts           # XP, Streak, and Achievement evaluator
```

### 5.2 Pure TypeScript Modules (Zero DOM / Zero Framework Dependencies)

1. **`src/core/types.ts`:**
   - Defines strict interfaces: `TypingMode`, `SessionResult`, `TelemetrySample`, `LiveMetrics`, `TypingEngineConfig`, `FingerName`, `ErrorMap`, `FingerMap`.
2. **`src/core/engine.ts` (`TypingEngine`):**
   - Independent of the DOM. Accepts raw input events (`typeCharacter(char)`, `backspace()`, `space()`).
   - Manages high-resolution timers (`performance.now()`), elapsed time, and duration countdown.
   - Emits structured tick events (`onTick(metrics)`) and completion events (`onComplete(session)`).
   - Handles word-level state: active word index, completed words history, character correctness array.
3. **`src/core/metrics.ts`:**
   - Pure functions:
     - `calculateNetWpm(correctUnits, uncorrectedErrors, elapsedMinutes)`
     - `calculateRawWpm(totalKeystrokes, elapsedMinutes)`
     - `calculateAccuracy(correctUnits, totalKeystrokes)`
     - `calculateConsistency(wpmBuckets)` using standard Coefficient of Variation: $100 \times (1 - \frac{\sigma}{\mu})$.
     - `calculateBurstVelocity(timestamps, windowMs)`
     - `mapErrorToFinger(character)` returning the biomechanical finger assignment.
4. **`src/core/corpora-generator.ts`:**
   - Contains text corpora dictionary and procedural generators for:
     - `story`, `book`, `numbers` (procedural digit sequences), `punctuation` (bracket/symbol drills), `mixed` (alphanumeric combos), `quote`, `paragraph`, `code`.
     - `buildAdaptiveDrill(weakKeys, language)`: Dynamically generates targeted drill text targeting high-error keys.
     - Ring buffer anti-repeat mechanism preventing repetitive snippet selection.
5. **`src/core/indic-segmenter.ts`:**
   - Wraps browser-native `Intl.Segmenter(lang, { granularity: 'grapheme' })`.
   - Ensures Hindi and Kannada text are split by semantic grapheme clusters rather than UTF-16 code units, preventing broken matras and maintaining correct word length ratios.

### 5.3 UI Components (DOM & Styling)
1. **`TypingArenaComponent`:**
   - Word container DOM streaming. Handles horizontal/vertical scroll translation, caret interpolation (`translate3d`), and overflow character rendering.
2. **`LiveKeyboardComponent`:**
   - Renders the QWERTY keyboard layout. Reads current expected character from engine, assigns `.target-key`, and plays `.just-pressed` or `.just-error` animations on key strokes.
3. **`GhostRacerComponent`:**
   - Queries `storageStub.getBestSession(mode)`. Renders user progress bar vs ghost progress bar.
4. **`PomodoroComponent`:**
   - 25m work / 5m break interval timer with SVG/Canvas circular countdown.
5. **`CountdownComponent`:**
   - 3-2-1 visual countdown before test keystroke capture starts.
6. **`ShortcutsManager`:**
   - Global keyboard event delegation (`Tab`, `Esc`, `Ctrl+Shift+F`, `Ctrl+Shift+W`, `Ctrl+Shift+P`, `Ctrl+Shift+?`).

### 5.4 List of Stubs Needed (Decoupling Other Pages)

To build and test the Typing Test page in complete isolation without building the rest of the application yet, the following stubs are defined:

1. **`storage-stub.ts` (Analytics & History Stub):**
   - `saveSession(session: SessionResult): Promise<void>` (writes to `localStorage`).
   - `getBestSession(mode: string): SessionResult | null` (provides ghost race target).
   - `getRecentWeakKeys(limit: number): Array<{ key: string, errorRate: number }>` (provides weak key data for drills).
2. **`navigation-stub.ts` (View Routing Stub):**
   - `navigateTo(view: 'results' | 'analytics' | 'curriculum' | 'arcade', payload?: any): void` (logs route intent or triggers view swap).
3. **`curriculum-stub.ts` (Lesson Mode Stub):**
   - `getActiveLesson(): { id: string, title: string, wpmTarget: number, accTarget: number } | null`
   - `completeLesson(chapterId: string, results: { wpm: number, accuracy: number }): void`
4. **`account-stub.ts` (Gamification & XP Stub):**
   - `awardXp(session: SessionResult): { earnedXp: number, newLevel: number, leveledUp: boolean }`
   - `checkAchievements(session: SessionResult): Array<Achievement>`
   - `updateStreak(): { currentStreak: number, bestStreak: number }`
5. **`settings-stub.ts` (Preferences Stub):**
   - `getSettings(): { soundEnabled: boolean, theme: string, fontSize: number, wpmGoal: number }`
   - `updateSettings(partial: Partial<Settings>): void`

---

## 6. Key Decisions & Questions for You

Before initiating implementation, please confirm your preferences on the following architectural decisions:

1. **TypeScript Migration:**  
   The workspace currently uses plain JavaScript (`.js`) without a `tsconfig.json`. Do you want us to add TypeScript tooling (`typescript`, `@types/node`, `tsconfig.json`) so the core engine and metrics are typed `.ts` files, or do you prefer continuing with modern Vanilla JavaScript with JSDoc types?
2. **Keyboard Layout Standard:**  
   V1 used a standard US QWERTY physical layout for its live visualizer. When Kannada or Hindi is selected, do you want the visual keyboard to stay in English QWERTY (matching phonetic transliteration / InScript key locations), or do you plan to have dedicated layout maps for Indic scripts?
3. **Indic WPM Scoring Model:**  
   In standard English, $1\text{ word} = 5\text{ characters}$. For native Indic scripts (Hindi/Kannada), would you prefer:
   - **Grapheme Cluster metric:** Counting 1 grapheme cluster (e.g. "ರ್ಗಿ") as 1 character unit toward words ($5\text{ graphemes} = 1\text{ word}$).
   - **Space-delimited word count:** Measuring actual whole words completed divided by elapsed time.
   - **Keystroke count:** Measuring raw key inputs.
4. **Page Scope & Layout Priority:**  
   In V1, all features (Typing Surface, Live Keyboard, Live Chart, Ghost Race, Session Details, Pomodoro, Lesson Banner) lived on a single vertically scrolling screen. In the new build, do you want all of these training aids simultaneously visible on the test page (modular grid layout), or should some (like the Live Keyboard and Pomodoro) be collapsible / toggled via ribbons or shortcuts?
5. **Cleanup of Dead Files in Working Directory:**  
   Git status shows 28 old files in `js/` and 4 in `css/` that were deleted on disk but remain unstaged in git. Once we complete our reports, would you like us to stage or remove these dead files cleanly in git?
