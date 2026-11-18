import type { Keyframe, Theme, ThemeName } from './types';

export const THEMES: Record<ThemeName, Theme> = {
  dusk: {
    bg: 0x12121a,
    fogColor: 0x12121a,
    fogNear: 22,
    fogFar: 80,
    ambient: { color: 0xfff4e8, intensity: 0.4 },
    hemi: { sky: 0xfff2e0, ground: 0x1c1612, intensity: 0.55 },
    key: { color: 0xfff0d8, intensity: 0.55 },
    fill: { color: 0xb8cce8, intensity: 0.95 },
    rim: { color: 0xffd8b0, intensity: 1.02 },
    reflectorColor: 0x41414b,
    underglow: 0xff5a1c,
    bloomStrength: 0.085,
    bloomThreshold: 1.15,
    exposure: 0.94,
  },
  night: {
    bg: 0x080b12,
    fogColor: 0x080b12,
    fogNear: 18,
    fogFar: 70,
    ambient: { color: 0xc8d4e8, intensity: 0.32 },
    hemi: { sky: 0xa8b8d8, ground: 0x080a14, intensity: 0.45 },
    key: { color: 0xd5e7ff, intensity: 1.08 },
    fill: { color: 0x9ab8df, intensity: 0.65 },
    rim: { color: 0xb6cfff, intensity: 1.15 },
    reflectorColor: 0x586878,
    underglow: 0x2bd4ff,
    bloomStrength: 0.14,
    bloomThreshold: 1.2,
    exposure: 0.94,
  },
};

export { CARS, GARAGE_INDICES, adjacentCar } from './cars';

// The default car and a lightweight companion warm the cache; the rest load on selection.
export const PREFETCH_MODEL_INDICES = [0, 1] as const;

export const KEYFRAMES: Keyframe[] = [
  {
    azimuth: 0.65,
    elevation: 0.19,
    distance: typeof window !== 'undefined' && window.innerWidth < 768 ? 9.35 : 8.7,
    targetY: 0.55,
  }, // intro:      front 3/4
  { azimuth: Math.PI, elevation: 0.22, distance: 8.6, targetY: 0.7 }, // selected work: rear
  { azimuth: 1.45, elevation: 0.18, distance: 7.4, targetY: 0.6 }, // experience: side (right)
  { azimuth: Math.PI, elevation: 0.22, distance: 8.6, targetY: 0.7 }, // more projects: rear
  { azimuth: -1.45, elevation: 0.18, distance: 7.4, targetY: 0.6 }, // about:      side (left)
  { azimuth: 0, elevation: 0.62, distance: 9, targetY: 0.7 }, // contact:    elevated front
];

export const SECTION_IDS = [
  'sec-intro',
  'sec-work',
  'sec-experience',
  'sec-more-work',
  'sec-about',
  'sec-contact',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  'sec-intro': 'Intro',
  'sec-experience': 'Experience',
  'sec-work': 'Featured work',
  'sec-more-work': 'More projects',
  'sec-about': 'About',
  'sec-contact': 'Contact',
};
