import { useRef } from 'react';
import { KEYFRAMES } from '../config';
import type { Keyframe } from '../types';
import { contactArrivalProgress, easeOutCubic } from './cameraPose';

export function useContactArrival() {
  const arrival = useRef({ progress: 0 });
  return (pose: Keyframe, dt: number, reduced: boolean) => {
    const state = arrival.current;
    const contact = document.getElementById('sec-contact')?.getBoundingClientRect();
    if (!contact || contact.top >= window.innerHeight || contact.bottom <= 0) {
      state.progress = 0;
      return;
    }
    state.progress = contactArrivalProgress(
      contact.top,
      window.innerHeight,
      state.progress,
      dt,
      reduced,
    );
    Object.assign(pose, KEYFRAMES[4]);
    const t = easeOutCubic(state.progress);
    pose.azimuth = 0;
    pose.elevation = 0.12 + (pose.elevation - 0.12) * t;
    pose.distance = 10 + (pose.distance - 10) * t;
  };
}
