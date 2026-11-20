import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { track, useGarageStudy } from './state';

function path(points: [number, number, number][]) {
  return new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
}

const desktop = path([
  [-4.0, 1.43, -2.83],
  [-2.6, 1.29, -1.91],
  [-1.05, 1.24, -1.5],
  [-0.17, 1.18, -2.48],
  [-0.35, 1.23, -4.26],
  [0.51, 1.39, -6.1],
  [2.94, 1.93, -8.1],
]);
const phone = path([
  [-4.58, 1.7, -3.69],
  [-2.96, 1.48, -2.29],
  [-1.22, 1.34, -1.84],
  [-0.25, 1.28, -2.8],
  [-0.45, 1.39, -4.92],
  [0.51, 1.61, -6.88],
  [2.38, 2.23, -9.7],
]);
const subjects = path([
  [-0.88, 0.88, -0.51],
  [-0.66, 0.91, -0.77],
  [0.46, 0.76, -0.66],
  [1.02, 0.7, -1.07],
  [1.35, 0.65, -1.63],
  [1.4, 0.58, -1.42],
  [1.42, 0.53, -1.28],
]);
const eye = new Vector3();
const look = new Vector3();

export function frameGlide(
  camera: PerspectiveCamera,
  currentTarget: Vector3,
  phoneSize: boolean,
  dt: number,
  reduced: boolean,
) {
  const { playing } = useGarageStudy.getState();
  const delta = Math.min(dt, 0.064);
  if (!track.entry) {
    track.fromX = camera.position.x;
    track.fromY = camera.position.y;
    track.fromZ = camera.position.z;
    track.fromFov = camera.fov;
    track.targetX = currentTarget.x;
    track.targetY = currentTarget.y;
    track.targetZ = currentTarget.z;
  }
  track.entry = reduced ? 1 : Math.min(1, track.entry + delta / 0.72);
  if (playing && track.entry >= 1) {
    track.position = Math.min(1, track.position + delta / 6.2);
    if (track.position === 1) useGarageStudy.setState({ playing: false });
  }
  const time = track.position;
  const t = time * time * (3 - 2 * time);
  const entry = track.entry * track.entry * (3 - 2 * track.entry);
  (phoneSize ? phone : desktop).getPoint(t, eye);
  subjects.getPoint(t, look);
  if (phoneSize) {
    const reveal = MathUtils.smoothstep(t, 0.6, 1);
    look.x -= 0.76 * reveal;
    look.y += 0.12;
    look.z += 0.36 * reveal;
  }
  camera.position.set(
    MathUtils.lerp(track.fromX, eye.x, entry),
    MathUtils.lerp(track.fromY, eye.y, entry),
    MathUtils.lerp(track.fromZ, eye.z, entry),
  );
  currentTarget.set(
    MathUtils.lerp(track.targetX, look.x, entry),
    MathUtils.lerp(track.targetY, look.y, entry),
    MathUtils.lerp(track.targetZ, look.z, entry),
  );
  const fov = phoneSize ? 65 : 44;
  camera.fov = MathUtils.lerp(track.fromFov, fov, entry);
  camera.updateProjectionMatrix();
  camera.lookAt(currentTarget);
}
