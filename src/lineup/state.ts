import { create } from 'zustand';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { clamp } from '../math';

type View = 'opening' | 'side' | 'orbit';
type Status = 'loading' | 'ready' | 'failed';

export type LineupOrbit = {
  azimuth: number;
  shownAzimuth: number;
  pitch: number;
};

export const openingAngle = (width: number) => (width < 768 ? -0.58 : 0.72);
export const nearestAngle = (current: number, target: number) =>
  current + Math.atan2(Math.sin(target - current), Math.cos(target - current));

function openingOrbit(): LineupOrbit {
  const azimuth = openingAngle(typeof window === 'undefined' ? 1440 : window.innerWidth);
  return { azimuth, shownAzimuth: azimuth, pitch: 0 };
}

type LineupState = {
  active: boolean;
  view: View;
  playing: boolean;
  status: Status;
  length: number | null;
  attempt: number;
  orbit: LineupOrbit;
  open: () => void;
  close: () => void;
  choose: (view: 'opening' | 'side') => void;
  drag: (azimuth: number, pitch: number) => void;
  toggleOrbit: () => void;
  stopOrbit: () => void;
  ready: (length: number) => void;
  fail: () => void;
  retry: () => void;
};

export const useLineup = create<LineupState>((set, get) => ({
  active: false,
  view: 'opening',
  playing: false,
  status: 'loading',
  length: null,
  attempt: 0,
  orbit: openingOrbit(),
  open: () =>
    set({ active: true, view: 'opening', status: 'loading', length: null, orbit: openingOrbit() }),
  close: () => set({ active: false, playing: false }),
  choose: (view) => {
    const { orbit } = get();
    orbit.azimuth = orbit.shownAzimuth;
    orbit.pitch = 0;
    set({ view, playing: false });
  },
  drag: (azimuth, pitch) => {
    const { orbit, view, playing } = get();
    orbit.azimuth = azimuth;
    orbit.pitch = clamp(pitch, -0.1, 0.22);
    if (view !== 'orbit' || playing) set({ view: 'orbit', playing: false });
  },
  toggleOrbit: () => {
    const { orbit, playing, drag } = get();
    if (prefersReducedMotion()) {
      drag(orbit.shownAzimuth + Math.PI / 4, orbit.pitch);
      return;
    }
    if (!playing) {
      orbit.azimuth = orbit.shownAzimuth;
      orbit.pitch = 0;
    }
    set({ view: 'orbit', playing: !playing });
  },
  stopOrbit: () => set({ playing: false }),
  ready: (length) => set({ status: 'ready', length }),
  fail: () => set({ status: 'failed' }),
  retry: () => set(({ attempt }) => ({ status: 'loading', attempt: attempt + 1 })),
}));
