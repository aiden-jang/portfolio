import * as THREE from 'three';
import type { ColorMaterial, Lamp } from '../types';

const TARGET_LENGTH = 4.5;
const FLAT_PLANE_THICKNESS = 0.15;
const FLAT_PLANE_MIN_FOOTPRINT = 0.3;
const FLAT_PLANE_MAX_Y = 0.1;
const MAX_MESH_DIM = 8;
const MAX_MESH_ASPECT = 6;

const HEADLIGHT_INTENSITY = 3.5;
const TAILLIGHT_INTENSITY = 2.5;
const HEADLIGHT_COLOR = 0xfff2cc;
const TAILLIGHT_COLOR = 0xff1f3a;
const LAMP_Y = 0.75;

/** Soft radial alpha texture used for the underglow disc. */
export function makeRadialGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1.0)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.7)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.22)');
  g.addColorStop(1.0, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Recursively dispose every geometry + material under `obj`. */
export function disposeModel(obj: THREE.Object3D): void {
  obj.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    if (m.material) {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) mat.dispose();
    }
  });
}

/** Rotate (if length is along X), scale to TARGET_LENGTH along Z, then
 *  center on X/Z and pin the base to y=0. Returns the applied uniform scale
 *  and the pre-scale oriented size. */
export function autoFitToLength(model: THREE.Object3D) {
  const rawSize = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  if (rawSize.x > rawSize.z) model.rotation.y = Math.PI / 2;
  const orientedSize = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  const scale = TARGET_LENGTH / Math.max(orientedSize.z, 0.001);
  model.scale.setScalar(scale);
  const fitted = new THREE.Box3().setFromObject(model);
  const center = fitted.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= fitted.min.y;
  return { scale, orientedSize };
}

/** Compute a mesh's bounding box in WORLD space. We can't trust the geometry's
 *  local boundingBox after `EXT_meshopt_compression` — positions there are
 *  normalized int16 (values in [-1, 1]) that only reach real-world units after
 *  the world-matrix dequantization applied per-frame. `Box3.setFromObject`
 *  handles this for us. */
const _bbox = new THREE.Box3();
function worldBox(mesh: THREE.Mesh): THREE.Box3 | null {
  _bbox.setFromObject(mesh);
  return _bbox.isEmpty() ? null : _bbox;
}

/** Hide flat ground/shadow/decal planes baked into the GLB. */
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

/** Fraction of the top weighted score a name-matched candidate must reach
 *  to be trusted. Below this it's likely a tiny "Body_Paint" trim material on
 *  a non-body mesh, and we should fall back to the geometry winner instead. */
const NAME_MATCH_MIN_FRACTION = 0.25;
/** Multiplier applied to textured (baseColorMap) materials. Cars usually use
 *  textures for interior leather / dashboards / decals, while body paint is
 *  a solid color. Penalising textured materials skews detection toward paint. */
const TEXTURED_PENALTY = 0.15;

type Mat = ColorMaterial & {
  transparent?: boolean;
  opacity?: number;
  map?: THREE.Texture | null;
};

/** Two-pass body-material detection. For each candidate material:
 *    score = tris × bbox-volume   (raw "size" of the mesh it sits on)
 *    weight = (1 + saturation × 2) × (textured ? 0.15 : 1)
 *  Materials named "paint" / "body" win iff their weighted score is at least
 *  25% of the top weighted score (so a tiny "Body_Paint" trim doesn't fool us). */
export function detectBodyMaterial(model: THREE.Object3D): ColorMaterial | null {
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

/** Attach front headlights + rear taillights as PointLights at the car's
 *  bumper extents. Returns the new Lamp[] for the caller to track. */
export function buildLamps(parent: THREE.Object3D, orientedSize: THREE.Vector3, scale: number): Lamp[] {
  const halfL = TARGET_LENGTH / 2;
  const halfW = (orientedSize.x * scale) / 2;
  const out: Lamp[] = [];
  const add = (color: number, x: number, z: number, intensity: number, isHeadlight: boolean) => {
    const pt = new THREE.PointLight(color, intensity, 7, 2);
    pt.position.set(x, LAMP_Y, z);
    parent.add(pt);
    out.push({ light: pt, baseIntensity: intensity, isHeadlight });
  };
  add(HEADLIGHT_COLOR, -halfW * 0.62, halfL - 0.05, HEADLIGHT_INTENSITY, true);
  add(HEADLIGHT_COLOR, halfW * 0.62, halfL - 0.05, HEADLIGHT_INTENSITY, true);
  add(TAILLIGHT_COLOR, -halfW * 0.68, -halfL + 0.05, TAILLIGHT_INTENSITY, false);
  add(TAILLIGHT_COLOR, halfW * 0.68, -halfL + 0.05, TAILLIGHT_INTENSITY, false);
  return out;
}
