import { useRef } from 'react';
import { useAppStore } from '../store';
import type { Keyframe } from '../types';
import { easeOutCubic } from './cameraPose';

export function useContactArrival() {
  const arrival = useRef({ active: false, progress: 0 });
  return (pose: Keyframe, dt: number, reduced: boolean) => {
    const state = arrival.current;
    if (useAppStore.getState().sectionIndex !== 4) {
      state.active = false;
      state.progress = 0;
      return;
    }
    if (!state.active) state.active = true;
    state.progress = reduced ? 1 : Math.min(1, state.progress + dt / 2.2);
    const t = easeOutCubic(state.progress);
    pose.azimuth = 0;
    pose.elevation = 0.12 + (pose.elevation - 0.12) * t;
    pose.distance = 10.8 + (pose.distance - 10.8) * t;
  };
}
