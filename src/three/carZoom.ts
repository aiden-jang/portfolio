import { clamp } from '../math';

export const CAR_ZOOM_MIN = 0.85;
export const CAR_ZOOM_MAX = 1.25;
export const CAR_ZOOM_STEP = 0.1;

export function clampCarZoom(value: number): number {
  return Number.isFinite(value) ? clamp(Number(value.toFixed(2)), CAR_ZOOM_MIN, CAR_ZOOM_MAX) : 1;
}

export function zoomedIntroDistance(distance: number, zoom: number, scrollT: number): number {
  const weight = 1 - clamp(scrollT * 5, 0, 1);
  return distance / (1 + (zoom - 1) * weight);
}
