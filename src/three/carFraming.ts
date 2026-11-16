import { Box3, type Mesh, type Object3D } from 'three';
import { floorElevation } from './cameraPose';

export function fittedCarDistance(
  bounds: Box3,
  azimuth: number,
  elevation: number,
  distance: number,
  targetY: number,
  width: number,
  height: number,
  fov: number,
): number {
  if (bounds.isEmpty() || width <= 0 || height <= 0) return distance;
  const vertical = Math.tan((fov * Math.PI) / 360);
  const horizontal = vertical * (width / height) * Math.max(0.3, 1 - 48 / width);
  const sa = Math.sin(azimuth),
    ca = Math.cos(azimuth);
  const se = Math.sin(elevation),
    ce = Math.cos(elevation);
  let fitted = distance;
  for (let corner = 0; corner < 8; corner++) {
    const x = corner & 1 ? bounds.max.x : bounds.min.x;
    const y = (corner & 2 ? bounds.max.y : bounds.min.y) - targetY;
    const z = corner & 4 ? bounds.max.z : bounds.min.z;
    const depth = x * sa * ce + y * se + z * ca * ce;
    const across = x * ca - z * sa;
    const up = -x * sa * se + y * ce - z * ca * se;
    fitted = Math.max(
      fitted,
      depth + Math.abs(across) / horizontal,
      depth + Math.abs(up) / (vertical * 0.85),
    );
  }
  return fitted;
}

export class CarFraming {
  private model: Object3D | null = null;
  private bounds = new Box3();
  private part = new Box3();

  fit(
    model: Object3D | null,
    ...pose: Parameters<typeof fittedCarDistance> extends [Box3, ...infer P] ? P : never
  ): number {
    if (model !== this.model) {
      this.model = model;
      this.bounds.makeEmpty();
      model?.updateWorldMatrix(true, true);
      model?.traverseVisible((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingBox)
          this.bounds.union(
            this.part.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld),
          );
      });
    }
    const [azimuth, elevation, distance, targetY, width, height, fov] = pose;
    let fitted = fittedCarDistance(this.bounds, ...pose);
    // Pulling back changes the lowest safe elevation above the floor.
    for (let step = 0; step < 3 && elevation < floorElevation(fitted, targetY); step++) {
      fitted = fittedCarDistance(
        this.bounds,
        azimuth,
        floorElevation(fitted, targetY),
        fitted,
        targetY,
        width,
        height,
        fov,
      );
    }
    return Math.max(distance, fitted);
  }
}
