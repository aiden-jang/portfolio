import { describe, expect, it } from 'vitest';
import { clamp, lerp, lerpAngle, smoothColorHex, smoothTowards } from './math';

const TAU = Math.PI * 2;

describe('lerpAngle', () => {
  it('crosses zero forwards rather than taking the long way round', () => {
    const from = TAU - 0.2;
    const to = 0.2;
    const mid = lerpAngle(from, to, 0.5);
    expect(Math.cos(mid)).toBeCloseTo(1, 5);
    expect(Math.abs(Math.sin(mid))).toBeLessThan(1e-9);
  });

  it('turns the short way when the gap is just under half a turn', () => {
    expect(lerpAngle(0, Math.PI - 0.1, 1)).toBeCloseTo(Math.PI - 0.1, 10);
    expect(lerpAngle(0, Math.PI + 0.1, 1)).toBeCloseTo(-Math.PI + 0.1, 10);
  });

  it('ignores whole turns in the target', () => {
    for (const turns of [-2, -1, 0, 1, 2]) {
      const mid = lerpAngle(0.3, 1.1 + turns * TAU, 0.5);
      expect(Math.cos(mid)).toBeCloseTo(Math.cos(0.7), 10);
      expect(Math.sin(mid)).toBeCloseTo(Math.sin(0.7), 10);
    }
  });

  it('never travels more than half a turn in one call', () => {
    for (let a = -8; a <= 8; a += 0.37) {
      for (let b = -8; b <= 8; b += 0.41) {
        expect(Math.abs(lerpAngle(a, b, 1) - a)).toBeLessThanOrEqual(Math.PI + 1e-9);
      }
    }
  });
});

describe('clamp', () => {
  it('holds the bounds', () => {
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });
});

describe('lerp and smoothTowards', () => {
  it('hit both endpoints exactly', () => {
    expect(lerp(2, 10, 0)).toBe(2);
    expect(lerp(2, 10, 1)).toBe(10);
    expect(smoothTowards(2, 10, 0)).toBe(2);
    expect(smoothTowards(2, 10, 1)).toBe(10);
  });

  it('closes a fixed fraction of the remaining gap each step', () => {
    let v = 0;
    for (let i = 0; i < 4; i++) v = smoothTowards(v, 1, 0.5);
    expect(v).toBeCloseTo(1 - 0.5 ** 4, 10);
  });
});

describe('smoothColorHex', () => {
  it('returns the endpoints unchanged', () => {
    expect(smoothColorHex(0xff6b1c, 0x163a8a, 0)).toBe(0xff6b1c);
    expect(smoothColorHex(0xff6b1c, 0x163a8a, 1)).toBe(0x163a8a);
  });

  it('does not leak state between calls through its shared scratch colors', () => {
    smoothColorHex(0x000000, 0xffffff, 0.5);
    expect(smoothColorHex(0xff6b1c, 0x163a8a, 0)).toBe(0xff6b1c);
  });
});
