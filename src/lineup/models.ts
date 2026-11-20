import { createDRS } from '../three/carDetails';
import { CARS } from '../config';
import { tuneStudyMaterials } from '../garageStudy/materials';
import { Box3, Group, Mesh, Vector3, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  autoFitToLength,
  disposeModel,
  detectBodyMaterial,
  hideBakedPlanes,
  prepareModelGlass,
} from '../three/carHelpers';
import { loadCarModel } from '../three/loadCarModel';
import { prepareModelFinish } from '../three/modelFinishes';
import { studioCarFootprint } from '../three/studio/carGrounding';
import { tuneStudioFerrari } from '../three/studio/ferrariMaterials';
import { F40, F40_LENGTH, RB16B } from './vehicles';

const PIRELLI_DIAMETER = 0.67;

export const ALIGNED_FRONT_AXLE = 1.2;
export type LineupKind = 'original' | 'porsche' | 'aligned' | 'race';

export async function loadLineup(signal: AbortSignal, kind: LineupKind) {
  const porsche = kind === 'porsche' || kind === 'aligned';
  const race = kind === 'race';
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const pair = new AbortController();
  const downloads = AbortSignal.any([signal, pair.signal]);
  // Settle both downloads so the sibling's decoded textures can be released on failure.
  const first = porsche ? CARS[7] : race ? RB16B : F40;
  const second = porsche ? CARS[3] : race ? CARS[16] : RB16B;
  const [ferrari, redBull] = await Promise.allSettled(
    [first, second].map(({ file }) =>
      loadCarModel(loader, `/models/${file}`, downloads).catch((error: unknown) => {
        pair.abort(error);
        throw error;
      }),
    ),
  );
  try {
    signal.throwIfAborted();
    if (ferrari.status === 'rejected') throw ferrari.reason;
    if (redBull.status === 'rejected') throw redBull.reason;
    const f40 = ferrari.value.scene;
    const rb16b = redBull.value.scene;
    prepare(f40, first);
    prepare(rb16b, second);
    if (porsche) {
      detectBodyMaterial(f40, first.paintMaterial)?.color?.set(first.defaultPaint.hex);
      detectBodyMaterial(rb16b, second.paintMaterial)?.color?.set(second.defaultPaint.hex);
    }
    const cars = stageCars(f40, rb16b, kind);
    return {
      cars,
      points: cars.flatMap(({ bounds }) => corners(bounds)),
      wings: race ? [createDRS(f40, first.drs), createDRS(rb16b, second.drs)] : [],
      tuneFerrari: kind === 'original' ? tuneStudioFerrari(f40) : undefined,
      tuneRedBull: kind === 'original' ? tuneStudyMaterials(rb16b, RB16B.file) : undefined,
      dispose: () => {
        disposeModel(f40);
        disposeModel(rb16b);
      },
    };
  } catch (error) {
    for (const result of [ferrari, redBull])
      if (result.status === 'fulfilled') disposeModel(result.value.scene);
    throw error;
  }
}

function prepare(model: Object3D, car: typeof F40) {
  autoFitToLength(model, car.orientationYaw);
  if (!car.preserveFlatMeshes) hideBakedPlanes(model);
  prepareModelGlass(model);
  prepareModelFinish(model, car.file);
}

function stageCars(first: Object3D, second: Object3D, kind: LineupKind) {
  if (kind === 'race') {
    return [
      place(first, PIRELLI_DIAMETER / measureFrontTires(first), -1.26, 0.1),
      place(second, 0.72 / measureFrontTires(second, ['TYRE_LF_248', 'TYRE_RF_280']), 1.26, 0.1),
    ] as const;
  }
  if (kind === 'porsche' || kind === 'aligned') {
    const turbo = turboAxles(first);
    const rwb = rwbAxles(second);
    const turboScale = 2.272 / (turbo.front - turbo.rear);
    const rwbScale = 2.272 / (rwb.front - rwb.rear);
    return [
      place(
        first,
        turboScale,
        1.34,
        kind === 'aligned' ? ALIGNED_FRONT_AXLE - turbo.front * turboScale : 2.3,
      ),
      place(
        second,
        rwbScale,
        -1.34,
        kind === 'aligned' ? ALIGNED_FRONT_AXLE - rwb.front * rwbScale : -2.3,
      ),
    ] as const;
  }
  const length = new Box3().setFromObject(first, true).getSize(new Vector3()).z;
  return [
    place(first, F40_LENGTH / length, -1.73, 1.38),
    place(second, PIRELLI_DIAMETER / measureFrontTires(second), 1.44, -1.3),
  ] as const;
}

function measureFrontTires(model: Object3D, names = ['TYRE_RF_540', 'TYRE_LF_554']) {
  const diameters = names.map((name) => {
    const tyre = model.getObjectByName(name);
    if (!tyre) throw new Error('Missing race car front tire.');
    return new Box3().setFromObject(tyre, true).getSize(new Vector3()).z;
  });
  const diameter = (diameters[0] + diameters[1]) / 2;
  if (!(diameter > 0)) throw new Error('Invalid race car front tire diameter.');
  return diameter;
}

function place(model: Object3D, scale: number, x: number, z: number) {
  const group = new Group();
  group.add(model);
  group.scale.setScalar(scale);
  const bounds = new Box3().setFromObject(group, true);
  const center = bounds.getCenter(new Vector3());
  group.position.set(x - center.x, 0.004 - bounds.min.y, z - center.z);
  bounds.translate(group.position);
  const footprint = studioCarFootprint(model);
  if (!footprint) throw new Error('Missing car contact patches.');
  return { group, bounds, footprint, length: bounds.max.z - bounds.min.z };
}

function corners({ min, max }: Box3) {
  return [min.x, max.x].flatMap((x) =>
    [min.y, max.y].flatMap((y) => [min.z, max.z].map((z) => new Vector3(x, y, z))),
  );
}

function turboAxles(model: Object3D) {
  const front = model.getObjectByName('Circle001_16');
  const rear = model.getObjectByName('Circle003_13');
  if (!front || !rear) throw Error('The Turbo axle geometry could not be found.');
  const center = new Vector3();
  const bounds = new Box3();
  return {
    front: bounds.setFromObject(front, true).getCenter(center).z,
    rear: bounds.setFromObject(rear, true).getCenter(center).z,
  };
}

function rwbAxles(model: Object3D) {
  const axles = [new Box3(), new Box3()];
  const vertex = new Vector3();
  model.updateMatrixWorld(true);
  model.traverse((part) => {
    if (!(part instanceof Mesh) || Array.isArray(part.material) || part.material.name !== 'M_Tires')
      return;
    const position = part.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i).applyMatrix4(part.matrixWorld);
      axles[vertex.z < 0 ? 0 : 1].expandByPoint(vertex);
    }
  });
  if (axles.some((bounds) => bounds.isEmpty()))
    throw Error('The RWB tire geometry could not be found.');
  return { front: axles[1].getCenter(vertex).z, rear: axles[0].getCenter(vertex).z };
}
