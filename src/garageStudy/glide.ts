import { prefersReducedMotion } from '../hooks/reducedMotion';
import { repaintStudio } from '../garageStudio/state';
import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { track, useGarageStudy } from './state';
import { truckFocus, truckPhone, truckWide } from './lineupTruck';
import { useLineup } from '../lineup/state';

function path(points: [number, number, number][]) {
  return new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
}

const bumper = path([
  [2.25, 0.83, 4.7],
  [1.3, 0.69, 3.7],
  [0.1, 0.64, 3.44],
  [-1.5, 0.72, 3.92],
]);
const bumperSubject = new Vector3(0, 0.37, 1.58);
const eye = new Vector3();
const look = new Vector3();

export function frameGlide(
  camera: PerspectiveCamera,
  currentTarget: Vector3,
  phoneSize: boolean,
  dt: number,
  reduced: boolean,
  bumperGlide: boolean,
) {
  const { playing } = useGarageStudy.getState();
  if (playing && reduced) useGarageStudy.setState({ playing: false });
  const delta = Math.min(dt, bumperGlide ? 0.064 : 0.2);
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
  if (
    playing &&
    !reduced &&
    track.entry >= 1 &&
    (bumperGlide || useLineup.getState().status === 'ready') &&
    !document.hidden
  ) {
    track.position = Math.min(1, track.position + delta / (bumperGlide ? 3.4 : 4.25));
    if (track.position === 1) useGarageStudy.setState({ playing: false });
  }
  const time = track.position;
  const t = time * time * (3 - 2 * time);
  const entry = track.entry * track.entry * (3 - 2 * track.entry);
  (bumperGlide ? bumper : phoneSize ? truckPhone : truckWide).getPoint(t, eye);
  if (bumperGlide) {
    look.copy(bumperSubject);
    if (phoneSize) eye.z += 0.9;
  } else {
    truckFocus.getPoint(t, look);
    if (phoneSize) look.x -= 0.82 * MathUtils.smoothstep(t, 0.58, 1);
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
  const fov = bumperGlide ? (phoneSize ? 51 : 38) : phoneSize ? MathUtils.lerp(54, 65, t) : 40;
  camera.fov = MathUtils.lerp(track.fromFov, fov, entry);
  camera.updateProjectionMatrix();
  camera.lookAt(currentTarget);
}

export function startBumperGlide() {
  track.position = 0;
  track.entry = 0;
  useGarageStudy.setState({ camera: 'glide', playing: !prefersReducedMotion() });
  repaintStudio();
}
