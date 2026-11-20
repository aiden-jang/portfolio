import { Box3, Group, Vector3, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  autoFitToLength,
  disposeModel,
  hideBakedPlanes,
  prepareModelGlass,
} from '../three/carHelpers';
import { loadCarModel } from '../three/loadCarModel';
import { prepareModelFinish } from '../three/modelFinishes';
import { studioCarFootprint } from '../three/studio/carGrounding';
import { tuneStudioFerrari } from '../three/studio/ferrariMaterials';
import { F40, F40_LENGTH, RB16B } from './vehicles';

const PIRELLI_DIAMETER = 0.67;

export async function loadLineup(signal: AbortSignal) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const pair = new AbortController();
  const downloads = AbortSignal.any([signal, pair.signal]);
  // Settle both downloads so the sibling's decoded textures can be released on failure.
  const [ferrari, redBull] = await Promise.allSettled(
    [F40, RB16B].map(({ file }) =>
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
    prepare(f40, F40);
    prepare(rb16b, RB16B);
    const ferrariLength = new Box3().setFromObject(f40, true).getSize(new Vector3()).z;
    const cars = [
      place(f40, F40_LENGTH / ferrariLength, -1.73, 1.38),
      place(rb16b, PIRELLI_DIAMETER / measureFrontTires(rb16b), 1.44, -1.3),
    ] as const;
    return {
      cars,
      points: cars.flatMap(({ bounds }) => corners(bounds)),
      tuneFerrari: tuneStudioFerrari(f40),
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

function measureFrontTires(model: Object3D) {
  const diameters = ['TYRE_RF_540', 'TYRE_LF_554'].map((name) => {
    const tyre = model.getObjectByName(name);
    if (!tyre) throw new Error('Missing RB16B front tire.');
    return new Box3().setFromObject(tyre, true).getSize(new Vector3()).z;
  });
  const diameter = (diameters[0] + diameters[1]) / 2;
  if (!(diameter > 0)) throw new Error('Invalid RB16B front tire diameter.');
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
