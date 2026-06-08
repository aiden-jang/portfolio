import type * as THREE from 'three';

export type ThemeName = 'dusk' | 'night';

export type Theme = {
  bg: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  ambient: { color: number; intensity: number };
  hemi: { sky: number; ground: number; intensity: number };
  key: { color: number; intensity: number };
  fill: { color: number; intensity: number };
  rim: { color: number; intensity: number };
  reflectorColor: number;
  underglow: number;
  bloomStrength: number;
  bloomThreshold: number;
  exposure: number;
};

export type Credit = {
  author: string;
  license: string;
  url: string;
};

export type CarSpec = {
  name: string;
  code: string;
  file: string;
  /** Per-car tone-mapping multiplier applied on top of the theme exposure. */
  exposure: number;
  credit?: Credit;
};

/** Spherical-coords camera target, interpolated between page sections. */
export type Keyframe = {
  /** Yaw around the car (radians, 0 = front). */
  azimuth: number;
  /** Pitch above the horizon (radians, 0 = level). */
  elevation: number;
  distance: number;
  /** World-space Y the camera looks at. */
  targetY: number;
};

export type Lamp = {
  light: THREE.PointLight;
  baseIntensity: number;
  isHeadlight: boolean;
};

/** Any Three.js material that exposes a `color` property. */
export type ColorMaterial = THREE.Material & { color?: THREE.Color };
