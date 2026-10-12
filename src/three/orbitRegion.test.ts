import { describe, expect, it } from 'vitest';
import { canOrbitAt } from './orbitRegion';

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
