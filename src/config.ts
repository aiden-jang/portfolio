import type { CarSpec, Keyframe, Theme, ThemeName } from './types';

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

// Keep model indices stable: shared garage links store the selected index.
export const CARS: CarSpec[] = [
  {
    name: 'Ferrari F40',
    code: 'F120',
    file: 'ferrari-f120-f40.glb',
    exposure: 1.0,
    credit: {
      title: 'Ferrari F40 | www.vecarz.com',
      author: 'vecarz',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      url: 'https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95',
    },
  },
  {
    name: 'Mercedes 300 SL',
    code: 'W198',
    file: 'mercedes-benz-w198-300-sl.glb',
    exposure: 0.65,
    credit: {
      title: 'Mercedes-Benz 300 SL Gullwing',
      author: 'Lexyc16',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      url: 'https://sketchfab.com/3d-models/505241c829c540a4921533000736904e',
    },
  },
  {
    name: 'Mazda RX-7',
    code: 'FD',
    file: 'mazda-fd-rx7.glb',
    exposure: 1.0,
    credit: {
      title: 'Mazda RX-7 FD',
      author: 'Lexyc16',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      url: 'https://sketchfab.com/3d-models/d35ff630df614771b82e7b2f59035b1e',
    },
  },
  {
    name: 'Porsche 911 RWB',
    code: '930',
    file: 'porsche-930-911-rwb.glb',
    exposure: 1.0,
    credit: {
      title: 'Porsche 911 Turbo - RWB',
      author: 'SWIZ',
      copyright: 'Copyright to SWIZ.',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      url: 'https://sketchfab.com/3d-models/9b13e93711db460b99749ae95aea9764',
    },
  },
  {
    name: 'BMW M3',
    code: 'E30',
    file: 'bmw-e30-m3.glb',
    exposure: 1.0,
    credit: {
      title: '[FREE] BMW M3 E30',
      author: 'Martin Trafas',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      url: 'https://sketchfab.com/3d-models/ac3c7013434e403e8faff87948caf422',
    },
  },
  {
    name: 'Datsun 280Z',
    code: 'S30',
    file: 'datsun-s30-280z.glb',
    exposure: 1.0,
    credit: {
      title: '[FREE] Datsun 280Z',
      author: 'Martin Trafas',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      url: 'https://sketchfab.com/3d-models/0789ab2ece9442de94b3c41595e0ecbd',
    },
  },
  {
    name: 'Honda NSX',
    code: 'NA1',
    file: 'honda-na1-nsx.glb',
    exposure: 1.0,
    credit: {
      title: 'Honda NSX 1990',
      author: 'Lexyc16',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      url: 'https://sketchfab.com/3d-models/1cc15628a00a4739a6b6c01128927c8d',
    },
  },
];

// Full-detail cars load on selection; only the two smallest models warm the cache.
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
