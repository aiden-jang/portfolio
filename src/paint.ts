import type { CarSpec } from './types';

// Shared links retain "original" as the selected car's default finish.
export type ActiveBodyColor = 'original' | string;

const FINISHES = [
  { hex: '#702c43', name: 'Bordeaux' },
  { hex: '#285c54', name: 'Deep Jade' },
  { hex: '#365d7b', name: 'Atlantic Blue' },
  { hex: '#ad6748', name: 'Burnt Copper' },
  { hex: '#b7a17b', name: 'Champagne' },
  { hex: '#3f464e', name: 'Graphite' },
  { hex: '#d4ab42', name: 'Golden Yellow' },
];

export function paintChoices(car: CarSpec) {
  if (car.fixedLivery) return [{ ...car.defaultPaint, value: 'original' }];
  return [
    { ...car.defaultPaint, value: 'original' },
    ...FINISHES.filter(({ hex }) => hex !== car.defaultPaint.hex)
      .slice(0, 6)
      .map((finish) => ({ ...finish, value: finish.hex })),
  ];
}

export function paintFinish(car: CarSpec, color: ActiveBodyColor) {
  if (color === 'original') return car.defaultPaint;
  return (
    [...FINISHES, car.defaultPaint].find(({ hex }) => hex === color) ?? {
      hex: color,
      name: 'Custom',
    }
  );
}

export function parseScenePaint(value: string | null): ActiveBodyColor | null {
  if (value === 'original') return value;
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}
