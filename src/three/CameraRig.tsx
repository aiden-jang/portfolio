import { motionState, updateIntroFov } from './studioEntrance';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
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
import { placeCamera } from './studio/cameraFraming';
import { useCameraViews } from './useCameraViews';
import { useCarZoom } from './useCarZoom';
import { useOpeningOrbit } from './useOpeningOrbit';

const INTRO_DURATION = 0.78;

const isCleanMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');
const CLEAN_AZIMUTH = 0.65;

export function CameraRig({ getScrollT, lineup }: { getScrollT: () => number; lineup?: boolean }) {
  const { camera, gl } = useThree();
  const contactArrival = useContactArrival();
  const updateCameraView = useCameraViews();
  const openingOrbit = useOpeningOrbit();
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

  useFrame((three, dt) => {
    const { refs, hasManualView, renderFinish } = useAppStore.getState();
    if (lineup || renderFinish) return contactArrival(null, false);
    const s = state.current,
      kf = baseKf.current;
    const { width, height } = three.size;
    const reduced = prefersReducedMotion(),
      scrollT = getScrollT();
    const aspect = height > 0 ? width / height : FRAME_BASE_ASPECT;
    interpolateKeyframe(KEYFRAMES, scrollT, kf, width < 768 ? 12 : undefined);
    updateIntroFov(camera, width, scrollT);
    if (contactArrival(kf, reduced, isCleanMode ? 1 : scrollT)) return;
    const swing = isCleanMode ? 0 : openingOrbit(s, camera, dt, reduced, scrollT, width, aspect);
    const studioShot = updateCameraView(s, dt, reduced, scrollT, width);
    if (refs.holdOpeningPose || s.isDown || scrollT > 0 || hasManualView) s.introT = 1;
    motionState.progress = reduced ? 1 : s.introT;
    s.scrollActiveTimer = Math.max(0, s.scrollActiveTimer - dt);
    if (swing === null) return;

    const az = isCleanMode
      ? CLEAN_AZIMUTH
      : kf.azimuth + swing + s.dragAzimuth + s.idleSpin * (1 - clamp(scrollT, 0, 1));
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
      width,
      height,
      fov: 'fov' in camera ? (camera.fov as number) : 35,
      scrollT,
      dt,
      reduced,
      manualOrbit: s.dragMoved || s.dragAzimuth !== 0 || s.dragElevation !== 0,
      clean: isCleanMode,
      studioShot,
    });
    let pose = orbitPosition(az, Math.max(el, floorElevation(dist, tgtY)), dist, tgtY);

    if (refs.introArmed && s.introT < 1 && !isCleanMode && !reduced) {
      s.introT = Math.min(1, s.introT + dt / INTRO_DURATION);
      pose = blendIntro(pose, az, dist, tgtY, easeOutCubic(s.introT));
    }
    placeCamera(camera, pose, tgtY, refs.carModel, studioShot.wheel);
  });
  return null;
}
