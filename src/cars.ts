import type { CarSpec } from './types';
import credits from './data/carCredits.json' with { type: 'json' };

// Registry indices are permanent because shared garage URLs store them.
const registry: Omit<CarSpec, 'credit'>[] = [
  {
    name: 'Ferrari F40',
    code: 'F120',
    file: 'ferrari-f120-f40.glb',
    defaultPaint: {
      name: 'Ferrari Red',
      hex: '#cf2428',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    name: 'Mercedes 300 SL',
    code: 'W198',
    file: 'mercedes-benz-w198-300-sl.glb',
    defaultPaint: {
      name: 'Silver Blue',
      hex: '#839aa4',
    },
    exposure: 0.65,
  },
  {
    name: 'Toyota Supra',
    code: 'A80',
    file: 'toyota-a80-supra.glb',
    defaultPaint: {
      name: 'Deep Jade',
      hex: '#285c54',
    },
    exposure: 1,
  },
  {
    name: 'Porsche 911 RWB',
    code: '930',
    file: 'porsche-930-911-rwb.glb',
    defaultPaint: {
      name: 'Bordeaux',
      hex: '#702c43',
    },
    exposure: 1,
  },
  {
    name: 'BMW M3',
    code: 'E30',
    file: 'bmw-e30-m3.glb',
    defaultPaint: {
      name: 'Atlantic Blue',
      hex: '#365d7b',
    },
    exposure: 1,
  },
  {
    name: 'Datsun 280Z',
    code: 'S30',
    file: 'datsun-s30-280z.glb',
    defaultPaint: {
      name: 'Burnt Copper',
      hex: '#ad6748',
    },
    exposure: 1,
  },
  {
    name: 'Audi R8',
    code: 'Widebody',
    file: 'audi-r8.glb',
    defaultPaint: {
      name: 'Amber Gold',
      hex: '#9c612b',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    name: 'Porsche 911 Turbo',
    code: '930',
    file: 'porsche-930-turbo-1975.glb',
    defaultPaint: {
      name: 'Graphite',
      hex: '#3f464e',
    },
    exposure: 1,
  },
  {
    name: 'Porsche 917K',
    code: 'Le Mans',
    file: 'porsche-917k-lm-red.glb',
    paintMaterial: 'body',
    fixedLivery: true,
    defaultPaint: {
      name: 'Le Mans Red',
      hex: '#a92728',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    name: 'BMW M4 ADRO',
    code: 'G82',
    file: 'bmw-g82-m4-adro.glb',
    paintMaterial: 'untitledBMW_M4CompetitionG82TNR3_2021PaintTNR_Material_008',
    defaultPaint: {
      name: 'Amethyst',
      hex: '#66517c',
    },
    exposure: 1,
  },
  {
    file: 'mazda-mx5-na.glb',
    popupHeadlights: {
      clip: 'Scene',
      closedTime: 1 / 24,
      openTime: 1.7,
      bulbMaterial: 'Material.009',
      lensMaterial: 'Material.008',
    },
    name: 'Mazda MX-5 Miata',
    code: 'NA',
    paintMaterial: 'Material.002',
    defaultPaint: {
      name: 'British Racing Green',
      hex: '#23473b',
    },
    exposure: 1,
  },
  {
    file: 'toyota-gr-supra.glb',
    name: 'Toyota GR Supra',
    code: 'A90 Modified',
    paintMaterial: 'carpaint',
    defaultPaint: {
      name: 'Solar Orange',
      hex: '#ff9d00',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    file: 'porsche-992-911-gt3.glb',
    name: 'Porsche 911 GT3',
    code: '992',
    paintMaterial: 'Porsche_911GT3_2022Paint_Material',
    defaultPaint: {
      name: 'Shark Blue',
      hex: '#2d80b6',
    },
    exposure: 1,
  },
  {
    file: 'lamborghini-aventador.glb',
    name: 'Lamborghini Aventador',
    code: 'SV',
    paintMaterial: 'RED_PAINT',
    defaultPaint: {
      name: 'Verde Ithaca',
      hex: '#7b9e35',
    },
    exposure: 1,
  },
  {
    file: 'ferrari-296-gt3.glb',
    orientationYaw: -0.6435,
    name: 'Ferrari 296 GT3',
    code: 'GT3',
    fixedLivery: true,
    preserveFlatMeshes: true,
    defaultPaint: {
      name: 'Ferrari Racing Livery',
      hex: '#b62f2b',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    file: 'red-bull-rb16b.glb',
    name: 'Red Bull RB16B',
    code: '2021 F1',
    fixedLivery: true,
    preserveFlatMeshes: true,
    roadLights: false,
    defaultPaint: {
      name: 'Red Bull Racing',
      hex: '#151d37',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    file: 'ferrari-f1-75.glb',
    name: 'Ferrari F1-75',
    code: '2022 F1',
    fixedLivery: true,
    preserveFlatMeshes: true,
    roadLights: false,
    defaultPaint: {
      name: 'Scuderia Ferrari',
      hex: '#bc242b',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    file: 'nissan-r35-aimgain.glb',
    name: 'Nissan GT-R Aimgain',
    code: 'R35 Type 2',
    paintMaterial: 'nNissan_GTRTNR4_2017PaintTNR_Material_002',
    preserveFlatMeshes: true,
    defaultPaint: {
      name: 'Aimgain Graphite',
      hex: '#171717',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    file: 'porsche-992-gt3-rs.glb',
    name: 'Porsche 911 GT3 RS',
    code: '992',
    fixedLivery: true,
    preserveFlatMeshes: true,
    defaultPaint: {
      name: 'RS Heritage Livery',
      hex: '#247eae',
      preserveSource: true,
    },
    exposure: 1,
  },
  {
    file: 'lamborghini-countach-5000qv.glb',
    name: 'Lamborghini Countach',
    code: '5000 QV',
    paintMaterial: 'Meshpart19Mtl',
    preserveFlatMeshes: true,
    defaultPaint: {
      name: 'Giallo',
      hex: '#d8b53d',
    },
    exposure: 1,
  },
];

export const CARS: CarSpec[] = registry.map((car) => ({
  ...car,
  credit: credits[car.file as keyof typeof credits],
}));

// Retired cars remain available to existing links, outside the curated picker.
export const GARAGE_INDICES: readonly number[] = [0, 1, 5, 4, 2, 10, 3, 9, 17, 18, 19, 13, 16, 15];

export function adjacentCar(index: number, direction: -1 | 1): number {
  const position = GARAGE_INDICES.indexOf(index);
  if (position === -1)
    return direction === 1 ? GARAGE_INDICES[0] : GARAGE_INDICES[GARAGE_INDICES.length - 1];
  return GARAGE_INDICES[(position + direction + GARAGE_INDICES.length) % GARAGE_INDICES.length];
}
