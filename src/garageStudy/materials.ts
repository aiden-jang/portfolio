import { Color, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, type Object3D } from 'three';

type Layer = {
  roughness?: number;
  metalness?: number;
  coat?: number;
  smoothness?: number;
  spec?: number;
  opacity?: number;
  tint?: number;
};

const glass: Layer = {
  roughness: 0.072,
  metalness: 0,
  coat: 0.22,
  smoothness: 0.075,
  spec: 0.94,
  opacity: 0.29,
};
const carbon: Layer = {
  roughness: 0.43,
  metalness: 0.09,
  coat: 0.16,
  smoothness: 0.31,
  spec: 0.67,
};
const chrome: Layer = { roughness: 0.09, metalness: 1 };
const rubber: Layer = { roughness: 0.72, metalness: 0, spec: 0.44 };
const profiles: Record<string, Record<string, Layer>> = {
  'mercedes-benz-w198-300-sl.glb': {
    main_color: {
      roughness: 0.39,
      metalness: 0.47,
      coat: 0.83,
      smoothness: 0.085,
    },
    Material: glass,
    chrome,
    'mid-chrome': { ...chrome, roughness: 0.2 },
    tire: { ...rubber, roughness: 0.57, tint: 0x151719 },
  },
  'bmw-g82-m4-adro.glb': {
    untitledBMW_M4CompetitionG82TNR3_2021PaintTNR_Material_008: {
      roughness: 0.39,
      metalness: 0.43,
      coat: 0.97,
      smoothness: 0.075,
      spec: 0.7,
    },
    untitledBMW_M4CompetitionG82TNR3_2021Window_Material1: {
      ...glass,
      opacity: 0.27,
    },
    untitledBMW_M4CompetitionG82TNR3_2021Carbon1_Material_004: carbon,
  },
  'ferrari-296-gt3.glb': {
    mat_220: { roughness: 0.57, metalness: 0, coat: 0.085, smoothness: 0.22, spec: 0.7 },
    Window: { roughness: 0.16, smoothness: 0.105 },
  },
  'red-bull-rb16b.glb': {
    redbull_carbon1: carbon,
    redbull_carbon2: { ...carbon, roughness: 0.52 },
    toro_rosso_carbon4: carbon,
    'chrome.001': { ...chrome, roughness: 0.14 },
    Material_27: rubber,
    Material_29: rubber,
    Material_26: rubber,
    Material_25: rubber,
    Material_30: rubber,
    Material_31: rubber,
    Material_33: rubber,
    Material_32: rubber,
  },
};

export function tuneStudyMaterials(model: Object3D, file: string) {
  const profile = profiles[file];
  if (!profile) return undefined;
  const tune: ((active: boolean) => void)[] = [];
  const visited = new Set<MeshStandardMaterial>();
  model.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!(material instanceof MeshStandardMaterial) || visited.has(material)) continue;
      if (!Object.hasOwn(profile, material.name)) continue;
      visited.add(material);
      const layer = profile[material.name];
      const physical = material instanceof MeshPhysicalMaterial ? material : null;
      const base = {
        roughness: material.roughness,
        metalness: material.metalness,
        opacity: material.opacity,
        clearcoat: physical?.clearcoat ?? 0,
        clearcoatRoughness: physical?.clearcoatRoughness ?? 0,
        specularIntensity: physical?.specularIntensity ?? 1,
      };
      const originalColor = material.color.clone();
      const tint = layer.tint == null ? null : new Color(layer.tint);
      tune.push((active) => {
        material.roughness = active ? (layer.roughness ?? base.roughness) : base.roughness;
        material.metalness = active ? (layer.metalness ?? base.metalness) : base.metalness;
        material.opacity = active ? (layer.opacity ?? base.opacity) : base.opacity;
        if (tint) material.color.copy(active ? tint : originalColor);
        if (physical) {
          physical.clearcoat = active ? (layer.coat ?? base.clearcoat) : base.clearcoat;
          physical.clearcoatRoughness = active
            ? (layer.smoothness ?? base.clearcoatRoughness)
            : base.clearcoatRoughness;
          physical.specularIntensity = active
            ? (layer.spec ?? base.specularIntensity)
            : base.specularIntensity;
        }
        material.needsUpdate = true;
      });
    }
  });
  let current = false;
  return (active: boolean) => {
    if (current === active) return;
    current = active;
    for (const patch of tune) patch(active);
  };
}
