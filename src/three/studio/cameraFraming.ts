import type { Camera, Object3D } from 'three';
import { studioCarFootprint } from './carGrounding';

export type StudioFraming = { rear: number; wheel: number };

export function placeCamera(
  camera: Camera,
  pose: { x: number; y: number; z: number },
  targetY: number,
  model: Object3D | null,
  wheelWeight: number,
) {
  const tire = wheelWeight && model ? studioCarFootprint(model)?.tires[3] : null;
  const x = (tire?.x ?? 0.83) * wheelWeight;
  const y = (0.49 - targetY) * wheelWeight;
  const z = ((tire?.y ?? 1.17) - 0.08) * wheelWeight;
  camera.position.set(pose.x + x, pose.y + y, pose.z + z);
  camera.lookAt(x, targetY + y, z);
}
