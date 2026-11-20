import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Fog, MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { nearestAngle, openingAngle, useLineup } from './state';

const TAU = Math.PI * 2;
const TARGET = new Vector3(0, 0.56, 0.06);
const ORBIT_SECONDS = 12;

export function LineupRig({ points }: { points: readonly Vector3[] }) {
  const pose = useRef({ azimuth: 0, elevation: 0, side: 0, started: false });
  const playback = useRef({ from: 0, elapsed: 0, wasPlaying: false });

  useFrame(({ camera, size, scene }, dt) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const mobile = size.width < 768;
    const { orbit, view, playing, stopOrbit } = useLineup.getState();
    const reduced = prefersReducedMotion();
    const frame = pose.current;
    const play = playback.current;
    const preset = view === 'opening' ? openingAngle(size.width) : Math.PI / 2;
    if (view !== 'orbit') orbit.azimuth = nearestAngle(orbit.azimuth, preset);
    if (playing && reduced) stopOrbit();
    if (playing && !reduced) {
      if (!play.wasPlaying) {
        play.from = orbit.azimuth;
        play.elapsed = 0;
      }
      play.elapsed = Math.min(ORBIT_SECONDS, play.elapsed + Math.min(dt, 0.08));
      const t = play.elapsed / ORBIT_SECONDS;
      orbit.azimuth = play.from + TAU * (t - 0.13 * Math.sin(TAU * t));
      if (t >= 1) stopOrbit();
    }
    play.wasPlaying = playing && !reduced;

    const ease = reduced || !frame.started ? 1 : 1 - Math.exp(-dt * 11);
    frame.started = true;
    frame.side = MathUtils.lerp(frame.side, view === 'side' ? 1 : 0, ease);
    frame.azimuth = MathUtils.lerp(frame.azimuth, orbit.azimuth, ease);
    orbit.shownAzimuth = frame.azimuth;
    const elevation = (mobile ? 0.39 : 0.24) + frame.side * (mobile ? 0.15 : 0.22) + orbit.pitch;
    frame.elevation = MathUtils.lerp(frame.elevation, elevation, ease);
    // Compress perspective for the side comparison without changing either model's scale.
    const fov = MathUtils.lerp(mobile ? 49 : 34, mobile ? 24 : 16, frame.side);
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const short = MathUtils.clamp((540 - size.height) / 180, 0, 1);
    const targetY = TARGET.y - short * 0.78;
    const radius =
      fitLineup(points, frame, size.width / Math.max(1, size.height), fov, mobile, targetY) *
      (1 + short * 0.18);
    const horizontal = radius * Math.cos(frame.elevation);
    camera.position.set(
      TARGET.x + Math.sin(frame.azimuth) * horizontal,
      targetY + Math.sin(frame.elevation) * radius,
      TARGET.z + Math.cos(frame.azimuth) * horizontal,
    );
    camera.lookAt(TARGET.x, targetY, TARGET.z);
    if (scene.fog instanceof Fog) {
      scene.fog.near += frame.side * 12;
      scene.fog.far += frame.side * 12;
    }
  });

  return null;
}

function fitLineup(
  points: readonly Vector3[],
  { azimuth, elevation, side }: { azimuth: number; elevation: number; side: number },
  aspect: number,
  fov: number,
  mobile: boolean,
  targetY: number,
) {
  const vertical = Math.tan(MathUtils.degToRad(fov / 2));
  const horizontal = vertical * Math.max(0.1, aspect) * (mobile ? 0.91 : 0.84);
  const sa = Math.sin(azimuth),
    ca = Math.cos(azimuth);
  const se = Math.sin(elevation),
    ce = Math.cos(elevation);
  let radius = MathUtils.lerp(mobile ? 10.4 : 10.3, mobile ? 19 : 20.7, side);
  for (const point of points) {
    const x = point.x - TARGET.x;
    const y = point.y - targetY;
    const z = point.z - TARGET.z;
    const depth = (x * sa + z * ca) * ce + y * se;
    const across = x * ca - z * sa;
    const up = -(x * sa + z * ca) * se + y * ce;
    radius = Math.max(
      radius,
      depth + Math.abs(across) / horizontal,
      depth + Math.abs(up) / (vertical * 0.61),
    );
  }
  return radius;
}
