import { useEffect, useRef } from 'react';
import type { Camera } from 'three';
import { DEFAULT_CAR_INDEX, KEYFRAMES } from '../config';
import { clamp, lerpAngle, lerp } from '../math';
import { usePhotoMode } from '../ui/photo/state';
import { framingDistanceMultiplier, orbitPosition } from './cameraPose';
import { sampleCorvetteLoop } from './corvetteLoop';
import { sampleSharedGarageCamera } from './sharedGarageCamera';
import { getOpeningReplayVersion, useOpeningPlayback } from './openingPlayback';
import { placeCamera } from './studio/cameraFraming';
import { useAppStore } from '../store';
import { motionState } from './studioEntrance';
import type { RigState } from './useOrbitGesture';

const HOLD_SECONDS = 0.18;
type Phase = 'waiting' | 'playing' | 'interrupted' | 'reduced';

let observer: ((phase: Phase) => void) | undefined;

export function observeOpeningOrbit(listener: (phase: Phase) => void) {
  observer = listener;
  return () => {
    if (observer === listener) observer = undefined;
  };
}

function openingState() {
  const { carIndex, cameraResetVersion, refs } = useAppStore.getState();
  return {
    phase: 'waiting' as Phase,
    version: getOpeningReplayVersion(),
    carIndex,
    cameraResetVersion,
    elapsed: 0,
    offset: 0,
    lastShot: undefined as ReturnType<typeof sampleCorvetteLoop> | undefined,
    reportedPhase: undefined as Phase | undefined,
    scrolled: false,
    leftIntro: false,
    model: refs.carModel,
    awaitingSwap: false,
  };
}

export function useOpeningOrbit() {
  const current = useRef<ReturnType<typeof openingState>>();
  useEffect(() => {
    const interrupt = () => {
      if (current.current) current.current.scrolled = true;
    };
    const wheel = (event: WheelEvent) => {
      if (event.deltaY && !event.ctrlKey && (event.deltaY > 0 || window.scrollY > 1)) interrupt();
    };
    const scroll = () => {
      if (window.scrollY > 1) interrupt();
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
    if (!current.current) {
      current.current = openingState();
      useOpeningPlayback.setState({ playback: 'off' });
    }
    let motion = current.current;
    let store = useAppStore.getState();
    const atIntro = scroll <= 0.002 && window.scrollY <= 1;
    if (scroll > 0.12) motion.leftIntro = true;
    const replayRequested = motion.version !== getOpeningReplayVersion();
    const switchedCar = motion.carIndex !== store.carIndex;
    if (
      (motion.leftIntro || replayRequested || switchedCar) &&
      atIntro &&
      !store.isContactVisible &&
      !rig.isDown
    ) {
      motion.leftIntro = false;
      if (
        (replayRequested || switchedCar || (!reduced && store.carIndex === DEFAULT_CAR_INDEX)) &&
        !usePhotoMode.getState().active
      ) {
        store.resetCamera();
        store = useAppStore.getState();
        const previousModel = motion.model;
        motion = current.current = openingState();
        motion.awaitingSwap = switchedCar && previousModel === motion.model;
        rig.introT = 0;
        useOpeningPlayback.setState({ playback: 'off' });
      }
    }
    const phone = width < 768;
    const arc = ((phone ? 20 : 26) * Math.PI) / 180;
    const corvette = motion.carIndex === DEFAULT_CAR_INDEX;
    const playback = useOpeningPlayback.getState().playback;
    const photo = usePhotoMode.getState().active;
    if (motion.model !== store.refs.carModel) {
      motion.model = store.refs.carModel;
      motion.awaitingSwap = false;
    }
    let shot: ReturnType<typeof sampleCorvetteLoop> | undefined;
    const unfinished = motion.phase === 'waiting' || motion.phase === 'playing';

    if (reduced) {
      motion.phase = 'reduced';
      motion.offset = 0;
    } else if (store.isContactVisible || store.cameraResetVersion !== motion.cameraResetVersion) {
      if (unfinished) motion.phase = 'interrupted';
      motion.offset = 0;
    } else if (unfinished && (motion.scrolled || (scroll > 0 && !atIntro))) {
      motion.phase = 'interrupted';
    } else if (
      (unfinished || motion.offset !== 0) &&
      (rig.isDown || store.hasManualView || store.carIndex !== motion.carIndex)
    ) {
      // Start manual camera control from the angle already on screen.
      if (!corvette && motion.lastShot)
        rig.dragElevation = motion.lastShot.elevation - KEYFRAMES[0].elevation;
      rig.idleSpin += motion.offset;
      motion.offset = 0;
      motion.phase = 'interrupted';
    } else if (
      unfinished &&
      !motion.awaitingSwap &&
      !store.carLoadError &&
      store.refs.introArmed &&
      store.refs.carModel
    ) {
      // Frame the first visible paint at the start angle, then wait for the load signal.
      if (!store.isCarLoading && !store.refs.holdOpeningPose) {
        motion.phase = 'playing';
        if (
          !document.hidden &&
          playback !== 'paused' &&
          !photo &&
          !document.querySelector('dialog[open]')
        )
          motion.elapsed += Math.min(dt, 0.2);
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
      } else if (!corvette && motion.phase === 'playing' && elapsed >= 0) {
        const framed = sampleSharedGarageCamera(
          elapsed,
          store.refs.carModel,
          width,
          aspect,
          phone ? 34 : 32,
        );
        if (framed) {
          shot = framed;
          motion.offset = shot.yaw - KEYFRAMES[0].azimuth;
        }
      } else {
        motion.offset = -arc;
      }
    }

    if (shot && playback === 'off' && atIntro) useOpeningPlayback.setState({ playback: 'playing' });
    else if (!shot && playback !== 'off') useOpeningPlayback.setState({ playback: 'off' });
    motionState.openingOrbitProgress =
      !corvette && motion.phase === 'playing' ? clamp(1 + motion.offset / arc, 0, 1) : 0;
    if (observer && motion.reportedPhase !== motion.phase) {
      motion.reportedPhase = motion.phase;
      observer(motion.phase);
    }
    if (shot) motion.lastShot = shot;
    if (
      !shot &&
      motion.lastShot &&
      motion.phase === 'interrupted' &&
      scroll > 0 &&
      scroll < 1 &&
      !reduced &&
      !store.hasManualView &&
      !store.isContactVisible &&
      !photo &&
      store.carIndex === DEFAULT_CAR_INDEX &&
      store.cameraResetVersion === motion.cameraResetVersion
    ) {
      const travel = clamp(scroll, 0, 1);
      const last = motion.lastShot;
      shot = {
        ...last,
        shiftX: last.shiftX + travel * (phone ? 0.7 : 1.8),
        distance: last.distance * (1 - travel * 0.1),
      };
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
