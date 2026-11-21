import type { AmbientLight, DirectionalLight, HemisphereLight, PointLight } from 'three';
import { smoothTowards } from '../../math';
import type { Exhibit } from '../../garageExhibits/state';

export function updateDetailAccent(
  accent: PointLight,
  active: boolean,
  exhibit: Exhibit,
  shot: number,
  headlights: boolean,
  rear917: number,
  dt: number,
) {
  let accentTarget = 0;
  if (active) {
    if (exhibit === 'wings' && shot === 1) {
      accent.position.set(0.67, 1.31, -2.8);
      accentTarget = 4.2;
    } else if (exhibit === 'lamps' && headlights) {
      accent.position.set(1.9, 0.82, 2.35);
      accentTarget = 1.4;
    } else if (exhibit === 'brakes') {
      accent.position.set(1.72, 0.8, 1.6);
      accentTarget = 2.2;
    } else if (rear917 > 0) {
      accent.position.set(1.62, 1.06, -2.94);
      accentTarget = 2.6 * rear917;
    }
  }
  accent.intensity = smoothTowards(accent.intensity, accentTarget, Math.min(1, dt * 10));
  accent.visible = accent.intensity > 0.002;
}

export function applyStudioAccent(
  ferrari296: boolean,
  dusk: number,
  key: DirectionalLight,
  fill: DirectionalLight,
  rim: DirectionalLight,
  ambient: AmbientLight,
  hemi: HemisphereLight,
) {
  if (ferrari296) {
    rim.position.set(-3.9, 6.1, 3.8);
    rim.intensity *= 0.82;
    fill.intensity *= 0.91;
  }
  if (dusk > 0.002) {
    const d = dusk;
    key.position.set(5.6, 1.83, 3.42);
    key.color.setRGB(1, 1 - 0.25 * d, 1 - 0.55 * d);
    key.intensity += d * 0.68;
    fill.intensity *= 1 - 0.48 * d;
    ambient.intensity *= 1 - 0.53 * d;
    hemi.intensity *= 1 - 0.39 * d;
    rim.color.setRGB(1, 1 - 0.17 * d, 1 - 0.4 * d);
    rim.intensity *= 1 - 0.13 * d;
  }
}
