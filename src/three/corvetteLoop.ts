import { KEYFRAMES } from '../config';

type Lens = {
  yaw: number;
  elevation: number;
  distance: number;
  targetY: number;
  shiftX?: number;
  driftX?: number;
  shiftY?: number;
};

type Shot = Lens & {
  duration: number;
  slide: number;
  travel: number;
  wheel?: boolean;
  settle?: boolean;
  mobile?: Partial<Lens>;
};

const lowFront: Shot = {
  yaw: -0.023,
  elevation: -0.007,
  distance: 6.65,
  targetY: 0.47,
  duration: 1.25,
  slide: 0.046,
  travel: -0.35,
  mobile: { distance: 12.75, targetY: 0.48, shiftY: 0.05 },
};

const sideProfile: Shot = {
  yaw: Math.PI / 2 + 0.035,
  elevation: 0.1,
  distance: 9.15,
  targetY: 0.48,
  duration: 1.38,
  slide: -0.065,
  travel: -0.12,
  shiftX: -0.38,
  driftX: 0.74,
  mobile: { distance: 21.4, shiftX: -0.13, driftX: 0.26, shiftY: 0.04 },
};

const overhead: Shot = {
  yaw: -1.25,
  elevation: 1.12,
  distance: 9.4,
  targetY: 0.52,
  shiftX: -1.55,
  shiftY: 0.43,
  duration: 1.38,
  slide: 0.15,
  travel: -0.3,
  mobile: { yaw: -0.26, distance: 14.6, shiftX: 0, shiftY: 0.8 },
};

const views: Shot[] = [
  {
    yaw: KEYFRAMES[0].azimuth + 0.49,
    elevation: 0.15,
    distance: 8.25,
    targetY: 0.55,
    duration: 1.54,
    slide: -0.17,
    travel: -0.36,
    mobile: { yaw: 0.92, distance: 16.0, targetY: 0.48 },
  },
  {
    yaw: 1.29,
    elevation: 0.105,
    distance: 3.0,
    targetY: 0.49,
    duration: 1.1,
    slide: 0.18,
    travel: -0.23,
    wheel: true,
    mobile: { yaw: 1.12, distance: 4.45 },
  },
  sideProfile,
  lowFront,
  {
    yaw: -2.56,
    elevation: 0.12,
    distance: 7.5,
    targetY: 0.52,
    duration: 1.48,
    slide: -0.19,
    travel: -0.32,
    mobile: { yaw: -2.51, distance: 14.9 },
  },
  overhead,
];

const afterHoursViews: Shot[] = [
  {
    yaw: -2.58,
    elevation: 0.165,
    distance: 8.3,
    targetY: 0.64,
    duration: 1.5,
    slide: 0.1,
    travel: -0.22,
    shiftX: -0.42,
    mobile: { yaw: -2.62, distance: 14.7, shiftX: -0.23, shiftY: -0.1 },
  },
  {
    ...lowFront,
    duration: 2.85,
    settle: true,
  },
  {
    yaw: -2.93,
    elevation: 0.14,
    distance: 4.45,
    targetY: 0.57,
    duration: 1.3,
    slide: -0.1,
    travel: -0.2,
    shiftX: -0.5,
    shiftY: -0.1,
    mobile: { distance: 6.6, shiftY: -0.17, shiftX: 0 },
  },
  { ...sideProfile, duration: 1.5 },
  { ...overhead, duration: 1.45 },
];
const totalDuration = (shots: Shot[]) => shots.reduce((total, view) => total + view.duration, 0);
const cycle = totalDuration(views);
const nightCycle = totalDuration(afterHoursViews);

export function sampleCorvetteLoop(elapsed: number, phone: boolean, aspect: number, night = false) {
  const shots = night ? afterHoursViews : views;
  let time = elapsed % (night ? nightCycle : cycle);
  let beat = 0;
  while (time >= shots[beat].duration && beat < shots.length - 1) {
    time -= shots[beat].duration;
    beat++;
  }
  const view = shots[beat];
  const lens = phone && view.mobile ? { ...view, ...view.mobile } : view;
  const progress = view.settle ? lowFrontProgress(time) : time / view.duration;
  const fitsShortWide = night && phone && aspect >= 0.5 && beat === 0;
  const fit = phone
    ? fitsShortWide
      ? 0.91
      : Math.max(1, 0.46 / aspect)
    : Math.max(1, 1.43 / aspect);
  return {
    yaw: lens.yaw + view.slide * progress,
    distance: (lens.distance + view.travel * progress) * fit,
    elevation: lens.elevation,
    targetY: lens.targetY,
    shiftX: (lens.shiftX ?? 0) + (lens.driftX ?? 0) * progress,
    shiftY: lens.shiftY ?? 0,
    wheel: Boolean(view.wheel),
  };
}

function lowFrontProgress(time: number) {
  const travel = time / lowFront.duration;
  if (travel <= 0.8) return travel;
  const ease = Math.min(1, (travel - 0.8) / 0.4);
  return 1 - 0.2 * (1 - ease) ** 2;
}
