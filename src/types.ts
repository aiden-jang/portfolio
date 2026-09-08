import type * as THREE from 'three';

export type MarkKey =
  | 'owewell'
  | 'iguess'
  | 'wherever'
  | 'bloomnote'
  | 'auth'
  | 'mrrp'
  | 'everythingisfine';

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
  exposure: number;
  credit?: Credit;
};

export type Keyframe = {
  // Radians, 0 = front.
  azimuth: number;
  // Radians, 0 = level with the horizon.
  elevation: number;
  distance: number;
  // World space, not relative to the car.
  targetY: number;
};

export type Lamp = {
  light: THREE.PointLight;
  baseIntensity: number;
  isHeadlight: boolean;
};

export type ColorMaterial = THREE.Material & { color?: THREE.Color };

export type WorkDetail = {
  title: string;
  summary: string;
  context: string;
  body: string[];
  stack: string[];
  image?: string;
  link?: { label: string; url: string };
  links?: { label: string; url: string }[];
  // Giving an entry a mark switches the Work grid from an editorial row to a product card,
  // which is what reads shortName, tagline and preview.
  mark?: MarkKey;
  shortName?: string;
  tagline?: string;
  preview?: string;
  moment?: string;
  principle?: string;
  categories?: Array<'realtime' | 'ai' | 'social' | 'systems'>;
};
