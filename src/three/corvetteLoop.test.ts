import { describe, expect, it } from 'vitest';
import { sampleCorvetteLoop } from './corvetteLoop';

describe('After Hours Corvette loop', () => {
  it.each([
    [false, 1440 / 900],
    [true, 390 / 844],
    [true, 375 / 667],
  ])('cuts between all five shots and loops back to the rear', (phone, aspect) => {
    const sample = (time: number) => sampleCorvetteLoop(time, phone, aspect, true);

    expect(sample(1.49).yaw).toBeLessThan(-2);
    expect(Math.abs(sample(1.51).yaw)).toBeLessThan(0.1);
    const earlyTravel = sample(1.6).distance - sample(1.7).distance;
    const lateTravel = sample(4.24).distance - sample(4.34).distance;
    expect(earlyTravel).toBeGreaterThan(0);
    expect(lateTravel).toBeCloseTo(earlyTravel, 8);
    expect(sample(4.36).yaw).toBeLessThan(-2.8);
    expect(sample(5.66).yaw).toBeGreaterThan(1);
    expect(sample(7.16).elevation).toBeGreaterThan(1);
    expect(sample(8.6)).toEqual(sample(0));
  });

  it('starts the low push-in with the Studio shot’s original movement', () => {
    const studioFront = 1.54 + 1.1 + 1.38;
    for (const time of [0.01, 0.4, 0.8]) {
      const studio = sampleCorvetteLoop(studioFront + time, false, 1.6);
      const afterHours = sampleCorvetteLoop(1.5 + time, false, 1.6, true);
      expect(afterHours.distance).toBeCloseTo(studio.distance, 8);
      expect(afterHours.yaw).toBeCloseTo(studio.yaw, 8);
    }
  });
});
