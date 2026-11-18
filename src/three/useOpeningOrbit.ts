import { useEffect, useRef } from 'react';
import { clamp } from '../math';
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
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('scroll', scroll);
    };
  }, []);

  return (rig: RigState, dt: number, reduced: boolean, scroll: number, width: number) => {
    if (!current.current || current.current.version !== replayVersion) {
      current.current = openingState();
      rig.introT = 0;
    }
    const motion = current.current;
    const store = useAppStore.getState();
    const arc = ((width < 768 ? 20 : 26) * Math.PI) / 180;
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
      if (!store.isCarLoading) {
        motion.phase = 'playing';
        if (!document.hidden && !store.refs.holdOpeningPose) motion.elapsed += Math.min(dt, 0.05);
      }
      const t = clamp((motion.elapsed - HOLD_SECONDS) / SWEEP_SECONDS, 0, 1);
      motion.offset = -arc * (1 - t * t * (3 - 2 * t));
      if (t === 1) motion.phase = 'settled';
    }

    motionState.openingOrbitProgress =
      motion.phase === 'playing' ? clamp(1 + motion.offset / arc, 0, 1) : 0;
    if (observer && motion.reportedPhase !== motion.phase) {
      motion.reportedPhase = motion.phase;
      observer(motion.phase);
    }
    return motion.offset * (1 - clamp(scroll * 5, 0, 1));
  };
}
