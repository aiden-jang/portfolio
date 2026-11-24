import { Color, MathUtils, type Light } from 'three';
import { prefersReducedMotion } from '../../hooks/reducedMotion';

const blueEdge = new Color(0.23, 0.53, 1);
const iceRim = new Color(0.61, 0.81, 1);

export function sampleAfterHours(
  progress: { current: number | null },
  target: number,
  animate: boolean,
  dt: number,
) {
  const current = progress.current ?? target;
  const step = Math.min(dt, 0.05) / 0.68;
  progress.current =
    animate && !prefersReducedMotion()
      ? MathUtils.clamp(target, current - step, current + step)
      : target;
  return MathUtils.smoothstep(progress.current, 0, 1);
}

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
