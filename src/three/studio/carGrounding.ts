import * as THREE from 'three';

type CarFootprint = { tires: THREE.Vector2[]; chassis: THREE.Vector4 };
const carFootprints = new WeakMap<THREE.Object3D, CarFootprint>();
export function studioCarFootprint(model: THREE.Object3D) {
  const cached = carFootprints.get(model);
  if (cached) return cached;

  model.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3();
  const box = new THREE.Box3();
  const meshes: { mesh: THREE.Mesh; bottom: number }[] = [];
  model.traverseVisible((mesh) => {
    if (!(mesh instanceof THREE.Mesh) || !mesh.geometry.attributes.position) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    if (!mesh.geometry.boundingBox) return;
    box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
    bounds.union(box);
    meshes.push({ mesh, bottom: box.min.y });
  });
  if (bounds.isEmpty()) return null;
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const corners = Array.from({ length: 4 }, (): [number, number, number][] => []);
  const point = new THREE.Vector3();

  for (const { mesh, bottom } of meshes) {
    if (bottom > bounds.min.y + 0.34) continue;
    const positions = mesh.geometry.attributes.position;
    for (let vertex = 0; vertex < positions.count; vertex++) {
      point.fromBufferAttribute(positions, vertex).applyMatrix4(mesh.matrixWorld);
      if (
        point.y > bounds.min.y + 0.31 ||
        Math.abs(point.x - center.x) < size.x * 0.21 ||
        Math.abs(point.z - center.z) < size.z * 0.13
      )
        continue;
      corners[(point.x >= center.x ? 1 : 0) + (point.z >= center.z ? 2 : 0)].push([
        point.x,
        point.y,
        point.z,
      ]);
    }
  }

  const tires = corners.map((points, index) => {
    if (!points.length)
      return new THREE.Vector2(
        center.x + (index & 1 ? 1 : -1) * size.x * 0.394,
        center.z + (index & 2 ? 1 : -1) * size.z * 0.272,
      );
    const lowest = points.reduce((value, p) => Math.min(value, p[1]), Infinity);
    const position = new THREE.Vector2();
    let count = 0;
    for (const [x, y, z] of points) {
      if (y > lowest + 0.065) continue;
      position.x += x;
      position.y += z;
      count++;
    }
    return position.multiplyScalar(1 / count);
  });
  const wheelbase = (tires[2].y + tires[3].y - tires[0].y - tires[1].y) / 2;
  const chassis = new THREE.Vector4(
    center.x,
    center.z,
    Math.max(0.42, size.x * 0.445),
    Math.max(0.79, wheelbase * 0.65),
  );
  const data = { tires, chassis };
  carFootprints.set(model, data);
  return data;
}

type Silhouette = { points: Float32Array; pose: number[]; minimum: number };
const mobileSilhouettes = new WeakMap<THREE.Object3D, Silhouette>();
export function studioMobileDistance(
  model: THREE.Object3D | null,
  azimuth: number,
  elevation: number,
  desired: number,
  targetY: number,
  width: number,
  height: number,
  fov: number,
) {
  if (!model || width <= 0 || height <= 0) return desired;
  let silhouette = mobileSilhouettes.get(model);
  if (!silhouette) {
    const meshes: THREE.Mesh[] = [];
    let count = 0;
    model.updateWorldMatrix(true, true);
    model.traverseVisible((mesh) => {
      if (!(mesh instanceof THREE.Mesh) || !mesh.geometry.attributes.position) return;
      meshes.push(mesh);
      count += mesh.geometry.attributes.position.count;
    });
    const points = new Float32Array(count * 3);
    const point = new THREE.Vector3();
    let index = 0;
    for (const mesh of meshes) {
      const positions = mesh.geometry.attributes.position;
      for (let vertex = 0; vertex < positions.count; vertex++) {
        point.fromBufferAttribute(positions, vertex).applyMatrix4(mesh.matrixWorld);
        points[index++] = point.x;
        points[index++] = point.y;
        points[index++] = point.z;
      }
    }
    silhouette = { points, pose: [], minimum: 0 };
    mobileSilhouettes.set(model, silhouette);
  }
  const pose = [azimuth, elevation, targetY, width, height, fov];
  const previousPose = silhouette.pose;
  if (pose.every((value, index) => previousPose[index] === value))
    return Math.max(desired, silhouette.minimum);

  const vertical = Math.tan((fov * Math.PI) / 360);
  const horizontal = ((vertical * width) / height) * Math.max(0.35, 1 - 32 / width);
  const sa = Math.sin(azimuth),
    ca = Math.cos(azimuth);
  const se = Math.sin(elevation),
    ce = Math.cos(elevation);
  const points = silhouette.points;
  let minimum = 0.1;
  for (let i = 0; i < points.length; i += 3) {
    const x = points[i],
      y = points[i + 1] - targetY,
      z = points[i + 2];
    const depth = (x * sa + z * ca) * ce + y * se;
    const across = x * ca - z * sa;
    const up = -(x * sa + z * ca) * se + y * ce;
    minimum = Math.max(
      minimum,
      depth + Math.abs(across) / horizontal,
      depth + Math.abs(up) / (vertical * 0.85),
    );
  }
  silhouette.pose = pose;
  silhouette.minimum = minimum;
  return Math.max(desired, minimum);
}
