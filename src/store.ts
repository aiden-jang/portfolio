import { create } from 'zustand';
import type * as THREE from 'three';
import { CARS } from './config';
import type { ColorMaterial, Lamp, ThemeName } from './types';

type Refs = {
  /** Body material on the currently-loaded car (paint surface). */
  bodyMaterial: ColorMaterial | null;
  /** Cached original color so the "Original" swatch can restore it. */
  bodyOriginalColor: THREE.Color | null;
  /** Lamps attached to the currently-loaded car. */
  lamps: Lamp[];
  /** Per-car exposure multiplier, smoothly eased toward the target. */
  exposureCurrent: number;
  /** Current rev intensity (1 → 0 over ~½s after a click). */
  revT: number;
  /** True after the very first car GLB has loaded — gates the intro animation. */
  introArmed: boolean;
};

type AppState = {
  // ---- React state (rare changes, triggers re-renders) ----
  carIndex: number;
  themeName: ThemeName;
  sectionIndex: number;

  // ---- Imperative refs (high-frequency, do not trigger re-renders) ----
  refs: Refs;

  // ---- Actions ----
  setCarIndex: (i: number) => void;
  cycleCar: () => void;
  toggleTheme: () => void;
  setSectionIndex: (i: number) => void;
  triggerRev: () => void;
  armIntro: () => void;
};

/** Single source of truth. React state for things that change on user actions
 *  (car, theme, section). High-frequency values (rev, body material, lamps)
 *  live on `refs` so 60fps updates don't cascade re-renders. */
export const useAppStore = create<AppState>((set, get) => ({
  carIndex: 0,
  themeName: 'dusk',
  sectionIndex: 0,
  refs: {
    bodyMaterial: null,
    bodyOriginalColor: null,
    lamps: [],
    exposureCurrent: CARS[0]?.exposure ?? 1,
    revT: 0,
    introArmed: false,
  },
  setCarIndex: (i) => set({ carIndex: i }),
  cycleCar: () => set({ carIndex: (get().carIndex + 1) % CARS.length }),
  toggleTheme: () =>
    set({ themeName: get().themeName === 'dusk' ? 'night' : 'dusk' }),
  setSectionIndex: (i) => set({ sectionIndex: i }),
  triggerRev: () => {
    get().refs.revT = 1;
  },
  armIntro: () => {
    get().refs.introArmed = true;
  },
}));

/** Read-only accessor for the imperative refs bag. */
export const useRefsBag = (): Refs => useAppStore((s) => s.refs);
