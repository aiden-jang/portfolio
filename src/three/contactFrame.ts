import { framingDistanceMultiplier } from './cameraPose';

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
  const desktop = width >= 900;
  const fullHeight = Math.max(1, sectionHeight);
  const distanceMultiplier =
    framingDistanceMultiplier(width / fullHeight) /
    framingDistanceMultiplier(width / Math.max(1, height));

  return {
    fullWidth: width,
    fullHeight,
    offsetX: desktop ? -width * 0.245 * progress : 0,
    offsetY: -sectionTop - (desktop ? 0 : (fullHeight * 0.2 - 42) * progress),
    width,
    height,
    distanceMultiplier: distanceMultiplier * (desktop ? 1 - 0.055 * progress : 1 + 0.13 * progress),
  };
}
