import { statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARS, KEYFRAMES, SECTION_IDS, THEMES } from './config';

const modelPath = (file: string) => new URL(`../public/models/${file}`, import.meta.url);

// The three cars a first-time visitor downloads: the default plus the two Car.tsx prefetches.
const arrivalCars = [CARS[0], CARS[1], CARS[CARS.length - 1]];
const ARRIVAL_BUDGET_BYTES = 3.2 * 1024 * 1024;

describe('camera keyframes', () => {
  it('has exactly one per section, so the tour reaches the last one', () => {
    expect(KEYFRAMES).toHaveLength(SECTION_IDS.length);
  });

  it('keeps every pose above the floor and framed on the car', () => {
    for (const kf of KEYFRAMES) {
      expect(kf.distance).toBeGreaterThan(0);
      expect(Math.sin(kf.elevation) * kf.distance + kf.targetY).toBeGreaterThan(0);
    }
  });
});

describe('CARS', () => {
  it('ships a model file for every entry', () => {
    for (const car of CARS) {
      expect(() => statSync(modelPath(car.file)), `${car.file} is missing`).not.toThrow();
    }
  });

  it('holds the arrival download inside its budget', () => {
    const total = arrivalCars.reduce((sum, car) => sum + statSync(modelPath(car.file)).size, 0);
    expect(total).toBeLessThan(ARRIVAL_BUDGET_BYTES);
  });

  it('keeps the heavy models out of the three arrival slots', () => {
    const bySize = [...CARS].sort(
      (a, b) => statSync(modelPath(a.file)).size - statSync(modelPath(b.file)).size,
    );
    const lightest = new Set(bySize.slice(0, arrivalCars.length).map((car) => car.file));
    for (const car of arrivalCars) {
      expect(
        lightest,
        `${car.file} sits in an arrival slot but is not among the lightest`,
      ).toContain(car.file);
    }
  });

  it('gives every car a distinct file and name', () => {
    expect(new Set(CARS.map((c) => c.file)).size).toBe(CARS.length);
    expect(new Set(CARS.map((c) => c.name)).size).toBe(CARS.length);
  });

  it('credits every model, which the CC BY licence requires', () => {
    for (const car of CARS) {
      const credit = car.credit;
      expect(credit, `${car.name} has no credit at all`).toBeDefined();
      expect(credit!.author.length, `${car.name} has no credit author`).toBeGreaterThan(0);
      expect(credit!.url, `${car.name} has no credit link`).toMatch(/^https:\/\//);
    }
  });
});

describe('THEMES', () => {
  it('covers both lighting modes with a full set of values', () => {
    for (const name of ['dusk', 'night'] as const) {
      const theme = THEMES[name];
      expect(theme, `${name} theme is missing`).toBeTruthy();
      expect(theme.exposure).toBeGreaterThan(0);
    }
  });
});
