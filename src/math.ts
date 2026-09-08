import * as THREE from 'three';

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const lerpAngle = (a: number, b: number, t: number): number => {
  const d = ((((b - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return a + d * t;
};

/** `k` is the fraction of the remaining distance to close, and is not clamped here. */
export const smoothTowards = (current: number, target: number, k: number): number =>
  current + (target - current) * k;

const _src = new THREE.Color();
const _dst = new THREE.Color();
export const smoothColorHex = (current: number, target: number, k: number): number => {
  _src.setHex(current);
  _dst.setHex(target);
  _src.lerp(_dst, k);
  return _src.getHex();
};

export const clamp = (x: number, min: number, max: number): number =>
  x < min ? min : x > max ? max : x;
