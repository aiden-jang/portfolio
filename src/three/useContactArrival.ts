import { useRef } from 'react';
import { KEYFRAMES } from '../config';
import type { Keyframe } from '../types';
import { contactArrivalProgress, easeOutCubic } from './cameraPose';
import { clamp, lerp } from '../math';
import { useThree } from '@react-three/fiber';

export function useContactArrival() {
  const { camera, size } = useThree();
  const arrival = useRef({ progress: 0 });
  return (pose: Keyframe, dt: number, reduced: boolean) => {
    const state = arrival.current;
    const contact = document.getElementById('sec-contact')?.getBoundingClientRect();
    if (!contact || contact.top >= window.innerHeight || contact.bottom <= 0) {
      state.progress = 0;
      if (camera.view?.enabled) camera.clearViewOffset();
      return;
    }
    // Keep the car in Contact's document position while another section shares the viewport.
    if (
      !camera.view?.enabled ||
      camera.view.offsetY !== -contact.top ||
      camera.view.fullWidth !== size.width ||
      camera.view.fullHeight !== size.height
    ) {
      camera.setViewOffset(size.width, size.height, 0, -contact.top, size.width, size.height);
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
    const phone = window.innerWidth < 768;
    const compact = clamp((740 - window.innerHeight) / 160, 0, 1);
    // Portrait keeps the car below the contact copy; short screens also need a wider shot.
    if (phone) pose.targetY = lerp(2.8, 5.4, compact);
    const distance = phone ? lerp(pose.distance, 14, compact) : pose.distance;
    pose.distance = 10 + (distance - 10) * t;
  };
}
