import { useRef } from 'react';
import { KEYFRAMES } from '../config';
import { clamp, lerp, lerpAngle, smoothTowards } from '../math';
import { useAppStore } from '../store';
import { cameraViews } from './cameraViews';
import { easeOutCubic } from './cameraPose';
import type { RigState } from './useOrbitGesture';

export function useCameraViews() {
  const state = useAppStore.getState();
  const current = useRef({
    reset: state.cameraResetVersion,
    version: state.cameraViewVersion,
    car: state.carIndex,
    elapsed: 1,
    azimuth: 0,
    elevation: 0,
    rear: 0,
    wheel: 0,
    fromRear: 0,
    fromWheel: 0,
    awayFromWheel: 0,
    released: 0,
    framing: { rear: 0, wheel: 0 },
  });
  return (rig: RigState, dt: number, reduced: boolean, scrollT: number, width: number) => {
    const state = useAppStore.getState();
    const animation = current.current;
    const view = cameraViews(state, width < 768)[state.cameraView];
    if (state.cameraResetVersion !== animation.reset) {
      animation.reset = state.cameraResetVersion;
      animation.elapsed = 1;
      animation.rear = animation.wheel = animation.released = animation.awayFromWheel = 0;
      rig.dragAzimuth = rig.dragElevation = rig.idleSpin = 0;
      rig.dragMoved = false;
      document.body.classList.remove('orbiting');
    }
    if (state.cameraViewVersion !== animation.version) {
      animation.version = state.cameraViewVersion;
      animation.azimuth = rig.idleSpin + rig.dragAzimuth;
      animation.elevation = rig.dragElevation;
      animation.fromRear = animation.rear;
      animation.fromWheel = animation.wheel * (1 - animation.released);
      animation.released = animation.awayFromWheel = 0;
      animation.elapsed = 0;
    }
    if (rig.isDown || scrollT > 0 || !view || animation.car !== state.carIndex)
      animation.elapsed = 1;
    animation.car = state.carIndex;
    if (view && animation.elapsed < 1) {
      animation.elapsed = reduced ? 1 : Math.min(1, animation.elapsed + dt / 0.58);
      const progress = easeOutCubic(animation.elapsed);
      rig.idleSpin = lerpAngle(animation.azimuth, view.azimuth - KEYFRAMES[0].azimuth, progress);
      rig.dragElevation = lerp(
        animation.elevation,
        view.elevation - KEYFRAMES[0].elevation,
        progress,
      );
      animation.rear = lerp(animation.fromRear, Number(state.cameraView === 'rear'), progress);
      animation.wheel = lerp(animation.fromWheel, Number(state.cameraView === 'wheel'), progress);
      rig.dragAzimuth = 0;
      rig.dragMoved = true;
      rig.introT = 1;
    }
    if (state.cameraView === 'wheel' && view && animation.wheel > 0 && animation.elapsed === 1) {
      const angle = Math.abs(
        lerpAngle(view.azimuth, KEYFRAMES[0].azimuth + rig.idleSpin + rig.dragAzimuth, 1) -
          view.azimuth,
      );
      animation.awayFromWheel = Math.max(
        animation.awayFromWheel,
        clamp((angle - 0.38) / 0.66, 0, 1),
      );
    }
    animation.released = reduced
      ? animation.awayFromWheel
      : smoothTowards(animation.released, animation.awayFromWheel, Math.min(1, dt * 12));
    const introWeight = !view || state.isContactVisible ? 0 : 1 - clamp(scrollT * 5, 0, 1);
    animation.framing.rear = animation.rear * introWeight;
    animation.framing.wheel = animation.wheel * (1 - animation.released) * introWeight;
    return animation.framing;
  };
}
