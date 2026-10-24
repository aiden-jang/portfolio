import { Mesh, MeshStandardMaterial, Quaternion, Vector3, type Object3D } from 'three';
import type { CarSpec, Lamp } from '../types';

export function createDRS(model: Object3D, settings: CarSpec['drs']) {
  if (!settings) return null;
  const joint = model.getObjectByName(settings.node);
  if (!joint) return null;
  const resting = joint.quaternion.clone();
  const rotation = new Quaternion();
  const axis = new Vector3(1, 0, 0);
  let position = 0;
  let target = 0;
  const sample = () => {
    const eased = position * position * (3 - 2 * position);
    rotation.setFromAxisAngle(axis, settings.openAngle * eased);
    joint.quaternion.copy(resting).multiply(rotation);
  };
  return {
    setOpen(open: boolean, immediate = false) {
      target = open ? 1 : 0;
      if (immediate) {
        position = target;
        sample();
      }
    },
    update(dt: number) {
      if (position === target) return;
      const step = Math.min(dt, 0.1) / 0.5;
      position += Math.sign(target - position) * Math.min(Math.abs(target - position), step);
      sample();
    },
    dispose() {
      joint.quaternion.copy(resting);
    },
  };
}

export function createHeadlightFlash(model: Object3D, materialName?: string, lamps: Lamp[] = []) {
  if (!materialName) return null;
  let selected: Mesh | null = null;
  model.traverse((object) => {
    if (
      object instanceof Mesh &&
      object.material instanceof MeshStandardMaterial &&
      object.material.name === materialName
    )
      selected = object;
  });
  const mesh = selected as Mesh | null;
  if (!mesh) return null;
  const originalGeometry = mesh.geometry;
  const originalMaterial = mesh.material as MeshStandardMaterial;
  const positions = originalGeometry.getAttribute('position');
  if (!positions) return null;
  model.updateMatrixWorld(true);
  const front: number[] = [];
  const other: number[] = [];
  const point = new Vector3();
  const indices = originalGeometry.index;
  for (let i = 0; i < (indices?.count ?? positions.count); i += 3) {
    const triangle = [0, 1, 2].map((offset) => (indices ? indices.getX(i + offset) : i + offset));
    const headlight = triangle.every(
      (index) => point.fromBufferAttribute(positions, index).applyMatrix4(mesh.matrixWorld).z > 0,
    );
    (headlight ? front : other).push(...triangle);
  }
  if (!front.length) return null;
  // This source shares its lamp material front and rear. Only front triangles may glow.
  const geometry = originalGeometry.clone();
  geometry.setIndex([...other, ...front]);
  geometry.clearGroups();
  geometry.addGroup(0, other.length, 0);
  geometry.addGroup(other.length, front.length, 1);
  const glowing = originalMaterial.clone();
  glowing.emissive.setHex(0xfff2d8);
  glowing.emissiveIntensity = 0;
  mesh.geometry = geometry;
  mesh.material = [originalMaterial, glowing];
  const headlights = lamps.filter(({ isHeadlight }) => isHeadlight);
  let elapsed = 1;
  let reduced = false;
  const brightness = (amount: number) => {
    glowing.emissiveIntensity = amount * 5;
    for (const lamp of headlights) lamp.light.intensity = lamp.baseIntensity * (1 + amount * 2);
  };
  return {
    trigger(reduceMotion = false) {
      if (elapsed < 0.7) return false;
      elapsed = 0;
      reduced = reduceMotion;
      brightness(1);
      return true;
    },
    update(dt: number) {
      if (elapsed >= 0.7) return false;
      elapsed = Math.min(0.7, elapsed + Math.max(dt, 0));
      const amount = elapsed >= 0.7 ? 0 : reduced ? 1 : Math.min((0.7 - elapsed) / 0.2, 1);
      brightness(amount);
      return elapsed < 0.7;
    },
    dispose() {
      brightness(0);
      mesh.geometry = originalGeometry;
      mesh.material = originalMaterial;
      geometry.dispose();
      glowing.dispose();
    },
  };
}
