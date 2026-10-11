import { describe, expect, it } from 'vitest';
import { sectionProgress } from './sectionProgress';

describe('sectionProgress', () => {
  const starts = [0, 900, 1800, 6200, 7100];
  it('keeps each camera stop aligned when Projects spans several screens', () => {
    expect(starts.map((y) => sectionProgress(y, starts))).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(sectionProgress(4000, starts)).toBeCloseTo(0.625);
  });
  it('clamps outside the page and handles missing section positions', () => {
    expect(sectionProgress(-100, starts)).toBe(0);
    expect(sectionProgress(8000, starts)).toBe(1);
    expect(sectionProgress(0, [])).toBe(0);
    expect(sectionProgress(10, [0])).toBe(0);
  });
});
