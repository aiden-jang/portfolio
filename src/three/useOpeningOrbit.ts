import { useEffect, useRef } from 'react';
import type { Camera } from 'three';
import { DEFAULT_CAR_INDEX, KEYFRAMES } from '../config';
import { clamp, lerpAngle, lerp } from '../math';
import { usePhotoMode } from '../ui/photo/state';
import { framingDistanceMultiplier, orbitPosition } from './cameraPose';
import { sampleCorvetteLoop } from './corvetteLoop';
import { useOpeningPlayback } from './openingPlayback';
import { placeCamera } from './studio/cameraFraming';
import { useAppStore } from '../store';
import { motionState } from './studioEntrance';
import type { RigState } from './useOrbitGesture';

const HOLD_SECONDS = 0.18;
const SWEEP_SECONDS = 2.25;
type Phase = 'waiting' | 'playing' | 'settled' | 'interrupted' | 'reduced';

let replayVersion = 0;
let observer: ((phase: Phase) => void) | undefined;

export function observeOpeningOrbit(listener: (phase: Phase) => void) {
  observer = listener;
  return () => {
    if (observer === listener) observer = undefined;
  };
}

export function replayOpeningOrbit() {
  replayVersion++;
  useAppStore.getState().resetCamera();
}

function openingState() {
  const { carIndex, cameraResetVersion } = useAppStore.getState();
  return {
    phase: 'waiting' as Phase,
    version: replayVersion,
    carIndex,
    cameraResetVersion,
    elapsed: 0,
    offset: 0,
    reportedPhase: undefined as Phase | undefined,
    scrolled: false,
  };
}

export function useOpeningOrbit() {
  const current = useRef<ReturnType<typeof openingState>>();
  useEffect(() => {
    const interrupt = () => {
      if (current.current) current.current.scrolled = true;
    };
    const wheel = (event: WheelEvent) => {
      if (event.deltaY && !event.ctrlKey) interrupt();
    };
    const scroll = () => {
      if (window.scrollY > 0) interrupt();
    };
    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      useOpeningPlayback.setState({ playback: 'off' });
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('scroll', scroll);
    };
  }, []);

  return (
    rig: RigState,
    camera: Camera,
    dt: number,
    reduced: boolean,
    scroll: number,
    width: number,
    aspect: number,
  ) => {
    if (!current.current || current.current.version !== replayVersion) {
      current.current = openingState();
      useOpeningPlayback.setState({ playback: 'off' });
      rig.introT = 0;
    }
    const motion = current.current;
    const store = useAppStore.getState();
    const phone = width < 768;
    const arc = ((phone ? 20 : 26) * Math.PI) / 180;
    const corvette = motion.carIndex === DEFAULT_CAR_INDEX;
    const playback = useOpeningPlayback.getState().playback;
    const photo = usePhotoMode.getState().active;
    let shot: ReturnType<typeof sampleCorvetteLoop> | undefined;
    const unfinished = motion.phase === 'waiting' || motion.phase === 'playing';

    if (reduced) {
      motion.phase = 'reduced';
      motion.offset = 0;
    } else if (store.isContactVisible || store.cameraResetVersion !== motion.cameraResetVersion) {
      if (unfinished) motion.phase = 'interrupted';
      motion.offset = 0;
    } else if (unfinished && (motion.scrolled || scroll > 0)) {
      motion.phase = 'interrupted';
    } else if (
      (unfinished || motion.offset !== 0) &&
      (rig.isDown || store.hasManualView || store.carIndex !== motion.carIndex)
    ) {
      // Start manual camera control from the angle already on screen.
      rig.idleSpin += motion.offset;
      motion.offset = 0;
      motion.phase = 'interrupted';
    } else if (unfinished && store.refs.introArmed && store.refs.carModel) {
      // Frame the first visible paint at the start angle, then wait for the load signal.
      if (!store.isCarLoading && !store.refs.holdOpeningPose) {
        motion.phase = 'playing';
        if (!document.hidden && (!corvette || (playback !== 'paused' && !photo)))
          motion.elapsed += Math.min(dt, corvette ? 0.2 : 0.05);
      }
      const elapsed = motion.elapsed - HOLD_SECONDS;
      if (corvette && elapsed >= 0) {
        shot = sampleCorvetteLoop(elapsed, phone, aspect);
        const opening = KEYFRAMES[0];
        if (elapsed < 0.48) {
          const t = elapsed / 0.48;
          const ease = t * t * (3 - 2 * t);
          shot.yaw = lerpAngle(opening.azimuth - arc, shot.yaw, ease);
          shot.elevation = lerp(opening.elevation, shot.elevation, ease);
          shot.distance = lerp(
            opening.distance * framingDistanceMultiplier(aspect),
            shot.distance,
            ease,
          );
          shot.targetY = lerp(opening.targetY, shot.targetY, ease);
        }
        motion.offset = shot.yaw - opening.azimuth;
      } else {
        const t = clamp(elapsed / SWEEP_SECONDS, 0, 1);
        motion.offset = -arc * (1 - t * t * (3 - 2 * t));
        if (t === 1) motion.phase = 'settled';
      }
    }

    if (corvette && shot && playback === 'off')
      useOpeningPlayback.setState({ playback: 'playing' });
    else if (!shot && playback !== 'off') useOpeningPlayback.setState({ playback: 'off' });
    motionState.openingOrbitProgress =
      !corvette && motion.phase === 'playing' ? clamp(1 + motion.offset / arc, 0, 1) : 0;
    if (observer && motion.reportedPhase !== motion.phase) {
      motion.reportedPhase = motion.phase;
      observer(motion.phase);
    }
    if (shot) {
      rig.introT = 1;
      const pose = orbitPosition(shot.yaw, shot.elevation, shot.distance, shot.targetY);
      placeCamera(camera, pose, shot.targetY, store.refs.carModel, Number(shot.wheel));
      camera.translateX(shot.shiftX);
      camera.translateY(shot.shiftY);
      return null;
    }
    return motion.offset * (1 - clamp(scroll * 5, 0, 1));
  };
}
