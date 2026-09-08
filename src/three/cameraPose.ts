import { clamp, lerp, lerpAngle } from '../math';
import type { Keyframe } from '../types';

export const MIN_CAM_Y = 0.25;
export const MAX_ELEVATION = 1.2;
export const FRAME_BASE_ASPECT = 1.5;
export const FRAME_MAX_DIST_MUL = 1.85;
export const INTRO_WIDE_DIST_MUL = 2.6;
export const INTRO_WIDE_ELEVATION = 0.65;

export function interpolateKeyframe(keyframes: Keyframe[], scrollT: number, out: Keyframe): void {
  const t = clamp(scrollT, 0, 1) * (keyframes.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = keyframes[i];
  const b = keyframes[Math.min(i + 1, keyframes.length - 1)];
  out.azimuth = lerpAngle(a.azimuth, b.azimuth, f);
  out.elevation = lerp(a.elevation, b.elevation, f);
  out.distance = lerp(a.distance, b.distance, f);
  out.targetY = lerp(a.targetY, b.targetY, f);
}

// Keyframe distances are framed for a wide viewport. Portrait shrinks the horizontal field of
// view, so the car crops unless the camera pulls back.
export function framingDistanceMultiplier(aspect: number): number {
  const safe = aspect > 0 ? aspect : FRAME_BASE_ASPECT;
  return clamp(Math.sqrt(FRAME_BASE_ASPECT / safe), 1, FRAME_MAX_DIST_MUL);
}

/** The lowest elevation that still keeps the camera above MIN_CAM_Y at this distance. */
export function floorElevation(distance: number, targetY: number): number {
  return Math.asin(clamp((MIN_CAM_Y - targetY) / distance, -1, 1));
}

export function orbitPosition(
  azimuth: number,
  elevation: number,
  distance: number,
  targetY: number,
) {
  return {
    x: Math.sin(azimuth) * Math.cos(elevation) * distance,
    y: Math.sin(elevation) * distance + targetY,
    z: Math.cos(azimuth) * Math.cos(elevation) * distance,
  };
}

/** `t` is the eased 0..1 progress; 0 sits at the wide opening pose, 1 at the composed one. */
export function blendIntro(
  pose: { x: number; y: number; z: number },
  azimuth: number,
  distance: number,
  targetY: number,
  t: number,
) {
  const wideDist = distance * INTRO_WIDE_DIST_MUL;
  const cosWide = Math.cos(INTRO_WIDE_ELEVATION);
  const wx = Math.sin(azimuth) * cosWide * wideDist;
  const wy = Math.sin(INTRO_WIDE_ELEVATION) * wideDist + targetY;
  const wz = Math.cos(azimuth) * cosWide * wideDist;
  return {
    x: wx + (pose.x - wx) * t,
    y: wy + (pose.y - wy) * t,
    z: wz + (pose.z - wz) * t,
  };
}

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
