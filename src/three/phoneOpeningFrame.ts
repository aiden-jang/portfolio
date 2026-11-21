import { clamp } from '../math';

export function phoneOpeningFrame(width: number, height: number, weight = 1) {
  const shortness = clamp((width / height - 0.47) / 0.13, 0, 1);
  return {
    scale: 1 - shortness * 0.09 * weight,
    lift: (12 - shortness * 4) * weight,
  };
}
