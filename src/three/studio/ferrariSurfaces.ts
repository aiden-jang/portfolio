type StudioSurface = {
  tone?: [number, number, number];
  metalness?: number;
  roughness?: number;
  coat?: number;
  coatRoughness?: number;
  spec?: number;
  emissiveIntensity?: number;
};

export const studioSurfaces: Record<string, StudioSurface> = {
  Metallic: { tone: [0.71, 0.79, 0.78], metalness: 0.42, spec: 0.62 },
  Translucent: {
    tone: [0.73, 0.89, 1],
    metalness: 0,
    roughness: 0.083,
    coat: 0.09,
    coatRoughness: 0.115,
    spec: 0.95,
  },
  Headlight_Glass: {
    tone: [0.84, 0.89, 0.93],
    metalness: 0,
    roughness: 0.15,
    spec: 0.76,
    emissiveIntensity: 1.85,
  },
  material_7: {
    metalness: 0.065,
    roughness: 0.22,
    coat: 0.3,
    coatRoughness: 0.18,
    spec: 0.72,
    emissiveIntensity: 0.49,
  },
  material_14: {
    metalness: 0.03,
    roughness: 0.2,
    spec: 0.85,
    emissiveIntensity: 0.88,
  },
  material_20: {
    metalness: 0.03,
    roughness: 0.175,
    spec: 0.83,
    emissiveIntensity: 0.27,
  },
  material_16: { roughness: 0.37, metalness: 0.28 },
  material_17: { roughness: 0.255, metalness: 0.33 },
  material: {},
  'Rim_-_Black_part': { roughness: 0.37, metalness: 0.37 },
  material_9: {
    tone: [0.73, 0.74, 0.75],
    metalness: 0.015,
    roughness: 0.785,
    spec: 0.37,
  },
  Rubber: { metalness: 0, roughness: 0.78, spec: 0.37 },
  'Plastic_-_Matte_Black': { metalness: 0, roughness: 0.71, spec: 0.3 },
  'Plastic_-_Glossy_Black': { metalness: 0, roughness: 0.24, spec: 0.62 },
  'Fabric_-_Red': {
    tone: [0.61, 0.76, 0.8],
    metalness: 0,
    roughness: 0.87,
    spec: 0.29,
  },
  material_3: { metalness: 0.025, roughness: 0.59, spec: 0.32 },
  material_5: { metalness: 0.05, roughness: 0.69, spec: 0.32 },
  material_8: { metalness: 0.19, roughness: 0.49, spec: 0.48 },
  Mirror: { roughness: 0.127, spec: 0.89 },
  Chrome: { roughness: 0.197 },
  'Metal_-_Black': { roughness: 0.53, spec: 0.43 },
  'Metal_-_Grey': { roughness: 0.36, metalness: 0.66, spec: 0.7 },
};
