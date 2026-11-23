import { Box3, Mesh, Vector3, type Object3D } from 'three';
import { clamp } from '../math';
import { MIN_CAM_Y } from './cameraPose';

type Shot = {
  yaw: number;
  turn: number;
  elevation: number;
  hold: number;
  driftX?: number;
  rise?: number;
  targetHeight?: number;
  frameScale?: number;
};

const shots: Shot[] = [
  {
    yaw: 0.94,
    turn: -0.34,
    elevation: 0.15,
    hold: 1.9,
  },
  { yaw: Math.PI / 2 + 0.035, turn: -0.065, elevation: 0.1, hold: 1.38, driftX: 0.36 },
  {
    yaw: -0.023,
    turn: 0.046,
    elevation: 0,
    hold: 1.25,
    rise: 0,
    targetHeight: 0.72,
    frameScale: 0.78,
  },
  { yaw: -2.32, turn: -0.4, elevation: 0.17, hold: 1.85 },
  { yaw: -1.05, turn: 0.24, elevation: 1.14, hold: 1.9 },
];
const sharedDuration = shots.reduce((sum, shot) => sum + shot.hold, 0);
const models = new WeakMap<Object3D, { centerY: number; corners: Vector3[] }>();

function getFrame(model: Object3D) {
  const cached = models.get(model);
  if (cached) return cached;
  model.updateWorldMatrix(true, true);
  const bounds = new Box3();
  const part = new Box3();
  const vertex = new Vector3();
  model.traverseVisible((object) => {
    if (!(object instanceof Mesh)) return;
    const mesh = object.geometry;
    if (!mesh.boundingBox) mesh.computeBoundingBox();
    if (!mesh.boundingBox) return;
    part.copy(mesh.boundingBox).applyMatrix4(object.matrixWorld);
    // A tilted mesh's local box can extend well below the floor and make the car look too small.
    if (part.min.y < -MIN_CAM_Y) {
      const positions = mesh.getAttribute('position');
      part.makeEmpty();
      for (let index = 0; index < positions.count; index++) {
        object.getVertexPosition(index, vertex);
        part.expandByPoint(vertex.applyMatrix4(object.matrixWorld));
      }
    }
    bounds.union(part);
  });
  if (bounds.isEmpty()) return null;
  const corners: Vector3[] = [];
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) corners.push(new Vector3(x, y, z));
  const frame = { centerY: bounds.getCenter(new Vector3()).y, corners };
  models.set(model, frame);
  return frame;
}

export function sampleSharedGarageCamera(
  elapsed: number,
  model: Object3D,
  width: number,
  aspect: number,
  fov: number,
) {
  const frame = getFrame(model);
  if (!frame) return;
  const phone = width < 768;
  let time = elapsed % sharedDuration;
  let index = 0;
  while (index < shots.length - 1 && time >= shots[index].hold) {
    time -= shots[index].hold;
    index++;
  }
  const shot = shots[index];
  const progress = clamp(time / shot.hold, 0, 1);
  const yaw = shot.yaw + shot.turn * progress;
  const elevation = shot.elevation + (shot.rise ?? 0.035) * progress;
  const targetY = Math.max(MIN_CAM_Y, frame.centerY * (shot.targetHeight ?? 0.91));
  const drift = (shot.driftX ?? 0) * (phone ? 0.36 : 1);
  const vertical = Math.tan((fov * Math.PI) / 360);
  const horizontal = vertical * aspect;
  const frameWidth = ((phone ? 0.86 : 0.64) + progress * 0.035) * (shot.frameScale ?? 1);
  const frameHeight = phone ? 0.51 : 0.59;
  const sinYaw = Math.sin(yaw),
    cosYaw = Math.cos(yaw);
  const sinPitch = Math.sin(elevation),
    cosPitch = Math.cos(elevation);
  let distance = 3;
  for (const corner of frame.corners) {
    const y = corner.y - targetY;
    const along = corner.x * sinYaw + corner.z * cosYaw;
    const depth = along * cosPitch + y * sinPitch;
    const across = corner.x * cosYaw - corner.z * sinYaw;
    const up = -along * sinPitch + y * cosPitch;
    distance = Math.max(
      distance,
      depth + (Math.abs(across) + drift) / (horizontal * frameWidth),
      depth + Math.abs(up) / (vertical * frameHeight),
    );
  }
  return {
    yaw,
    elevation,
    distance,
    targetY,
    shiftX: drift * (2 * progress - 1),
    shiftY: phone && elevation > 1 ? 0.09 : 0,
    wheel: false,
  };
}
