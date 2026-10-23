import { type Mesh, MeshPhysicalMaterial, MeshStandardMaterial, type Object3D } from 'three';

function prepareAventadorPaint(model: Object3D): void {
  const replacements = new Map<MeshStandardMaterial, MeshPhysicalMaterial>();
  model.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const prepare = (material: MeshStandardMaterial) => {
      if (!material.isMeshStandardMaterial || material.name !== 'RED_PAINT') return material;
      if (replacements.has(material)) return replacements.get(material)!;
      const finish =
        material instanceof MeshPhysicalMaterial ? material : new MeshPhysicalMaterial();
      // Copy the standard surface without overwriting the physical material's coat defaults.
      if (finish !== material) MeshStandardMaterial.prototype.copy.call(finish, material);
      finish.defines.PHYSICAL = '';
      finish.roughness = 0.23;
      finish.clearcoat = 1;
      finish.clearcoatRoughness = 0.08;
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
  if (file === 'lamborghini-aventador.glb') return prepareAventadorPaint(model);
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
