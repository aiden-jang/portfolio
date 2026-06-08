import type { CarSpec, Keyframe, Theme, ThemeName } from './types';

export const THEMES: Record<ThemeName, Theme> = {
  // Warm, mostly-neutral studio lighting — warm key, cool fill, soft warm rim.
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
    reflectorColor: 0x8080a0,
    underglow: 0xff5a1c,
    bloomStrength: 0.45,
    bloomThreshold: 0.85,
    exposure: 1.0,
  },
  // Cool moonlight with a subtle violet rim.
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
    reflectorColor: 0x607090,
    underglow: 0x2bd4ff,
    bloomStrength: 0.7,
    bloomThreshold: 0.7,
    exposure: 0.95,
  },
};

export const CARS: CarSpec[] = [
  {
    name: 'Ferrari F40',
    code: 'F120',
    file: 'ferrari-f120-f40.glb',
    exposure: 1.0,
    credit: { author: 'vecarz', license: 'CC BY 4.0', url: 'https://skfb.ly/p8I7O' },
  },
  {
    name: 'Porsche 911 RWB',
    code: '930',
    file: 'porsche-930-911-rwb.glb',
    exposure: 1.0,
    credit: { author: 'SWIZ', license: 'CC BY 4.0', url: 'https://skfb.ly/oBxqx' },
  },
  {
    name: 'BMW M4 ADRO',
    code: 'G82',
    file: 'bmw-g82-m4-adro.glb',
    exposure: 1.0,
    credit: { author: 'vecarz', license: 'CC BY 4.0', url: 'https://skfb.ly/pusEX' },
  },
  {
    name: 'Mercedes 300 SL',
    code: 'W198',
    file: 'mercedes-benz-w198-300-sl.glb',
    exposure: 0.65,
    credit: { author: 'Lexyc16', license: 'CC BY 4.0', url: 'https://skfb.ly/6TXpZ' },
  },
  {
    name: 'Porsche 911',
    code: '930',
    file: 'porsche-930-911.glb',
    exposure: 1.4,
    credit: { author: 'Lionsharp Studios', license: 'CC BY 4.0', url: 'https://skfb.ly/6WZyV' },
  },
  {
    name: 'BMW M3',
    code: 'E30',
    file: 'bmw-e30-m3.glb',
    exposure: 1.0,
    credit: { author: 'Martin Trafas', license: 'CC BY 4.0', url: 'https://skfb.ly/oH7rM' },
  },
  {
    name: 'Datsun 280Z',
    code: 'S30',
    file: 'datsun-s30-280z.glb',
    exposure: 1.0,
    credit: { author: 'Martin Trafas', license: 'CC BY 4.0', url: 'https://skfb.ly/o9J9r' },
  },
];

// Camera keyframes, one per page section. Linearly interpolated by scroll
// position so the camera tours the car as the user moves through content.
export const KEYFRAMES: Keyframe[] = [
  { azimuth: 0.25, elevation: 0.22, distance: 9.5, targetY: 0.7 }, // intro:   front 3/4
  { azimuth: 1.45, elevation: 0.18, distance: 7.4, targetY: 0.6 }, // work:    side (right)
  { azimuth: Math.PI, elevation: 0.22, distance: 8.6, targetY: 0.7 }, // about:   rear
  { azimuth: -1.45, elevation: 0.18, distance: 7.4, targetY: 0.6 }, // resume:  side (left)
  { azimuth: 0.0, elevation: 0.55, distance: 6.2, targetY: 0.4 }, // contact: high front
];

export const SECTION_IDS = [
  'sec-intro',
  'sec-work',
  'sec-about',
  'sec-resume',
  'sec-contact',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];
