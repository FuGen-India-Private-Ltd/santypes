import { describe, it, expect, beforeEach } from 'vitest';
import { HandsVisualizer } from '../src/components/hands-visualizer.ts';

interface MockDomElement {
  tagName: string;
  children: MockDomElement[];
  innerHTML: string;
  textContent: string;
  dataset: Record<string, string>;
  style: {
    setProperty: (k: string, v: string) => void;
    getPropertyValue: (k: string) => string;
  };
  classList: {
    add: (...cls: string[]) => void;
    remove: (...cls: string[]) => void;
    contains: (c: string) => boolean;
    toggle: (c: string, force?: boolean) => void;
  };
  appendChild: (child: MockDomElement) => MockDomElement;
  remove: () => void;
  querySelector: (selector: string) => MockDomElement;
  querySelectorAll: (selector: string) => MockDomElement[];
  addEventListener: (ev: string, fn: () => void) => void;
}

// Lightweight DOM mock for Node runner
function createMockElement(tag: string = 'div'): MockDomElement {
  const children: MockDomElement[] = [];
  const classListSet = new Set<string>();
  const dataset: Record<string, string> = {};
  const styleProps: Record<string, string> = {};

  const el: MockDomElement = {
    tagName: tag.toUpperCase(),
    children,
    innerHTML: '',
    textContent: '',
    dataset,
    style: {
      setProperty: (k: string, v: string) => { styleProps[k] = v; },
      getPropertyValue: (k: string) => styleProps[k] || '',
    },
    classList: {
      add: (...cls: string[]) => cls.forEach(c => classListSet.add(c)),
      remove: (...cls: string[]) => cls.forEach(c => classListSet.delete(c)),
      contains: (c: string) => classListSet.has(c),
      toggle: (c: string, force?: boolean) => {
        if (force === true) classListSet.add(c);
        else if (force === false) classListSet.delete(c);
        else if (classListSet.has(c)) classListSet.delete(c);
        else classListSet.add(c);
      },
    },
    appendChild: (child: MockDomElement) => {
      children.push(child);
      return child;
    },
    remove: () => {},
    querySelector: (selector: string) => {
      // Basic mock lookup for motion indicators and hand classes
      if (selector.includes('finger-motion-indicator')) {
        return createMockElement('div');
      }
      return createMockElement('div');
    },
    querySelectorAll: () => {
      return children;
    },
    addEventListener: () => {},
  };
  return el;
}

(globalThis as unknown as { document: unknown }).document = {
  createElement: (tag: string) => createMockElement(tag),
  body: createMockElement('body'),
  querySelectorAll: () => [],
};

describe('HandsVisualizer Component in Headless Environment', () => {
  let mockContainer: MockDomElement;

  beforeEach(() => {
    mockContainer = createMockElement('div');
  });

  it('instantiates HandsVisualizer and updates target finger', () => {
    const visualizer = new HandsVisualizer(mockContainer as unknown as HTMLElement, { showCoachingStrip: true });
    expect(visualizer).toBeDefined();

    visualizer.update('r');
    expect(visualizer.getActiveFinger()).toBe('li');

    const guidance = visualizer.getCurrentGuidance();
    expect(guidance?.fingerName).toBe('Left Index');
    expect(guidance?.homeKey).toBe('F');
    expect(guidance?.motionType).toBe('reach-up');
    expect(guidance?.motionArrow).toBe('↑');
  });

  it('updates target for right hand home bump key J', () => {
    const visualizer = new HandsVisualizer(mockContainer as unknown as HTMLElement);
    visualizer.update('j');
    expect(visualizer.getActiveFinger()).toBe('ri');

    const guidance = visualizer.getCurrentGuidance();
    expect(guidance?.fingerName).toBe('Right Index');
    expect(guidance?.isHomeKey).toBe(true);
    expect(guidance?.instruction).toContain('tactile bump');
  });

  it('clears active finger cleanly', () => {
    const visualizer = new HandsVisualizer(mockContainer as unknown as HTMLElement);
    visualizer.update('m');
    expect(visualizer.getActiveFinger()).toBe('ri');

    visualizer.clearActive();
    expect(visualizer.getActiveFinger()).toBeNull();
    expect(visualizer.getCurrentGuidance()).toBeNull();
  });
});
