import type { Light } from 'three';

export function applyAfterHoursLighting(
  [ambient, hemi, key, fill, rim]: readonly [Light, Light, Light, Light, Light],
  level: number,
  darkPaint: boolean,
) {
  ambient.intensity *= 1 - 0.53 * level;
  hemi.intensity *= 1 - 0.48 * level;
  key.intensity *= 1 - 0.28 * level;
  fill.intensity *= 1 - (darkPaint ? 0.26 : 0.44) * level;
  rim.intensity *= 1 - 0.19 * level;
  if (darkPaint) {
    fill.intensity += 0.17 * level;
    rim.intensity += 0.15 * level;
  }
}
