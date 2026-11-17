import { motionState, updateIntroFov } from './studioEntrance';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { KEYFRAMES } from '../config';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { clamp } from '../math';
import { useOrbitGesture, createRigState } from './useOrbitGesture';
import {
  blendIntro,
  easeOutCubic,
  floorElevation,
  framingDistanceMultiplier,
  FRAME_BASE_ASPECT,
  interpolateKeyframe,
  MAX_ELEVATION,
  orbitPosition,
} from './cameraPose';
import { useAppStore } from '../store';
import { useContactArrival } from './useContactArrival';
import type { Keyframe } from '../types';
import { hitsCar } from './carHitTest';
import { useCarZoom } from './useCarZoom';

const INTRO_DURATION = 0.78;

// `?clean` freezes the camera for OG screenshots. It needs its own azimuth because KEYFRAMES[0]
// sits near the nose, and the shot wants more flank.
const isCleanMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');
const CLEAN_AZIMUTH = 0.65;

type Props = {
  getScrollT: () => number;
};

export function CameraRig({ getScrollT }: Props) {
  const { camera, gl } = useThree();
  const contactArrival = useContactArrival();
  const cameraResetVersion = useAppStore((s) => s.cameraResetVersion);

  const state = useRef(createRigState());
  const baseKf = useRef<Keyframe>({ ...KEYFRAMES[0] });
  const zoomDistance = useCarZoom();

  const onTap = useCallback(
    (x: number, y: number) => {
      const store = useAppStore.getState();
      if (hitsCar(store.refs.carModel, camera, gl.domElement.getBoundingClientRect(), x, y))
        store.pulseCarLights();
    },
    [camera, gl],
  );
  useOrbitGesture(state, onTap);

  useEffect(() => {
    const s = state.current;
    s.dragAzimuth = 0;
    s.dragElevation = 0;
    s.idleSpin = 0;
    s.dragMoved = false;
    document.body.classList.remove('orbiting');
  }, [cameraResetVersion]);

  useFrame((three, dt) => {
    const s = state.current;
    const refs = useAppStore.getState().refs;
    const reduced = prefersReducedMotion(),
      scrollT = getScrollT();

    if (s.isDown || scrollT > 0 || useAppStore.getState().hasManualView) s.introT = 1;
    motionState.progress = reduced ? 1 : s.introT;
    updateIntroFov(camera, three.size.width, scrollT);
    s.scrollActiveTimer = Math.max(0, s.scrollActiveTimer - dt);

    const kf = baseKf.current;
    interpolateKeyframe(KEYFRAMES, scrollT, kf);
    contactArrival(kf, dt, reduced);

    const az = isCleanMode
      ? CLEAN_AZIMUTH
      : kf.azimuth + s.dragAzimuth + s.idleSpin * (1 - clamp(scrollT, 0, 1));
    const aspect = three.size.height > 0 ? three.size.width / three.size.height : FRAME_BASE_ASPECT;
    let dist = kf.distance * framingDistanceMultiplier(aspect);
    const tgtY = kf.targetY;

    const el = clamp(
      kf.elevation + s.dragElevation * (1 - clamp(scrollT, 0, 1)),
      floorElevation(dist, tgtY),
      MAX_ELEVATION,
    );
    if (s.isDown) s.dragElevation = el - kf.elevation;
    dist = zoomDistance({
      model: refs.carModel,
      azimuth: az,
      elevation: el,
      distance: dist,
      targetY: tgtY,
      width: three.size.width,
      height: three.size.height,
      fov: 'fov' in camera ? (camera.fov as number) : 35,
      scrollT,
      dt,
      reduced,
      manualOrbit: s.dragMoved || s.dragAzimuth !== 0 || s.dragElevation !== 0,
      clean: isCleanMode,
    });
    let pose = orbitPosition(az, Math.max(el, floorElevation(dist, tgtY)), dist, tgtY);

    if (refs.introArmed && s.introT < 1 && !isCleanMode && !reduced) {
      s.introT = Math.min(1, s.introT + dt / INTRO_DURATION);
      pose = blendIntro(pose, az, dist, tgtY, easeOutCubic(s.introT));
    }
    camera.position.set(pose.x, pose.y, pose.z);
    camera.lookAt(0, tgtY, 0);
  });
  return null;
}
