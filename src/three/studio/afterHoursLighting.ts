import { Color, type Light } from 'three';

const blueEdge = new Color(0.23, 0.53, 1);
const iceRim = new Color(0.61, 0.81, 1);

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
  // Keep a neutral key on the paint while the cooler rim defines the silhouette.
  ambient.intensity *= 1 - 0.19 * level;
  key.intensity += 0.09 * level;
  fill.intensity += (darkPaint ? 0.105 : 0.075) * level;
  rim.color.lerp(iceRim, 0.4 * level).lerp(blueEdge, 0.78 * level);
  rim.intensity += 0.35 * level;
  if (darkPaint) {
    fill.intensity += 0.17 * level;
    rim.intensity += 0.15 * level;
  }
}
