import { type Mesh, MeshPhysicalMaterial, MeshStandardMaterial, type Object3D } from 'three';

const roadPaint: Record<string, string> = {
  'ferrari-f120-f40.glb': 'Metallic',
  'mercedes-benz-w198-300-sl.glb': 'main_color',
  'datsun-s30-280z.glb': '280z_CarPaint',
  'bmw-e30-m3.glb': 'BMW_E30_M3_PAINT',
  'toyota-a80-supra.glb': 'TOYOTA_SUPRA_CAR_PAINT',
  'mazda-mx5-na.glb': 'Material.002',
  'porsche-930-911-rwb.glb': 'M_Body',
  'bmw-g82-m4-adro.glb': 'untitledBMW_M4CompetitionG82TNR3_2021PaintTNR_Material_008',
};

function prepareFerrariF1Finish(model: Object3D): void {
  const roughness: Record<string, number> = {
    CAR_CHASSIS: 0.45,
    DECALS_1: 0.45,
    CAR_CARBON: 0.45,
    HALO_CARBON: 0.45,
    TIRE_SIDES: 0.8,
    TIRE_TREAD: 0.85,
  };
  model.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const finish = material as MeshStandardMaterial;
      if (!finish.isMeshStandardMaterial || !(finish.name in roughness)) continue;
      // Painted livery, rubber and carbon are dielectric surfaces, not bare wheel metal.
      finish.metalness = 0;
      finish.roughness = roughness[finish.name];
      if (finish.name === 'CAR_CHASSIS' && finish instanceof MeshPhysicalMaterial) {
        finish.clearcoat = 0.2;
        finish.clearcoatRoughness = 0.2;
      }
      finish.needsUpdate = true;
    }
  });
}

function prepareGlossPaint(
  model: Object3D,
  materialName: string,
  roughness: number,
  coatRoughness: number,
  preserveSharper = false,
): void {
  const replacements = new Map<MeshStandardMaterial, MeshPhysicalMaterial>();
  model.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const prepare = (material: MeshStandardMaterial) => {
      if (!material.isMeshStandardMaterial || material.name !== materialName) return material;
      if (replacements.has(material)) return replacements.get(material)!;
      const finish =
        material instanceof MeshPhysicalMaterial ? material : new MeshPhysicalMaterial();
      // Copy the standard surface without overwriting the physical material's coat defaults.
      if (finish !== material) MeshStandardMaterial.prototype.copy.call(finish, material);
      finish.defines.PHYSICAL = '';
      finish.roughness = preserveSharper ? Math.min(finish.roughness, roughness) : roughness;
      finish.clearcoatRoughness =
        preserveSharper && finish.clearcoat > 0
          ? Math.min(finish.clearcoatRoughness, coatRoughness)
          : coatRoughness;
      finish.clearcoat = 1;
      finish.needsUpdate = true;
      replacements.set(material, finish);
      return finish;
    };
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((material) => prepare(material as MeshStandardMaterial))
      : prepare(mesh.material as MeshStandardMaterial);
  });
  for (const [original, finish] of replacements) {
    if (original !== finish) original.dispose();
  }
}

export function prepareModelFinish(model: Object3D, file: string): void {
  if (Object.hasOwn(roadPaint, file))
    return prepareGlossPaint(model, roadPaint[file], 0.24, 0.06, true);
  if (file === 'ferrari-f1-75.glb') return prepareFerrariF1Finish(model);
  if (file === 'lamborghini-aventador.glb')
    return prepareGlossPaint(model, 'RED_PAINT', 0.23, 0.08);
  if (file === 'nissan-r35-aimgain.glb')
    return prepareGlossPaint(model, 'nNissan_GTRTNR4_2017PaintTNR_Material_002', 0.18, 0.06);
  if (file !== 'ferrari-296-gt3.glb') return;
  const visited = new Set<MeshPhysicalMaterial>();
  model.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const finish = material as MeshPhysicalMaterial;
      if (visited.has(finish)) continue;
      visited.add(finish);
      if (finish.name === 'mat_220') {
        // The livery sits over a separate shell. Keep it ahead of that coplanar surface.
        finish.polygonOffset = true;
        finish.polygonOffsetFactor = -2;
        finish.polygonOffsetUnits = -2;
        finish.metalness = 0;
        finish.roughness = 0.45;
        finish.clearcoat = 0.2;
        finish.clearcoatRoughness = 0.17;
      } else if (finish.name === 'Window') {
        finish.color.set('#a9b0b7');
        finish.metalness = 0;
        finish.roughness = 0.08;
        finish.opacity = 0.32;
        finish.depthWrite = false;
        finish.clearcoat = 0.2;
        finish.clearcoatRoughness = 0.04;
      } else continue;
      finish.needsUpdate = true;
    }
  });
}
