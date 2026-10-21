import { describe, expect, it } from 'vitest';
import { CARS } from './config';
import { paintChoices, paintFinish, parseScenePaint } from './paint';

describe('garage finishes', () => {
  it('gives each car a distinct default without a white finish', () => {
    expect(new Set(CARS.map(({ defaultPaint }) => defaultPaint.hex)).size).toBe(CARS.length);
    for (const { defaultPaint } of CARS) {
      expect(defaultPaint.name).not.toMatch(/white/i);
      const rgb = defaultPaint.hex.match(/[a-f0-9]{2}/g)!.map((channel) => parseInt(channel, 16));
      expect(Math.min(...rgb)).toBeLessThan(190);
    }
  });

  it('offers only the original finish for fixed liveries and seven swatches otherwise', () => {
    for (const car of CARS) {
      const choices = paintChoices(car);
      expect(choices).toHaveLength(car.fixedLivery ? 1 : 7);
      expect(new Set(choices.map(({ hex }) => hex)).size).toBe(choices.length);
      expect(choices[0]).toMatchObject({ ...car.defaultPaint, value: 'original' });
    }
  });

  it('keeps older hex links usable even when they leave the visible palette', () => {
    for (const hex of ['#ff6b1c', '#b00020', '#f5f1e8', '#163a8a']) {
      expect(parseScenePaint(hex)).toBe(hex);
      expect(paintFinish(CARS[0], hex)).toEqual({ hex, name: 'Custom' });
    }
    expect(parseScenePaint('#ABC123')).toBe('#abc123');
    expect(parseScenePaint('original')).toBe('original');
    for (const invalid of [null, '', 'red', '#abc', '#1234567', 'url(example.com)'])
      expect(parseScenePaint(invalid)).toBeNull();
  });
});
