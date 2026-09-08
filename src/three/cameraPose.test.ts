import { describe, expect, it } from 'vitest';
import { KEYFRAMES } from '../config';
import type { Keyframe } from '../types';
import {
  blendIntro,
  easeOutCubic,
  floorElevation,
  framingDistanceMultiplier,
  FRAME_BASE_ASPECT,
  FRAME_MAX_DIST_MUL,
  interpolateKeyframe,
  MAX_ELEVATION,
  MIN_CAM_Y,
  orbitPosition,
} from './cameraPose';
import { clamp } from '../math';

const blank = (): Keyframe => ({ azimuth: 0, elevation: 0, distance: 0, targetY: 0 });

describe('interpolateKeyframe', () => {
  it('lands exactly on the first and last pose at the ends of the page', () => {
    const out = blank();
    interpolateKeyframe(KEYFRAMES, 0, out);
    expect(out).toEqual(KEYFRAMES[0]);
    interpolateKeyframe(KEYFRAMES, 1, out);
    expect(out).toEqual(KEYFRAMES[KEYFRAMES.length - 1]);
  });

  it('lands on each intermediate pose at its own scroll position', () => {
    const out = blank();
    for (const [i, keyframe] of KEYFRAMES.entries()) {
      interpolateKeyframe(KEYFRAMES, i / (KEYFRAMES.length - 1), out);
      expect(out.distance).toBeCloseTo(keyframe.distance, 10);
      expect(out.targetY).toBeCloseTo(keyframe.targetY, 10);
    }
  });

  it('stays inside the poses it was given, so no scroll value invents a distance', () => {
    const out = blank();
    const distances = KEYFRAMES.map((k) => k.distance);
    for (let t = 0; t <= 1.0001; t += 0.01) {
      interpolateKeyframe(KEYFRAMES, t, out);
      expect(out.distance).toBeGreaterThanOrEqual(Math.min(...distances) - 1e-9);
      expect(out.distance).toBeLessThanOrEqual(Math.max(...distances) + 1e-9);
    }
  });

  it('clamps a scroll value that overshoots rather than reading past the array', () => {
    const out = blank();
    interpolateKeyframe(KEYFRAMES, 1.4, out);
    expect(out).toEqual(KEYFRAMES[KEYFRAMES.length - 1]);
    interpolateKeyframe(KEYFRAMES, -0.3, out);
    expect(out).toEqual(KEYFRAMES[0]);
  });
});

describe('framingDistanceMultiplier', () => {
  it('leaves a wide viewport alone and pulls back on a narrow one', () => {
    expect(framingDistanceMultiplier(FRAME_BASE_ASPECT)).toBe(1);
    expect(framingDistanceMultiplier(2.2)).toBe(1);
    expect(framingDistanceMultiplier(0.46)).toBeGreaterThan(1);
  });

  it('never pulls back further than the cap, however narrow the screen', () => {
    for (const aspect of [0.2, 0.3, 0.46, 0.6, 0.75, 1, 1.5, 3]) {
      const mul = framingDistanceMultiplier(aspect);
      expect(mul).toBeGreaterThanOrEqual(1);
      expect(mul).toBeLessThanOrEqual(FRAME_MAX_DIST_MUL);
    }
  });

  it('pulls back further the narrower the viewport gets', () => {
    const aspects = [1.5, 1.2, 0.9, 0.7, 0.5];
    const muls = aspects.map(framingDistanceMultiplier);
    for (let i = 1; i < muls.length; i++) expect(muls[i]).toBeGreaterThanOrEqual(muls[i - 1]);
  });

  it('falls back to no pull-back on a zero-height viewport instead of dividing by zero', () => {
    expect(framingDistanceMultiplier(0)).toBe(1);
    expect(Number.isFinite(framingDistanceMultiplier(-1))).toBe(true);
  });
});

describe('the floor clamp', () => {
  it('keeps the camera above the ground for every pose the page can reach', () => {
    const out = blank();
    for (let t = 0; t <= 1.0001; t += 0.01) {
      interpolateKeyframe(KEYFRAMES, t, out);
      for (const aspect of [0.4, 1, 1.5, 2.4]) {
        const dist = out.distance * framingDistanceMultiplier(aspect);
        // The most aggressive downward drag a visitor can apply.
        const el = clamp(out.elevation - 0.4, floorElevation(dist, out.targetY), MAX_ELEVATION);
        const pose = orbitPosition(out.azimuth, el, dist, out.targetY);
        expect(pose.y).toBeGreaterThanOrEqual(MIN_CAM_Y - 1e-9);
      }
    }
  });

  it('stays a real angle when the target sits below the floor', () => {
    expect(Number.isNaN(floorElevation(1, -50))).toBe(false);
    expect(Number.isNaN(floorElevation(0.01, 10))).toBe(false);
  });
});

describe('orbitPosition', () => {
  it('puts azimuth 0 in front of the car, on +Z', () => {
    const pose = orbitPosition(0, 0, 8, 0.7);
    expect(pose.x).toBeCloseTo(0, 10);
    expect(pose.z).toBeCloseTo(8, 10);
    expect(pose.y).toBeCloseTo(0.7, 10);
  });

  it('holds the orbit radius whatever the angles', () => {
    for (const az of [0, 0.7, Math.PI, -1.45]) {
      for (const el of [-0.4, 0, 0.55, 1.2]) {
        const pose = orbitPosition(az, el, 7.4, 0.6);
        const radius = Math.hypot(pose.x, pose.y - 0.6, pose.z);
        expect(radius).toBeCloseTo(7.4, 9);
      }
    }
  });
});

describe('blendIntro', () => {
  it('ends exactly on the composed pose so there is no jump when the tween finishes', () => {
    const pose = orbitPosition(0.25, 0.22, 9.5, 0.7);
    expect(blendIntro(pose, 0.25, 9.5, 0.7, 1)).toEqual(pose);
  });

  it('starts wider than it ends, which is the whole point of the pull-in', () => {
    const pose = orbitPosition(0.25, 0.22, 9.5, 0.7);
    const opening = blendIntro(pose, 0.25, 9.5, 0.7, 0);
    expect(Math.hypot(opening.x, opening.z)).toBeGreaterThan(Math.hypot(pose.x, pose.z));
  });
});

describe('easeOutCubic', () => {
  it('runs from 0 to 1 without overshooting', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = easeOutCubic(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('decelerates, rather than easing in', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});
