import type { Keyframe, Theme, ThemeName } from './types';

export const THEMES: Record<ThemeName, Theme> = {
  dusk: {
    bg: 0x12121a,
    fogColor: 0x12121a,
    fogNear: 22,
    fogFar: 80,
    ambient: { color: 0xfff4e8, intensity: 0.35 },
    hemi: { sky: 0xfff2e0, ground: 0x1c1612, intensity: 0.55 },
    key: { color: 0xfff0d8, intensity: 1.8 },
    fill: { color: 0xb8cce8, intensity: 0.55 },
    rim: { color: 0xffd8b0, intensity: 0.7 },
    reflectorColor: 0x707080,
    underglow: 0xff5a1c,
    bloomStrength: 0.28,
    bloomThreshold: 0.95,
    exposure: 1.0,
  },
  night: {
    bg: 0x080a14,
    fogColor: 0x080a14,
    fogNear: 18,
    fogFar: 70,
    ambient: { color: 0xc8d4e8, intensity: 0.3 },
    hemi: { sky: 0xa8b8d8, ground: 0x080a14, intensity: 0.45 },
    key: { color: 0xd0dcf0, intensity: 1.4 },
    fill: { color: 0x4a5a78, intensity: 0.4 },
    rim: { color: 0xd0c0ff, intensity: 0.65 },
    reflectorColor: 0x586878,
    underglow: 0x2bd4ff,
    bloomStrength: 0.42,
    bloomThreshold: 0.85,
    exposure: 0.95,
  },
};

export { CARS, GARAGE_INDICES, adjacentCar } from './cars';

// The default car and a lightweight companion warm the cache; the rest load on selection.
export const PREFETCH_MODEL_INDICES = [0, 1] as const;

export const KEYFRAMES: Keyframe[] = [
  { azimuth: 0.65, elevation: 0.22, distance: 9.5, targetY: 0.7 }, // intro:      front 3/4
  { azimuth: 1.45, elevation: 0.18, distance: 7.4, targetY: 0.6 }, // experience: side (right)
  { azimuth: Math.PI, elevation: 0.22, distance: 8.6, targetY: 0.7 }, // work:       rear
  { azimuth: -1.45, elevation: 0.18, distance: 7.4, targetY: 0.6 }, // about:      side (left)
  { azimuth: 0, elevation: 0.62, distance: 9, targetY: 0.7 }, // contact:    elevated front
];

export const SECTION_IDS = [
  'sec-intro',
  'sec-experience',
  'sec-work',
  'sec-about',
  'sec-contact',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  'sec-intro': 'Intro',
  'sec-experience': 'Experience',
  'sec-work': 'Projects',
  'sec-about': 'About',
  'sec-contact': 'Contact',
};
