import { type Mesh, type MeshPhysicalMaterial, type Object3D } from 'three';

// The livery sits over a separate shell. Keep it ahead of that coplanar surface.
export function prepareModelFinish(model: Object3D, file: string): void {
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
