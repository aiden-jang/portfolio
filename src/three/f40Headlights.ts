import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from 'three';
import { prepareF40LidFit } from './f40LidFit';
import headlightFaces from './f40HeadlightFaces.json';

const RAISED_LENS = 'material_14';
const CLOSE_ANGLE = 0.655;
const TRAVEL_MS = 720;
const hinges = [
  [1256, 2455, 13800],
  [6374, 2455, 13800],
];

const sourceShape = {
  Metallic: [13735, 57174],
  Translucent: [3735, 17880],
  [RAISED_LENS]: [762, 3000],
} as const;

type Surface = keyof typeof sourceShape;

type SurfaceMeshes = Map<Surface, Mesh<BufferGeometry, MeshStandardMaterial>>;

function movingGeometry(source: BufferGeometry, faces: number[]) {
  const vertices: number[] = [];
  const remap = new Map<number, number>();
  const indices: number[] = [];
  const sourceIndex = source.index!.array;
  for (const face of faces) {
    for (const vertex of sourceIndex.subarray(face * 3, face * 3 + 3)) {
      let index = remap.get(vertex);
      if (index === undefined) {
        index = vertices.length;
        remap.set(vertex, index);
        vertices.push(vertex);
      }
      indices.push(index);
    }
  }
  const geometry = new BufferGeometry();
  for (const [name, attribute] of Object.entries(source.attributes)) {
    const width = attribute.itemSize;
    const values = new Float32Array(vertices.length * width);
    for (const [index, vertex] of vertices.entries()) {
      for (let component = 0; component < width; component++) {
        values[index * width + component] = attribute.getComponent(vertex, component);
      }
    }
    geometry.setAttribute(name, new Float32BufferAttribute(values, width));
  }
  return geometry.setIndex(indices);
}

function splitHeadlights(surfaces: SurfaceMeshes, parent: Object3D) {
  const pivots = hinges.map((point) => {
    const pivot = new Group();
    pivot.position.fromArray(point);
    pivot.visible = false;
    parent.add(pivot);
    return pivot;
  });
  const bulbs: MeshStandardMaterial[] = [];
  const ownedMaterials: MeshStandardMaterial[] = [];
  const stationary = Array.from(surfaces, ([name, mesh]) => {
    const original = mesh.geometry;
    const indices = original.index!.array;
    const faces = headlightFaces[name];
    const movingFaces = new Set(faces.flat());
    const separated = original.clone();
    separated.setIndex(Array.from(indices).filter((_, i) => !movingFaces.has(Math.floor(i / 3))));
    for (const [side, pivot] of pivots.entries()) {
      const geometry = movingGeometry(original, faces[side]);
      prepareF40LidFit(geometry, side, pivot.position, CLOSE_ANGLE);
      // The moving glass and bulbs have their own lighting, separate from the fixed lamps.
      const material = name === 'Metallic' ? mesh.material : mesh.material.clone();
      if (material !== mesh.material) ownedMaterials.push(material);
      if (name === RAISED_LENS) bulbs.push(material);
      const piece = new Mesh(geometry, material);
      piece.position.copy(pivot.position).negate();
      pivot.add(piece);
    }
    return { mesh, original, separated };
  });

  return { pivots, bulbs, ownedMaterials, stationary };
}

export function createF40Headlights(model: Object3D) {
  const surfaces: SurfaceMeshes = new Map();
  model.traverse((node) => {
    if (node instanceof Mesh && node.material instanceof MeshStandardMaterial) {
      const name = node.material.name as Surface;
      if (Object.hasOwn(sourceShape, name)) surfaces.set(name, node);
    }
  });
  const parent = surfaces.get('Metallic')?.parent;
  if (!parent || surfaces.size !== Object.keys(sourceShape).length) return null;
  for (const [name, mesh] of surfaces) {
    const [vertices, indices] = sourceShape[name];
    if (
      mesh.parent !== parent ||
      mesh.geometry.index?.count !== indices ||
      mesh.geometry.getAttribute('position')?.count !== vertices ||
      !mesh.geometry.hasAttribute('normal')
    )
      return null;
  }

  let rig: ReturnType<typeof splitHeadlights> | undefined;
  let active = false;
  let position = 1;
  let target = 1;
  let from = position;
  let start = 0;
  let duration = 0;
  let beam = 1;

  const setActive = (value: boolean) => {
    if (active === value) return;
    active = value;
    rig ??= splitHeadlights(surfaces, parent);
    for (const { mesh, original, separated } of rig.stationary) {
      mesh.geometry = active ? separated : original;
    }
    for (const pivot of rig.pivots) pivot.visible = active;
  };

  return {
    setActive,
    setRaised(raised: boolean, immediate = false) {
      const next = Number(raised);
      if (immediate || !active) {
        target = position = next;
        duration = 0;
      } else if (target !== next) {
        from = position;
        target = next;
        start = performance.now();
        duration = TRAVEL_MS * Math.abs(target - from);
      }
    },
    update(_dt: number, lampLevel = 0) {
      if (!active || !rig) return;
      if (duration) {
        const progress = MathUtils.clamp((performance.now() - start) / duration, 0, 1);
        position = MathUtils.lerp(from, target, progress);
        if (progress === 1) duration = 0;
      }
      const opening = MathUtils.smoothstep(position, 0, 1);
      beam = MathUtils.smoothstep(opening, 0.88, 1);
      for (const pivot of rig.pivots) pivot.rotation.x = CLOSE_ANGLE * (1 - opening);
      for (const bulb of rig.bulbs) bulb.emissiveIntensity = beam * lampLevel * 3.6;
    },
    get beam() {
      return active ? beam : undefined;
    },
    dispose() {
      setActive(false);
      if (!rig) return;
      for (const { separated } of rig.stationary) separated.dispose();
      for (const material of rig.ownedMaterials) material.dispose();
      for (const pivot of rig.pivots) {
        for (const piece of pivot.children) if (piece instanceof Mesh) piece.geometry.dispose();
        pivot.removeFromParent();
      }
    },
  };
}
