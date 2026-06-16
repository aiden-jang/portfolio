import * as THREE from 'three';

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Lerp on angles taking the shortest path around the circle. */
export const lerpAngle = (a: number, b: number, t: number): number => {
  const d = ((((b - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return a + d * t;
};

/** Exponential ease-toward. `k` is the fraction of remaining distance closed
 *  this step (clamp to [0, 1] before calling). */
export const smoothTowards = (current: number, target: number, k: number): number =>
  current + (target - current) * k;

const _src = new THREE.Color();
const _dst = new THREE.Color();
/** Color lerp in linear space, returning the resulting hex. */
export const smoothColorHex = (current: number, target: number, k: number): number => {
  _src.setHex(current);
  _dst.setHex(target);
  _src.lerp(_dst, k);
  return _src.getHex();
};

/** Clamp into [min, max]. */
export const clamp = (x: number, min: number, max: number): number =>
  x < min ? min : x > max ? max : x;
