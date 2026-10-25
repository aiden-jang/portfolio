import { useRef } from 'react';
import { KEYFRAMES } from '../config';
import type { Keyframe } from '../types';
import { contactArrivalProgress, easeOutCubic } from './cameraPose';
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
    // Keep the car's silhouette visible around the centered copy on short phones.
    const framing =
      window.innerWidth < 768 ? Math.min(1, Math.max(568, window.innerHeight) / 740) : 1;
    pose.distance = (10 + (pose.distance - 10) * t) * framing;
  };
}
