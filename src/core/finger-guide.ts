// Santypes Comprehensive Touch-Typing Biomechanics & Finger Guidance Engine
// Pure TypeScript - Zero external dependencies

export type HandSide = 'left' | 'right' | 'thumb';
export type FingerType = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
export type FingerCode = 'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp' | 'thumb';
export type MotionType = 'anchor' | 'reach-up' | 'reach-down' | 'reach-center' | 'reach-outer' | 'reach-far-up' | 'space';

export interface FingerGuidance {
  key: string;
  displayKey: string;
  hand: HandSide;
  handLabel: string;
  finger: FingerType;
  fingerName: string;
  fingerCode: FingerCode;
  fingerColor: string;
  homeKey: string;
  isHomeKey: boolean;
  motionType: MotionType;
  motionLabel: string;
  motionArrow: string;
  instruction: string;
  requiresShift?: boolean;
  shiftHand?: 'left' | 'right';
}

export const FINGER_COLORS: Record<FingerCode, string> = {
  lp: '#f472b6', // Pink (Left Pinky)
  lr: '#a78bfa', // Purple (Left Ring)
  lm: '#60a5fa', // Blue (Left Middle)
  li: '#34d399', // Emerald (Left Index)
  ri: '#fbbf24', // Amber/Yellow (Right Index)
  rm: '#f97316', // Orange (Right Middle)
  rr: '#fb7185', // Rose (Right Ring)
  rp: '#e879f9', // Fuchsia (Right Pinky)
  thumb: '#38bdf8', // Cyan (Thumbs / Space)
};

export const FINGER_NAMES: Record<FingerCode, string> = {
  lp: 'Left Pinky',
  lr: 'Left Ring',
  lm: 'Left Middle',
  li: 'Left Index',
  ri: 'Right Index',
  rm: 'Right Middle',
  rr: 'Right Ring',
  rp: 'Right Pinky',
  thumb: 'Thumb',
};

export const HOME_KEYS: Record<FingerCode, string> = {
  lp: 'A',
  lr: 'S',
  lm: 'D',
  li: 'F',
  ri: 'J',
  rm: 'K',
  rr: 'L',
  rp: ';',
  thumb: 'Space',
};

interface KeyMappingData {
  hand: HandSide;
  finger: FingerType;
  fingerCode: FingerCode;
  homeKey: string;
  motionType: MotionType;
  motionLabel: string;
  motionArrow: string;
  instruction: string;
  requiresShift?: boolean;
  shiftHand?: 'left' | 'right';
}

/**
 * Master Biomechanical QWERTY Finger & Motion Mapping
 */
const KEY_MAP: Record<string, KeyMappingData> = {
  // === HOME ROW ===
  'a': {
    hand: 'left', finger: 'pinky', fingerCode: 'lp', homeKey: 'A',
    motionType: 'anchor', motionLabel: 'Home Anchor', motionArrow: '•',
    instruction: 'Left Pinky — HOME ANCHOR. Rest gently on A. Strike lightly with the fingertip pad.'
  },
  's': {
    hand: 'left', finger: 'ring', fingerCode: 'lr', homeKey: 'S',
    motionType: 'anchor', motionLabel: 'Home Anchor', motionArrow: '•',
    instruction: 'Left Ring Finger — HOME ANCHOR. Rest naturally on S without tension.'
  },
  'd': {
    hand: 'left', finger: 'middle', fingerCode: 'lm', homeKey: 'D',
    motionType: 'anchor', motionLabel: 'Home Anchor', motionArrow: '•',
    instruction: 'Left Middle Finger — HOME ANCHOR. Rest gently on D with fingers curved.'
  },
  'f': {
    hand: 'left', finger: 'index', fingerCode: 'li', homeKey: 'F',
    motionType: 'anchor', motionLabel: 'Home Anchor', motionArrow: '•',
    instruction: 'Left Index Finger — HOME ANCHOR. Feel the raised tactile bump on F to locate without looking.'
  },
  'g': {
    hand: 'left', finger: 'index', fingerCode: 'li', homeKey: 'F',
    motionType: 'reach-center', motionLabel: 'Reach Inward Right', motionArrow: '→',
    instruction: 'Left Index Finger — Reach INWARD to the right from F to tap G, then return immediately to F.'
  },
  'h': {
    hand: 'right', finger: 'index', fingerCode: 'ri', homeKey: 'J',
    motionType: 'reach-center', motionLabel: 'Reach Inward Left', motionArrow: '←',
    instruction: 'Right Index Finger — Reach INWARD to the left from J to tap H, then return immediately to J.'
  },
  'j': {
    hand: 'right', finger: 'index', fingerCode: 'ri', homeKey: 'J',
    motionType: 'anchor', motionLabel: 'Home Anchor', motionArrow: '•',
    instruction: 'Right Index Finger — HOME ANCHOR. Feel the raised tactile bump on J to locate without looking.'
  },
  'k': {
    hand: 'right', finger: 'middle', fingerCode: 'rm', homeKey: 'K',
    motionType: 'anchor', motionLabel: 'Home Anchor', motionArrow: '•',
    instruction: 'Right Middle Finger — HOME ANCHOR. Rest gently on K with wrist elevated.'
  },
  'l': {
    hand: 'right', finger: 'ring', fingerCode: 'rr', homeKey: 'L',
    motionType: 'anchor', motionLabel: 'Home Anchor', motionArrow: '•',
    instruction: 'Right Ring Finger — HOME ANCHOR. Rest naturally on L.'
  },
  ';': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'anchor', motionLabel: 'Home Anchor', motionArrow: '•',
    instruction: 'Right Pinky — HOME ANCHOR. Rest comfortably on semicolon (;).'
  },
  "'": {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-outer', motionLabel: 'Reach Outward Right', motionArrow: '→',
    instruction: 'Right Pinky — Reach OUTWARD right from ; to tap apostrophe (\'), then return home.'
  },

  // === TOP ROW ===
  'q': {
    hand: 'left', finger: 'pinky', fingerCode: 'lp', homeKey: 'A',
    motionType: 'reach-up', motionLabel: 'Reach UP', motionArrow: '↑',
    instruction: 'Left Pinky — Reach straight UP from home A to tap Q, then snap back to A.'
  },
  'w': {
    hand: 'left', finger: 'ring', fingerCode: 'lr', homeKey: 'S',
    motionType: 'reach-up', motionLabel: 'Reach UP', motionArrow: '↑',
    instruction: 'Left Ring Finger — Reach UP from home S to tap W, then snap back to S.'
  },
  'e': {
    hand: 'left', finger: 'middle', fingerCode: 'lm', homeKey: 'D',
    motionType: 'reach-up', motionLabel: 'Reach UP', motionArrow: '↑',
    instruction: 'Left Middle Finger — Reach UP from home D to tap E, then snap back to D.'
  },
  'r': {
    hand: 'left', finger: 'index', fingerCode: 'li', homeKey: 'F',
    motionType: 'reach-up', motionLabel: 'Reach UP', motionArrow: '↑',
    instruction: 'Left Index Finger — Reach UP from home anchor F to tap R, then snap back to F.'
  },
  't': {
    hand: 'left', finger: 'index', fingerCode: 'li', homeKey: 'F',
    motionType: 'reach-center', motionLabel: 'Reach UP & Inward', motionArrow: '↗',
    instruction: 'Left Index Finger — Reach UP and INWARD right from F to tap T, then return to F.'
  },
  'y': {
    hand: 'right', finger: 'index', fingerCode: 'ri', homeKey: 'J',
    motionType: 'reach-center', motionLabel: 'Reach UP & Inward', motionArrow: '↖',
    instruction: 'Right Index Finger — Reach UP and INWARD left from J to tap Y, then return to J.'
  },
  'u': {
    hand: 'right', finger: 'index', fingerCode: 'ri', homeKey: 'J',
    motionType: 'reach-up', motionLabel: 'Reach UP', motionArrow: '↑',
    instruction: 'Right Index Finger — Reach UP from home anchor J to tap U, then snap back to J.'
  },
  'i': {
    hand: 'right', finger: 'middle', fingerCode: 'rm', homeKey: 'K',
    motionType: 'reach-up', motionLabel: 'Reach UP', motionArrow: '↑',
    instruction: 'Right Middle Finger — Reach UP from home K to tap I, then snap back to K.'
  },
  'o': {
    hand: 'right', finger: 'ring', fingerCode: 'rr', homeKey: 'L',
    motionType: 'reach-up', motionLabel: 'Reach UP', motionArrow: '↑',
    instruction: 'Right Ring Finger — Reach UP from home L to tap O, then snap back to L.'
  },
  'p': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-up', motionLabel: 'Reach UP', motionArrow: '↑',
    instruction: 'Right Pinky — Reach UP from home semicolon (;) to tap P, then snap back.'
  },
  '[': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-outer', motionLabel: 'Reach UP & Outward', motionArrow: '↗',
    instruction: 'Right Pinky — Reach UP and OUTWARD to the right from ; to tap [, then return.'
  },
  ']': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-outer', motionLabel: 'Reach UP & Far Outward', motionArrow: '↗',
    instruction: 'Right Pinky — Reach UP and FAR OUTWARD to tap ], then return to ;.'
  },
  '\\': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-outer', motionLabel: 'Reach Far Outward', motionArrow: '→',
    instruction: 'Right Pinky — Reach far outward right to tap backslash (\\), then return.'
  },

  // === BOTTOM ROW ===
  'z': {
    hand: 'left', finger: 'pinky', fingerCode: 'lp', homeKey: 'A',
    motionType: 'reach-down', motionLabel: 'Reach DOWN', motionArrow: '↓',
    instruction: 'Left Pinky — Reach DOWN from home A to tap Z, then snap back to A.'
  },
  'x': {
    hand: 'left', finger: 'ring', fingerCode: 'lr', homeKey: 'S',
    motionType: 'reach-down', motionLabel: 'Reach DOWN', motionArrow: '↓',
    instruction: 'Left Ring Finger — Reach DOWN from home S to tap X, then snap back to S.'
  },
  'c': {
    hand: 'left', finger: 'middle', fingerCode: 'lm', homeKey: 'D',
    motionType: 'reach-down', motionLabel: 'Reach DOWN', motionArrow: '↓',
    instruction: 'Left Middle Finger — Reach DOWN from home D to tap C, then snap back to D.'
  },
  'v': {
    hand: 'left', finger: 'index', fingerCode: 'li', homeKey: 'F',
    motionType: 'reach-down', motionLabel: 'Reach DOWN', motionArrow: '↓',
    instruction: 'Left Index Finger — Reach DOWN from home anchor F to tap V, then snap back to F.'
  },
  'b': {
    hand: 'left', finger: 'index', fingerCode: 'li', homeKey: 'F',
    motionType: 'reach-center', motionLabel: 'Reach DOWN & Inward', motionArrow: '↘',
    instruction: 'Left Index Finger — Reach DOWN and INWARD right from F to tap B, then return to F.'
  },
  'n': {
    hand: 'right', finger: 'index', fingerCode: 'ri', homeKey: 'J',
    motionType: 'reach-center', motionLabel: 'Reach DOWN & Inward', motionArrow: '↙',
    instruction: 'Right Index Finger — Reach DOWN and INWARD left from J to tap N, then return to J.'
  },
  'm': {
    hand: 'right', finger: 'index', fingerCode: 'ri', homeKey: 'J',
    motionType: 'reach-down', motionLabel: 'Reach DOWN', motionArrow: '↓',
    instruction: 'Right Index Finger — Reach DOWN from home anchor J to tap M, then snap back to J.'
  },
  ',': {
    hand: 'right', finger: 'middle', fingerCode: 'rm', homeKey: 'K',
    motionType: 'reach-down', motionLabel: 'Reach DOWN', motionArrow: '↓',
    instruction: 'Right Middle Finger — Reach DOWN from home K to tap comma (,), then snap back to K.'
  },
  '.': {
    hand: 'right', finger: 'ring', fingerCode: 'rr', homeKey: 'L',
    motionType: 'reach-down', motionLabel: 'Reach DOWN', motionArrow: '↓',
    instruction: 'Right Ring Finger — Reach DOWN from home L to tap period (.), then snap back to L.'
  },
  '/': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-down', motionLabel: 'Reach DOWN', motionArrow: '↓',
    instruction: 'Right Pinky — Reach DOWN from home semicolon (;) to tap slash (/), then return.'
  },

  // === NUMBER ROW ===
  '`': {
    hand: 'left', finger: 'pinky', fingerCode: 'lp', homeKey: 'A',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↖',
    instruction: 'Left Pinky — Reach FAR UP left to the backtick (`) key, then return to A.'
  },
  '1': {
    hand: 'left', finger: 'pinky', fingerCode: 'lp', homeKey: 'A',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↑',
    instruction: 'Left Pinky — Reach FAR UP from home A to tap 1, then snap back to A.'
  },
  '2': {
    hand: 'left', finger: 'ring', fingerCode: 'lr', homeKey: 'S',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↑',
    instruction: 'Left Ring Finger — Reach FAR UP from home S to tap 2, then snap back to S.'
  },
  '3': {
    hand: 'left', finger: 'middle', fingerCode: 'lm', homeKey: 'D',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↑',
    instruction: 'Left Middle Finger — Reach FAR UP from home D to tap 3, then snap back to D.'
  },
  '4': {
    hand: 'left', finger: 'index', fingerCode: 'li', homeKey: 'F',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↑',
    instruction: 'Left Index Finger — Reach FAR UP from home F to tap 4, then snap back to F.'
  },
  '5': {
    hand: 'left', finger: 'index', fingerCode: 'li', homeKey: 'F',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP & Inward', motionArrow: '↗',
    instruction: 'Left Index Finger — Reach FAR UP and right from home F to tap 5, then return to F.'
  },
  '6': {
    hand: 'right', finger: 'index', fingerCode: 'ri', homeKey: 'J',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP & Inward', motionArrow: '↖',
    instruction: 'Right Index Finger — Reach FAR UP and left from home J to tap 6, then return to J.'
  },
  '7': {
    hand: 'right', finger: 'index', fingerCode: 'ri', homeKey: 'J',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↑',
    instruction: 'Right Index Finger — Reach FAR UP from home J to tap 7, then snap back to J.'
  },
  '8': {
    hand: 'right', finger: 'middle', fingerCode: 'rm', homeKey: 'K',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↑',
    instruction: 'Right Middle Finger — Reach FAR UP from home K to tap 8, then snap back to K.'
  },
  '9': {
    hand: 'right', finger: 'ring', fingerCode: 'rr', homeKey: 'L',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↑',
    instruction: 'Right Ring Finger — Reach FAR UP from home L to tap 9, then snap back to L.'
  },
  '0': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP', motionArrow: '↑',
    instruction: 'Right Pinky — Reach FAR UP from home ; to tap 0, then snap back.'
  },
  '-': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP & Outward', motionArrow: '↗',
    instruction: 'Right Pinky — Reach FAR UP right from home ; to tap minus (-), then return.'
  },
  '=': {
    hand: 'right', finger: 'pinky', fingerCode: 'rp', homeKey: ';',
    motionType: 'reach-far-up', motionLabel: 'Reach FAR UP & Outward', motionArrow: '↗',
    instruction: 'Right Pinky — Reach FAR UP right to tap equal (=), then return to ;.'
  },

  // === SPACEBAR ===
  ' ': {
    hand: 'thumb', finger: 'thumb', fingerCode: 'thumb', homeKey: 'Space',
    motionType: 'space', motionLabel: 'Resting on Spacebar', motionArrow: '—',
    instruction: 'Either Thumb — Tap the Spacebar lightly with your thumb. Keep fingers resting on home row.'
  },
};

/**
 * Symbol to Lower-Key and Shift Mapping
 */
const SYMBOL_MAP: Record<string, { baseKey: string; shiftHand: 'left' | 'right' }> = {
  '~': { baseKey: '`', shiftHand: 'right' },
  '!': { baseKey: '1', shiftHand: 'right' },
  '@': { baseKey: '2', shiftHand: 'right' },
  '#': { baseKey: '3', shiftHand: 'right' },
  '$': { baseKey: '4', shiftHand: 'right' },
  '%': { baseKey: '5', shiftHand: 'right' },
  '^': { baseKey: '6', shiftHand: 'left' },
  '&': { baseKey: '7', shiftHand: 'left' },
  '*': { baseKey: '8', shiftHand: 'left' },
  '(': { baseKey: '9', shiftHand: 'left' },
  ')': { baseKey: '0', shiftHand: 'left' },
  '_': { baseKey: '-', shiftHand: 'left' },
  '+': { baseKey: '=', shiftHand: 'left' },
  '{': { baseKey: '[', shiftHand: 'left' },
  '}': { baseKey: ']', shiftHand: 'left' },
  '|': { baseKey: '\\', shiftHand: 'left' },
  ':': { baseKey: ';', shiftHand: 'left' },
  '"': { baseKey: "'", shiftHand: 'left' },
  '<': { baseKey: ',', shiftHand: 'left' },
  '>': { baseKey: '.', shiftHand: 'left' },
  '?': { baseKey: '/', shiftHand: 'left' },
};

/**
 * Retrieves comprehensive beginner guidance for any typed character.
 */
export function getFingerGuidance(char: string): FingerGuidance {
  if (!char || typeof char !== 'string' || char.length === 0) {
    return createFallbackGuidance(' ');
  }

  // 1. Exact match in KEY_MAP (lowercase alphanumeric, home row, numbers, space)
  const direct = KEY_MAP[char];
  if (direct) {
    return {
      key: char,
      displayKey: char === ' ' ? 'Space' : char,
      hand: direct.hand,
      handLabel: direct.hand === 'left' ? 'Left Hand' : direct.hand === 'right' ? 'Right Hand' : 'Either Thumb',
      finger: direct.finger,
      fingerName: FINGER_NAMES[direct.fingerCode],
      fingerCode: direct.fingerCode,
      fingerColor: FINGER_COLORS[direct.fingerCode],
      homeKey: direct.homeKey,
      isHomeKey: direct.motionType === 'anchor' || direct.motionType === 'space',
      motionType: direct.motionType,
      motionLabel: direct.motionLabel,
      motionArrow: direct.motionArrow,
      instruction: direct.instruction,
      requiresShift: false,
    };
  }

  // 2. Uppercase Letters (A-Z) -> Requires Opposite Shift Key!
  if (/^[A-Z]$/.test(char)) {
    const lower = char.toLowerCase();
    const base = KEY_MAP[lower] || KEY_MAP['a'];
    // Opposite hand holds shift
    const shiftHand: 'left' | 'right' = base.hand === 'left' ? 'right' : 'left';
    const shiftKeyName = shiftHand === 'left' ? 'Left Shift (Left Pinky)' : 'Right Shift (Right Pinky)';

    return {
      key: char,
      displayKey: char,
      hand: base.hand,
      handLabel: base.hand === 'left' ? 'Left Hand' : 'Right Hand',
      finger: base.finger,
      fingerName: FINGER_NAMES[base.fingerCode],
      fingerCode: base.fingerCode,
      fingerColor: FINGER_COLORS[base.fingerCode],
      homeKey: base.homeKey,
      isHomeKey: false,
      motionType: base.motionType,
      motionLabel: `${base.motionLabel} + Shift`,
      motionArrow: base.motionArrow,
      instruction: `Capital letter: Hold ${shiftKeyName} with opposite hand, tap ${char.toUpperCase()} with ${FINGER_NAMES[base.fingerCode]}, then return.`,
      requiresShift: true,
      shiftHand,
    };
  }

  // 3. Shifted Symbols (~, !, @, #, $, %, ^, &, *, (, ), _, +, {, }, |, :, ", <, >, ?)
  const symbolInfo = SYMBOL_MAP[char];
  if (symbolInfo) {
    const base = KEY_MAP[symbolInfo.baseKey];
    if (base) {
      const shiftKeyName = symbolInfo.shiftHand === 'left' ? 'Left Shift (Left Pinky)' : 'Right Shift (Right Pinky)';
      return {
        key: char,
        displayKey: char,
        hand: base.hand,
        handLabel: base.hand === 'left' ? 'Left Hand' : 'Right Hand',
        finger: base.finger,
        fingerName: FINGER_NAMES[base.fingerCode],
        fingerCode: base.fingerCode,
        fingerColor: FINGER_COLORS[base.fingerCode],
        homeKey: base.homeKey,
        isHomeKey: false,
        motionType: base.motionType,
        motionLabel: `${base.motionLabel} + Shift`,
        motionArrow: base.motionArrow,
        instruction: `Hold ${shiftKeyName} with opposite hand, tap ${char} using ${FINGER_NAMES[base.fingerCode]}, then release.`,
        requiresShift: true,
        shiftHand: symbolInfo.shiftHand,
      };
    }
  }

  // 4. Default Fallback
  return createFallbackGuidance(char);
}

function createFallbackGuidance(char: string): FingerGuidance {
  return {
    key: char,
    displayKey: char === ' ' ? 'Space' : char,
    hand: 'thumb',
    handLabel: 'Either Thumb',
    finger: 'thumb',
    fingerName: 'Thumb',
    fingerCode: 'thumb',
    fingerColor: FINGER_COLORS.thumb,
    homeKey: 'Space',
    isHomeKey: true,
    motionType: 'space',
    motionLabel: 'Resting Position',
    motionArrow: '—',
    instruction: 'Tap lightly with your thumb while keeping hand fingers relaxed over home row.',
    requiresShift: false,
  };
}

/**
 * Returns structured guidance for all keys featured in a curriculum chapter.
 */
export function getChapterGuidance(keys: string[]): FingerGuidance[] {
  if (!keys || keys.length === 0) return [];
  const unique = Array.from(new Set(keys));
  return unique.map(k => getFingerGuidance(k));
}
