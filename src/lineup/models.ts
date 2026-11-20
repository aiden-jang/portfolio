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

export async function loadLineup(signal: AbortSignal, porsche = false) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const pair = new AbortController();
  const downloads = AbortSignal.any([signal, pair.signal]);
  // Settle both downloads so the sibling's decoded textures can be released on failure.
  const first = porsche ? CARS[7] : F40;
  const second = porsche ? CARS[3] : RB16B;
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
    const ferrariLength = new Box3().setFromObject(f40, true).getSize(new Vector3()).z;
    const cars = porsche
      ? ([
          place(f40, 2.272 / turboAxles(f40), 1.34, 2.3),
          place(rb16b, 2.272 / rwbAxles(rb16b), -1.34, -2.3),
        ] as const)
      : ([
          place(f40, F40_LENGTH / ferrariLength, -1.73, 1.38),
          place(rb16b, PIRELLI_DIAMETER / measureFrontTires(rb16b), 1.44, -1.3),
        ] as const);
    return {
      cars,
      points: cars.flatMap(({ bounds }) => corners(bounds)),
      tuneFerrari: porsche ? undefined : tuneStudioFerrari(f40),
      tuneRedBull: porsche ? undefined : tuneStudyMaterials(rb16b, RB16B.file),
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

function turboAxles(model: Object3D) {
  const front = model.getObjectByName('Circle001_16');
  const rear = model.getObjectByName('Circle003_13');
  if (!front || !rear) throw Error('The Turbo axle geometry could not be found.');
  return Math.abs(
    new Box3().setFromObject(front, true).getCenter(new Vector3()).z -
      new Box3().setFromObject(rear, true).getCenter(new Vector3()).z,
  );
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
  return axles[1].getCenter(vertex).z - axles[0].getCenter(vertex).z;
}
