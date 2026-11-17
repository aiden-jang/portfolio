import { useRef } from 'react';
import { KEYFRAMES } from '../config';
import { lerp, lerpAngle } from '../math';
import { useAppStore } from '../store';
import { CAMERA_VIEWS } from './cameraViews';
import { easeOutCubic } from './cameraPose';
import type { RigState } from './useOrbitGesture';

export function useCameraViews() {
  const current = useRef({
    reset: useAppStore.getState().cameraResetVersion,
    version: useAppStore.getState().cameraViewVersion,
    car: useAppStore.getState().carIndex,
    elapsed: 1,
    azimuth: 0,
    elevation: 0,
  });
  return (rig: RigState, dt: number, reduced: boolean, scrollT: number) => {
    const state = useAppStore.getState(),
      animation = current.current;
    if (state.cameraResetVersion !== animation.reset) {
      animation.reset = state.cameraResetVersion;
      animation.elapsed = 1;
      rig.dragAzimuth = rig.dragElevation = rig.idleSpin = 0;
      rig.dragMoved = false;
      document.body.classList.remove('orbiting');
    }
    if (state.cameraViewVersion !== animation.version) {
      animation.version = state.cameraViewVersion;
      animation.azimuth = rig.idleSpin + rig.dragAzimuth;
      animation.elevation = rig.dragElevation;
      animation.elapsed = 0;
    }
    if (rig.isDown || scrollT > 0 || state.carIndex !== animation.car) animation.elapsed = 1;
    animation.car = state.carIndex;
    if (animation.elapsed >= 1) return;
    animation.elapsed = reduced ? 1 : Math.min(1, animation.elapsed + dt / 0.7);
    const view = CAMERA_VIEWS[state.cameraView];
    const progress = easeOutCubic(animation.elapsed);
    rig.idleSpin = lerpAngle(animation.azimuth, view.azimuth - KEYFRAMES[0].azimuth, progress);
    rig.dragElevation = lerp(
      animation.elevation,
      view.elevation - KEYFRAMES[0].elevation,
      progress,
    );
    rig.dragAzimuth = 0;
    rig.dragMoved = true;
    rig.introT = 1;
  };
}
