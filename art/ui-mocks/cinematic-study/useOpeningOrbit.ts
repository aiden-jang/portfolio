import { useEffect, useRef } from 'react';
import { clamp } from '../../../src/math';
import { useAppStore } from '../../../src/store';
import type { RigState } from '../../../src/three/useOrbitGesture';

const HOLD_SECONDS = 0.18;
const SWEEP_SECONDS = 2.25;
type Phase = 'waiting' | 'playing' | 'settled' | 'interrupted' | 'reduced';

let replayVersion = 0;
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
    wheel: false,
  };
}

export function useOpeningOrbit() {
  const current = useRef<ReturnType<typeof openingState>>();
  useEffect(() => {
    const wheel = (event: WheelEvent) => {
      if (current.current && event.deltaY && !event.ctrlKey) current.current.wheel = true;
    };
    window.addEventListener('wheel', wheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', wheel);
      delete document.documentElement.dataset.openingOrbit;
    };
  }, []);

  return (rig: RigState, dt: number, reduced: boolean, scroll: number, width: number) => {
    if (!document.documentElement.hasAttribute('data-cinema-study')) return 0;
    if (!current.current || current.current.version !== replayVersion) {
      current.current = openingState();
      rig.introT = 0;
    }
    const motion = current.current;
    const store = useAppStore.getState();
    const unfinished = motion.phase === 'waiting' || motion.phase === 'playing';

    if (reduced) {
      motion.phase = 'reduced';
      motion.offset = 0;
    } else if (store.isContactVisible || store.cameraResetVersion !== motion.cameraResetVersion) {
      if (unfinished) motion.phase = 'interrupted';
      motion.offset = 0;
    } else if (unfinished && (motion.wheel || scroll > 0)) {
      motion.phase = 'interrupted';
    } else if (
      (unfinished || motion.offset !== 0) &&
      (rig.isDown || store.hasManualView || store.carIndex !== motion.carIndex)
    ) {
      // Start manual camera control from the angle already on screen.
      rig.idleSpin += motion.offset;
      motion.offset = 0;
      motion.phase = 'interrupted';
    } else if (unfinished) {
      if (store.refs.introArmed && !store.isCarLoading && store.refs.carModel) {
        motion.phase = 'playing';
        if (!document.hidden) motion.elapsed += Math.min(dt, 0.05);
      }
      const t = clamp((motion.elapsed - HOLD_SECONDS) / SWEEP_SECONDS, 0, 1);
      const arc = ((width < 768 ? 20 : 26) * Math.PI) / 180;
      motion.offset = -arc * (1 - t * t * (3 - 2 * t));
      if (t === 1) motion.phase = 'settled';
    }

    const root = document.documentElement;
    if (root.dataset.openingOrbit !== motion.phase) {
      root.dataset.openingOrbit = motion.phase;
      if (window.parent !== window)
        window.parent.postMessage({ openingOrbit: motion.phase }, location.origin);
    }
    return motion.offset * (1 - clamp(scroll * 5, 0, 1));
  };
}
