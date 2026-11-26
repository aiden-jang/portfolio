import { finishStudyFrame, useFinishStudy } from './finishStudy';
import { KEYFRAMES } from '../config';
import type { Keyframe } from '../types';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, type Camera } from 'three';
import { CONTACT_DESKTOP_MIN_WIDTH, contactFrame } from './contactFrame';
import { phoneOpeningFrame } from './phoneOpeningFrame';
import { clamp } from '../math';

export function useContactArrival() {
  const { camera, size } = useThree();
  return (pose: Keyframe | null, reduced: boolean, scroll = 1) => {
    const study = !reduced && useFinishStudy.getState().active;
    const contact = pose && document.getElementById('sec-contact')?.getBoundingClientRect();
    if (!pose || !contact || (contact.top >= size.height && !study) || contact.bottom <= 0) {
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
    Object.assign(pose, KEYFRAMES.at(-1)!);
    const view = contactFrame({
      ...size,
      sectionHeight: contact.height,
      sectionTop: study ? finishStudyFrame.top : contact.top,
      progress: 1,
    });
    const desktop = size.width >= CONTACT_DESKTOP_MIN_WIDTH;
    const p = finishStudyFrame.progress;
    const paint = study ? p * p * (3 - 2 * p) : 1;
    const clay = 1 - paint;
    if (desktop) view.offsetX += size.width * 0.13 * clay;
    else view.offsetY += view.fullHeight * 0.043 * paint;
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
    const bearing = desktop ? pose.azimuth : 0.5;
    const elevation = desktop ? pose.elevation : 0.135;
    pose.azimuth = bearing + ((desktop ? 0.84 : 0.71) - bearing) * clay;
    pose.elevation = elevation + ((desktop ? 0.23 : 0.3) - elevation) * clay;
    pose.distance *= view.distanceMultiplier * (1 - (desktop ? 0.03 : 0.142) * paint);
    pose.distance *= 1 - (desktop ? 0.15 : 0.08) * clay;
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
