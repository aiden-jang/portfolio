import * as THREE from 'three';
import type { ColorMaterial, Lamp } from '../types';

const TARGET_LENGTH = 4.5;
const FLAT_PLANE_THICKNESS = 0.15;
const FLAT_PLANE_MIN_FOOTPRINT = 0.3;
const FLAT_PLANE_MAX_Y = 0.1;
const MAX_MESH_DIM = 8;
const MAX_MESH_ASPECT = 6;

const HEADLIGHT_INTENSITY = 2.2;
const TAILLIGHT_INTENSITY = 2.5;
const HEADLIGHT_COLOR = 0xfff2cc;
const TAILLIGHT_COLOR = 0xff1f3a;
const LAMP_Y = 0.75;

export function makeRadialGlowTexture(onLoad?: () => void): THREE.Texture {
  const tex = new THREE.TextureLoader().load('/textures/underglow.png', () => onLoad?.());
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A loaded car owns its resources. GPU disposal does not release decoded ImageBitmaps;
// shared material and texture views must release each resource only once.
export function disposeModel(obj: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const bitmaps = new Set<ImageBitmap>();
  obj.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.geometry) geometries.add(m.geometry);
    if (m.material) {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) materials.add(mat);
    }
  });
  for (const material of materials) {
    for (const value of Object.values(material))
      if (value && (value as THREE.Texture).isTexture) textures.add(value as THREE.Texture);
    material.dispose();
  }
  for (const texture of textures) {
    const image = texture.image;
    if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) bitmaps.add(image);
    texture.dispose();
  }
  for (const geometry of geometries) geometry.dispose();
  for (const bitmap of bitmaps) bitmap.close();
}

// Thin glass needs transparency, not multisampled refraction buffers for every reflected view.
export function prepareModelGlass(model: THREE.Object3D): void {
  model.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const glass = material as THREE.MeshPhysicalMaterial;
      if (!(glass.transmission > 0)) continue;
      if (glass.opacity === 1) glass.opacity = Math.max(0.15, 1 - glass.transmission);
      glass.transmission = 0;
      glass.transparent = true;
      glass.depthWrite = false;
      glass.needsUpdate = true;
    }
  });
}

/** The returned `orientedSize` is measured before the scale is applied, not after. */
export function autoFitToLength(model: THREE.Object3D, orientationYaw = 0) {
  // Rotated local bounding boxes can include empty space beneath the wheels.
  // Measure actual vertices once at load time so framing seats the model on the floor.
  const rawSize = new THREE.Box3().setFromObject(model, true).getSize(new THREE.Vector3());
  if (rawSize.x > rawSize.z) model.rotation.y = Math.PI / 2;
  model.rotation.y += orientationYaw;
  const orientedSize = new THREE.Box3().setFromObject(model, true).getSize(new THREE.Vector3());
  const scale = TARGET_LENGTH / Math.max(orientedSize.z, 0.001);
  model.scale.setScalar(scale);
  const fitted = new THREE.Box3().setFromObject(model, true);
  const center = fitted.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= fitted.min.y;
  return { scale, orientedSize };
}

// Don't reach for `geometry.boundingBox` here. Under EXT_meshopt_compression the local positions
// are int16 normalized to [-1, 1], and only the world matrix puts them back in real units.
const _bbox = new THREE.Box3();
function worldBox(mesh: THREE.Mesh): THREE.Box3 | null {
  _bbox.setFromObject(mesh);
  return _bbox.isEmpty() ? null : _bbox;
}

export function hideBakedPlanes(model: THREE.Object3D): void {
  model.updateMatrixWorld(true);
  model.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (!m.isMesh) return;
    const bb = worldBox(m);
    if (!bb) return;
    const sx = bb.max.x - bb.min.x;
    const sy = bb.max.y - bb.min.y;
    const sz = bb.max.z - bb.min.z;
    if (
      sy < FLAT_PLANE_THICKNESS &&
      sx > FLAT_PLANE_MIN_FOOTPRINT &&
      sz > FLAT_PLANE_MIN_FOOTPRINT &&
      bb.min.y < FLAT_PLANE_MAX_Y
    ) {
      m.visible = false;
    }
  });
}

function isPaintName(name: string | undefined): boolean {
  if (!name) return false;
  const l = name.toLowerCase();
  if (l.includes('paint')) return true;
  return /(^|[_. -])body([_. -]|$)/.test(l);
}

// Below this, a name match is more likely a small "Body_Paint" trim than the body itself.
const NAME_MATCH_MIN_FRACTION = 0.25;
// Body paint is a solid color, while leather, dashboards and decals are textured, so penalising
// textured materials skews detection toward the paint.
const TEXTURED_PENALTY = 0.15;

type Mat = ColorMaterial & {
  transparent?: boolean;
  opacity?: number;
  map?: THREE.Texture | null;
};

export function detectBodyMaterial(
  model: THREE.Object3D,
  materialName?: string,
): ColorMaterial | null {
  if (materialName) {
    let selected: ColorMaterial | null = null;
    model.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible) return;
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        const candidate = material as ColorMaterial;
        if (candidate.name === materialName && candidate.color) selected = candidate;
      }
    });
    // A missing explicit target must disable paint instead of recoloring unrelated parts.
    return selected;
  }
  model.updateMatrixWorld(true);
  const rawByMat = new Map<Mat, number>();
  model.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (!m.isMesh || !m.geometry || !m.visible) return;
    const bb = worldBox(m);
    if (!bb) return;
    const sx = bb.max.x - bb.min.x;
    const sy = bb.max.y - bb.min.y;
    const sz = bb.max.z - bb.min.z;
    const longest = Math.max(sx, sy, sz);
    const shortest = Math.min(sx, sy, sz);
    if (longest > MAX_MESH_DIM) return;
    if (longest / Math.max(shortest, 0.01) > MAX_MESH_ASPECT) return;
    const idx = m.geometry.index;
    const tris = idx ? idx.count / 3 : (m.geometry.attributes.position?.count ?? 0) / 3;
    const score = tris * (sx * sy * sz);
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mat of mats) {
      const cmat = mat as Mat;
      if (!cmat?.color) continue;
      if (cmat.transparent && (cmat.opacity ?? 1) < 0.5) continue;
      if ((rawByMat.get(cmat) ?? 0) < score) rawByMat.set(cmat, score);
    }
  });

  const weightedScore = (mat: Mat, raw: number): number => {
    const c = mat.color!;
    const sat = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
    const satBoost = 1 + sat * 2;
    const texturePenalty = mat.map ? TEXTURED_PENALTY : 1;
    return raw * satBoost * texturePenalty;
  };

  let topScore = 0;
  let geometryBest: ColorMaterial | null = null;
  let nameBest: ColorMaterial | null = null;
  let nameBestScore = 0;
  for (const [mat, raw] of rawByMat) {
    const s = weightedScore(mat, raw);
    if (s > topScore) {
      topScore = s;
      geometryBest = mat;
    }
    if (isPaintName(mat.name) && s > nameBestScore) {
      nameBestScore = s;
      nameBest = mat;
    }
  }

  if (nameBest && nameBestScore >= topScore * NAME_MATCH_MIN_FRACTION) {
    return nameBest;
  }
  return geometryBest;
}

export function buildLamps(
  parent: THREE.Object3D,
  orientedSize: THREE.Vector3,
  scale: number,
  includeHeadlights = true,
): Lamp[] {
  const halfL = TARGET_LENGTH / 2;
  const halfW = (orientedSize.x * scale) / 2;
  const out: Lamp[] = [];
  const add = (color: number, x: number, z: number, intensity: number, isHeadlight: boolean) => {
    const pt = new THREE.PointLight(color, intensity, 7, 2);
    pt.position.set(x, LAMP_Y, z);
    parent.add(pt);
    out.push({ light: pt, baseIntensity: intensity, isHeadlight });
  };
  if (includeHeadlights) {
    add(HEADLIGHT_COLOR, -halfW * 0.62, halfL - 0.05, HEADLIGHT_INTENSITY, true);
    add(HEADLIGHT_COLOR, halfW * 0.62, halfL - 0.05, HEADLIGHT_INTENSITY, true);
  }
  add(TAILLIGHT_COLOR, -halfW * 0.68, -halfL + 0.05, TAILLIGHT_INTENSITY, false);
  add(TAILLIGHT_COLOR, halfW * 0.68, -halfL + 0.05, TAILLIGHT_INTENSITY, false);
  return out;
}
