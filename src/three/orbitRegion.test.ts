import { describe, expect, it } from 'vitest';
import { canOrbitAt, contactIsVisible, hasFullCarView } from './orbitRegion';

describe('car gesture regions', () => {
  it('does not activate over reading content when the car is visible below it', () => {
    const sections = [
      { id: 'sec-about', top: -100, bottom: 450 },
      { id: 'sec-contact', top: 450, bottom: 1400 },
    ];
    expect(canOrbitAt(200, sections)).toBe(false);
    expect(canOrbitAt(450, sections)).toBe(true);
    expect(canOrbitAt(600, sections)).toBe(true);
  });

  it('blocks project gestures and gaps even if the active navigation section is stale', () => {
    expect(canOrbitAt(300, [{ id: 'sec-work', top: -4000, bottom: 1600 }])).toBe(false);
    expect(canOrbitAt(300, [])).toBe(false);
    expect(canOrbitAt(300, [{ id: 'sec-intro', top: -900, bottom: 0 }])).toBe(false);
  });
});

describe('full car controls region', () => {
  it('shows controls only when a car section covers the entire viewport', () => {
    expect(hasFullCarView(800, [{ id: 'sec-intro', top: 0, bottom: 800 }])).toBe(true);
    expect(hasFullCarView(800, [{ id: 'sec-contact', top: 0, bottom: 900 }])).toBe(true);
    expect(hasFullCarView(800, [{ id: 'sec-intro', top: -1, bottom: 799 }])).toBe(false);
    expect(hasFullCarView(800, [{ id: 'sec-contact', top: 1, bottom: 901 }])).toBe(false);
    expect(hasFullCarView(800, [{ id: 'sec-work', top: -10, bottom: 900 }])).toBe(false);
    expect(hasFullCarView(800, [{ id: 'sec-contact', top: 0.12, bottom: 800.12 }])).toBe(true);
    expect(hasFullCarView(800, [])).toBe(false);
  });
});

it('reveals the contact car while controls still wait for the full section', () => {
  const sections = [{ id: 'sec-contact', top: 600, bottom: 1400 }];
  expect(contactIsVisible(800, sections)).toBe(true);
  expect(hasFullCarView(800, sections)).toBe(false);
  expect(contactIsVisible(800, [{ id: 'sec-contact', top: 800, bottom: 1600 }])).toBe(false);
});
