import {
  Float32BufferAttribute,
  Matrix3,
  Quaternion,
  Vector3,
  MathUtils,
  type BufferGeometry,
} from 'three';

// Quantized vertices sampled from the stock lid and the painted rim around the opening.
const originalOuter = [
  [699, 2416, 13803],
  [732, 2498, 14120],
  [770, 2565, 14459],
  [792, 2596, 14633],
  [804, 2575, 14741],
];
const originalInner = [
  [1813, 2490, 13754],
  [1817, 2613, 14122],
  [1822, 2717, 14499],
  [1825, 2764, 14702],
  [1827, 2752, 14814],
];
const hoodOuter = [
  [699, 2410, 13797],
  [732, 2288, 14101],
  [770, 2142, 14414],
  [792, 2064, 14572],
  [804, 2016, 14660],
];
const hoodInner = [
  [1813, 2499, 13802],
  [1817, 2380, 14171],
  [1822, 2241, 14536],
  [1825, 2158, 14727],
  [1827, 2115, 14824],
];
const depthStops = [0, 0.31, 0.65, 0.85, 1];
const mirrorAxis = 7630;
const hingeAxis = new Vector3(1, 0, 0);

function edge(points: number[][], depth: number) {
  const index = depthStops.findIndex((stop) => stop > depth);
  const a = Math.max(0, (index === -1 ? depthStops.length - 1 : index) - 1);
  const t = (depth - depthStops[a]) / (depthStops[a + 1] - depthStops[a]);
  return new Vector3().fromArray(points[a]).lerp(new Vector3().fromArray(points[a + 1]), t);
}

function findLidCoordinates(x: number, z: number) {
  let near = 0;
  let far = 1;
  let u = 0;
  for (let iteration = 0; iteration < 13; iteration++) {
    const mid = (near + far) / 2;
    const outer = edge(originalOuter, mid);
    const inner = edge(originalInner, mid);
    u = MathUtils.clamp((x - outer.x) / (inner.x - outer.x), 0, 1);
    if (z > MathUtils.lerp(outer.z, inner.z, u)) near = mid;
    else far = mid;
  }
  return [u, (near + far) / 2];
}

export function prepareF40LidFit(
  geometry: BufferGeometry,
  side: number,
  pivot: Vector3,
  closeAngle: number,
) {
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const fittedPositions = new Float32Array(positions.count * 3);
  const fittedNormals = new Float32Array(normals.count * 3);
  const point = new Vector3();
  const close = new Quaternion().setFromAxisAngle(hingeAxis, closeAngle);
  const undo = close.clone().invert();

  function correction(rawX: number, z: number) {
    const x = side === 0 ? rawX : mirrorAxis - rawX;
    const [u, depth] = findLidCoordinates(x, z);
    const source = edge(originalOuter, depth).lerp(edge(originalInner, depth), u);
    // Preserve a narrow panel gap at all four edges.
    const seatedDepth = MathUtils.lerp(0.008, 0.992, depth);
    const target = edge(hoodOuter, seatedDepth).lerp(
      edge(hoodInner, seatedDepth),
      MathUtils.lerp(0.007, 0.993, u),
    );
    target.y -= 1.5;
    if (side === 1) {
      source.x = mirrorAxis - source.x;
      target.x = mirrorAxis - target.x;
    }
    const rotated = source.sub(pivot).applyQuaternion(close).add(pivot);
    return target.sub(rotated).applyQuaternion(undo);
  }

  const derivativeStep = 3;
  for (let vertex = 0; vertex < positions.count; vertex++) {
    const x = positions.getX(vertex);
    const z = positions.getZ(vertex);
    const delta = correction(x, z);
    point
      .fromBufferAttribute(positions, vertex)
      .add(delta)
      .toArray(fittedPositions, vertex * 3);
    const dx = correction(x + derivativeStep, z)
      .sub(correction(x - derivativeStep, z))
      .divideScalar(derivativeStep * 2);
    const dz = correction(x, z + derivativeStep)
      .sub(correction(x, z - derivativeStep))
      .divideScalar(derivativeStep * 2);
    const matrix = new Matrix3().set(1 + dx.x, 0, dz.x, dx.y, 1, dz.y, dx.z, 0, 1 + dz.z);
    const original = new Vector3().fromBufferAttribute(normals, vertex).normalize();
    original.applyNormalMatrix(matrix.invert().transpose()).toArray(fittedNormals, vertex * 3);
  }
  // Keep the fitted shape fixed through the entire hinge swing.
  geometry.setAttribute('position', new Float32BufferAttribute(fittedPositions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(fittedNormals, 3));
  geometry.computeBoundingSphere();
}
