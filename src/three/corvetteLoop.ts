import { KEYFRAMES } from '../config';

type Lens = {
  yaw: number;
  elevation: number;
  distance: number;
  targetY: number;
  shiftX?: number;
  shiftY?: number;
};

type Shot = Lens & {
  duration: number;
  slide: number;
  travel: number;
  wheel?: boolean;
  mobile?: Partial<Lens>;
};

const views: Shot[] = [
  {
    yaw: KEYFRAMES[0].azimuth + 0.49,
    elevation: 0.15,
    distance: 8.25,
    targetY: 0.55,
    duration: 2.1,
    slide: -0.17,
    travel: -0.36,
    mobile: { yaw: 0.92, distance: 16.0, targetY: 0.48 },
  },
  {
    yaw: 1.29,
    elevation: 0.105,
    distance: 3.0,
    targetY: 0.49,
    duration: 1.35,
    slide: 0.18,
    travel: -0.23,
    wheel: true,
    mobile: { yaw: 1.12, distance: 4.45 },
  },
  {
    yaw: -2.56,
    elevation: 0.12,
    distance: 7.5,
    targetY: 0.52,
    duration: 1.75,
    slide: -0.19,
    travel: -0.32,
    mobile: { yaw: -2.51, distance: 14.9 },
  },
  {
    yaw: -1.25,
    elevation: 1.12,
    distance: 9.4,
    targetY: 0.52,
    shiftX: -1.55,
    shiftY: 0.43,
    duration: 1.5,
    slide: 0.15,
    travel: -0.3,
    mobile: { yaw: -0.26, distance: 14.6, shiftX: 0, shiftY: 0.8 },
  },
];

const cycle = views.reduce((total, view) => total + view.duration, 0);

export function sampleCorvetteLoop(elapsed: number, phone: boolean, aspect: number) {
  let time = elapsed % cycle;
  let beat = 0;
  while (time >= views[beat].duration && beat < views.length - 1) {
    time -= views[beat].duration;
    beat++;
  }
  const view = views[beat];
  const lens = phone && view.mobile ? { ...view, ...view.mobile } : view;
  const progress = time / view.duration;
  const fit = phone ? Math.max(1, 0.46 / aspect) : Math.max(1, 1.43 / aspect);
  return {
    yaw: lens.yaw + view.slide * progress,
    distance: (lens.distance + view.travel * progress) * fit,
    elevation: lens.elevation,
    targetY: lens.targetY,
    shiftX: lens.shiftX ?? 0,
    shiftY: lens.shiftY ?? 0,
    wheel: Boolean(view.wheel),
  };
}
