import { framingDistanceMultiplier } from './cameraPose';

export const CONTACT_DESKTOP_MIN_WIDTH = 900;

type ContactFrameInput = {
  width: number;
  height: number;
  sectionHeight: number;
  sectionTop: number;
  progress: number;
};

export function contactFrame({
  width,
  height,
  sectionHeight,
  sectionTop,
  progress,
}: ContactFrameInput) {
  const desktop = width >= CONTACT_DESKTOP_MIN_WIDTH;
  const fullHeight = Math.max(1, sectionHeight);
  const distanceMultiplier =
    framingDistanceMultiplier(width / fullHeight) /
    framingDistanceMultiplier(width / Math.max(1, height));

  return {
    fullWidth: width,
    fullHeight,
    offsetX: desktop ? -width * 0.245 * progress : 0,
    offsetY: -sectionTop - (desktop ? 0 : (fullHeight * 0.14 - 35) * progress),
    width,
    height,
    distanceMultiplier: distanceMultiplier * (1 + (desktop ? -0.055 : 0.055) * progress),
  };
}
