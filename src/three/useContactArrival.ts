import { useRef } from 'react';
import { KEYFRAMES } from '../config';
import type { Keyframe } from '../types';
import { contactArrivalProgress, easeOutCubic } from './cameraPose';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { contactFrame } from './contactFrame';

export function useContactArrival() {
  const { camera, size } = useThree();
  const arrival = useRef({ progress: 0 });
  return (pose: Keyframe, dt: number, reduced: boolean) => {
    const state = arrival.current;
    const contact = document.getElementById('sec-contact')?.getBoundingClientRect();
    if (!contact || contact.top >= size.height || contact.bottom <= 0) {
      state.progress = 0;
      if (camera.view?.enabled) {
        if (camera instanceof PerspectiveCamera) camera.aspect = size.width / size.height;
        camera.clearViewOffset();
      }
      return;
    }
    state.progress = contactArrivalProgress(contact.top, size.height, state.progress, dt, reduced);
    Object.assign(pose, KEYFRAMES.at(-1)!);
    const t = easeOutCubic(state.progress);
    const view = contactFrame({
      ...size,
      sectionHeight: contact.height,
      sectionTop: contact.top,
      progress: t,
    });
    // Treat a tall Contact section as one scene and show only its current viewport slice.
    if (
      !camera.view?.enabled ||
      camera.view.offsetX !== view.offsetX ||
      camera.view.offsetY !== view.offsetY ||
      camera.view.fullWidth !== view.fullWidth ||
      camera.view.fullHeight !== view.fullHeight ||
      camera.view.width !== view.width ||
      camera.view.height !== view.height
    ) {
      camera.setViewOffset(
        view.fullWidth,
        view.fullHeight,
        view.offsetX,
        view.offsetY,
        view.width,
        view.height,
      );
    }
    pose.azimuth = 0;
    pose.elevation = 0.12 + (pose.elevation - 0.12) * t;
    pose.distance = (10 + (pose.distance - 10) * t) * view.distanceMultiplier;
  };
}
