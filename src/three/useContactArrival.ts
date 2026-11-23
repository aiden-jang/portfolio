import { useRef } from 'react';
import { KEYFRAMES } from '../config';
import type { Keyframe } from '../types';
import { contactArrivalProgress, easeOutCubic } from './cameraPose';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, type Camera } from 'three';
import { CONTACT_DESKTOP_MIN_WIDTH, contactFrame } from './contactFrame';
import { phoneOpeningFrame } from './phoneOpeningFrame';
import { clamp } from '../math';

export function useContactArrival() {
  const { camera, size } = useThree();
  const arrival = useRef({ progress: 0 });
  return (pose: Keyframe | null, dt: number, reduced: boolean, scroll = 1) => {
    const state = arrival.current;
    const contact = pose && document.getElementById('sec-contact')?.getBoundingClientRect();
    if (!pose || !contact || contact.top >= size.height || contact.bottom <= 0) {
      state.progress = 0;
      if (pose && applyPhoneOpeningView(camera, size.width, size.height, scroll)) return;
      const aspect = size.width / size.height;
      if (
        camera.view?.enabled ||
        (camera instanceof PerspectiveCamera && camera.aspect !== aspect)
      ) {
        if (camera instanceof PerspectiveCamera) camera.aspect = aspect;
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
    const desktop = size.width >= CONTACT_DESKTOP_MIN_WIDTH;
    const contactElevation = desktop ? 0.63 : 0.61;
    pose.azimuth = (desktop ? 0.38 : 0.29) * t;
    pose.elevation = 0.12 + (contactElevation - 0.12) * t;
    pose.distance = (10 + (pose.distance - 10) * t) * view.distanceMultiplier;
  };
}

function applyPhoneOpeningView(camera: Camera, width: number, height: number, scroll: number) {
  const end = 0.34;
  if (!(camera instanceof PerspectiveCamera) || width >= 768 || height <= 0 || scroll >= end)
    return false;
  const { scale, lift } = phoneOpeningFrame(width, height, 1 - clamp(scroll / end, 0, 1));
  const spanX = width / scale;
  const spanY = height / scale;
  const offsetX = (width - spanX) / 2;
  const offsetY = (height - spanY) / 2 + lift / scale;
  const view = camera.view;
  if (
    !view?.enabled ||
    view.fullWidth !== width ||
    view.fullHeight !== height ||
    view.offsetX !== offsetX ||
    view.offsetY !== offsetY ||
    view.width !== spanX ||
    view.height !== spanY
  ) {
    camera.setViewOffset(width, height, offsetX, offsetY, spanX, spanY);
  }
  return true;
}
