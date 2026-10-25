import { Camera, Object3D, Raycaster, Vector2 } from 'three';

type Bounds = { left: number; top: number; width: number; height: number };

export function hitsCar(
  model: Object3D | null,
  camera: Camera,
  bounds: Bounds,
  x: number,
  y: number,
): boolean {
  if (!model || bounds.width <= 0 || bounds.height <= 0) return false;
  const point = new Vector2(
    ((x - bounds.left) / bounds.width) * 2 - 1,
    (-(y - bounds.top) / bounds.height) * 2 + 1,
  );
  if (Math.abs(point.x) > 1 || Math.abs(point.y) > 1) return false;
  model.updateWorldMatrix(true, true);
  camera.updateWorldMatrix(true, false);
  const ray = new Raycaster();
  ray.setFromCamera(point, camera);
  return ray.intersectObject(model, true).some(({ object }) => {
    for (let parent: Object3D | null = object; parent; parent = parent.parent) {
      if (!parent.visible) return false;
    }
    return true;
  });
}
