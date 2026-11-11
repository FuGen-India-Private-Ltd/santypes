// Santypes Live Virtual Keyboard Component
// QWERTY physical layout with 8-finger color mapping, target-key highlighter, and physical key flash.
// Modular architecture allows future Indic InScript layout definitions.

export interface KeyDefinition {
  label: string;
  code: string;
  finger: string; // 'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp' | 'thumb'
  width?: string; // 'wide-tab' | 'wide-caps' | 'wide-shift' | 'wide-space' | 'wide-back'
}

export const QWERTY_LAYOUT: KeyDefinition[][] = [
  // Row 1 (Number row)
  [
    { label: '`', code: 'Backquote', finger: 'lp' },
    { label: '1', code: 'Digit1', finger: 'lp' },
    { label: '2', code: 'Digit2', finger: 'lr' },
    { label: '3', code: 'Digit3', finger: 'lm' },
    { label: '4', code: 'Digit4', finger: 'li' },
    { label: '5', code: 'Digit5', finger: 'li' },
    { label: '6', code: 'Digit6', finger: 'ri' },
    { label: '7', code: 'Digit7', finger: 'ri' },
    { label: '8', code: 'Digit8', finger: 'rm' },
    { label: '9', code: 'Digit9', finger: 'rr' },
    { label: '0', code: 'Digit0', finger: 'rp' },
    { label: '-', code: 'Minus', finger: 'rp' },
    { label: '=', code: 'Equal', finger: 'rp' },
    { label: 'Backspace', code: 'Backspace', finger: 'rp', width: 'wide-back' },
  ],
  // Row 2 (Tab / QWERTY)
  [
    { label: 'Tab', code: 'Tab', finger: 'lp', width: 'wide-tab' },
    { label: 'q', code: 'KeyQ', finger: 'lp' },
    { label: 'w', code: 'KeyW', finger: 'lr' },
    { label: 'e', code: 'KeyE', finger: 'lm' },
    { label: 'r', code: 'KeyR', finger: 'li' },
    { label: 't', code: 'KeyT', finger: 'li' },
    { label: 'y', code: 'KeyY', finger: 'ri' },
    { label: 'u', code: 'KeyU', finger: 'ri' },
    { label: 'i', code: 'KeyI', finger: 'rm' },
    { label: 'o', code: 'KeyO', finger: 'rr' },
    { label: 'p', code: 'KeyP', finger: 'rp' },
    { label: '[', code: 'BracketLeft', finger: 'rp' },
    { label: ']', code: 'BracketRight', finger: 'rp' },
    { label: '\\', code: 'Backslash', finger: 'rp' },
  ],
  // Row 3 (Home row)
  [
    { label: 'Caps', code: 'CapsLock', finger: 'lp', width: 'wide-caps' },
    { label: 'a', code: 'KeyA', finger: 'lp' },
    { label: 's', code: 'KeyS', finger: 'lr' },
    { label: 'd', code: 'KeyD', finger: 'lm' },
    { label: 'f', code: 'KeyF', finger: 'li' },
    { label: 'g', code: 'KeyG', finger: 'li' },
    { label: 'h', code: 'KeyH', finger: 'ri' },
    { label: 'j', code: 'KeyJ', finger: 'ri' },
    { label: 'k', code: 'KeyK', finger: 'rm' },
    { label: 'l', code: 'KeyL', finger: 'rr' },
    { label: ';', code: 'Semicolon', finger: 'rp' },
    { label: "'", code: 'Quote', finger: 'rp' },
    { label: 'Enter', code: 'Enter', finger: 'rp', width: 'wide-caps' },
  ],
  // Row 4 (Bottom row)
  [
    { label: 'Shift', code: 'ShiftLeft', finger: 'lp', width: 'wide-shift' },
    { label: 'z', code: 'KeyZ', finger: 'lp' },
    { label: 'x', code: 'KeyX', finger: 'lr' },
    { label: 'c', code: 'KeyC', finger: 'lm' },
    { label: 'v', code: 'KeyV', finger: 'li' },
    { label: 'b', code: 'KeyB', finger: 'li' },
    { label: 'n', code: 'KeyN', finger: 'ri' },
    { label: 'm', code: 'KeyM', finger: 'ri' },
    { label: ',', code: 'Comma', finger: 'rm' },
    { label: '.', code: 'Period', finger: 'rr' },
    { label: '/', code: 'Slash', finger: 'rp' },
    { label: 'Shift', code: 'ShiftRight', finger: 'rp', width: 'wide-shift' },
  ],
  // Row 5 (Spacebar)
  [
    { label: 'Space', code: 'Space', finger: 'thumb', width: 'wide-space' },
  ],
];

export class LiveKeyboard {
  private container: HTMLElement;
  private keyElements: Map<string, HTMLElement> = new Map();
  private codeToElement: Map<string, HTMLElement> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  public render(layout: KeyDefinition[][] = QWERTY_LAYOUT): void {
    this.container.innerHTML = '';
    this.keyElements.clear();
    this.codeToElement.clear();

    const keyboardEl = document.createElement('div');
    keyboardEl.className = 'kb-live-board';

    for (const row of layout) {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-live-row';

      for (const def of row) {
        const keyEl = document.createElement('div');
        const widthClass = def.width ? ` ${def.width}` : '';
        keyEl.className = `kb-live-key f-${def.finger}${widthClass}`;
        keyEl.textContent = def.label === ' ' ? 'Space' : def.label;
        keyEl.dataset.code = def.code;
        keyEl.dataset.key = def.label.toLowerCase();

        this.keyElements.set(def.label.toLowerCase(), keyEl);
        this.codeToElement.set(def.code, keyEl);

        rowEl.appendChild(keyEl);
      }
      keyboardEl.appendChild(rowEl);
    }

    this.container.appendChild(keyboardEl);
  }

  /**
   * Highlight next target key.
   * Per Decision 2: for Indic languages (hi, kn), target key highlight is hidden
   * because phonetic composition makes the next physical key unpredictable.
   */
  public highlightTargetKey(expectedChar: string | null, isIndic: boolean = false): void {
    // Clear all target key highlights
    this.container.querySelectorAll('.target-key').forEach(el => el.classList.remove('target-key'));

    if (isIndic || !expectedChar) return;

    const lookup = expectedChar === ' ' ? 'space' : expectedChar.toLowerCase();
    const el = this.keyElements.get(lookup);
    if (el) {
      el.classList.add('target-key');
    }
  }

  /**
   * Flash physical key on keystroke.
   * For Indic languages, flashes by physical KeyboardEvent.code!
   */
  public flashKey(keyOrCode: string, isError: boolean = false): void {
    const el = this.codeToElement.get(keyOrCode) || this.keyElements.get(keyOrCode.toLowerCase());
    if (!el) return;

    el.classList.remove('just-pressed', 'just-error');
    void el.offsetWidth; // Force CSS animation restart
    el.classList.add(isError ? 'just-error' : 'just-pressed');

    setTimeout(() => {
      el.classList.remove('just-pressed', 'just-error');
    }, isError ? 300 : 160);
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'block' : 'none';
  }
}
