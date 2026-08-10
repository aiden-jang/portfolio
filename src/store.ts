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

/** "original" restores the GLB's as-loaded color; any other value is a hex. */
export type ActiveBodyColor = 'original' | string;

/** Single source of truth for the body-color picker — drives both the swatch
 *  UI and the `cycleBodyColor` keyboard action. Order = swatch order. */
export const BODY_COLOR_SWATCHES: { hex: string; name: string }[] = [
  { hex: '#ff6b1c', name: 'Signal Orange' },
  { hex: '#b00020', name: 'Crimson' },
  { hex: '#0a0a0c', name: 'Gloss Black' },
  { hex: '#f5f1e8', name: 'Pearl White' },
  { hex: '#194527', name: 'Racing Green' },
  { hex: '#163a8a', name: 'Royal Blue' },
];
const BODY_COLOR_PALETTE = BODY_COLOR_SWATCHES.map((s) => s.hex);

type AppState = {
  // ---- React state (rare changes, triggers re-renders) ----
  carIndex: number;
  themeName: ThemeName;
  sectionIndex: number;
  /** Incremented to ask CameraRig to drop any manual orbit offsets. */
  cameraResetVersion: number;
  activeBodyColor: ActiveBodyColor;
  /** True once a car has loaded and its body material has been detected.
   *  Used by `ColorSwatches` to fade the swatch strip in. */
  hasBodyMaterial: boolean;
  /** True while the selected car model is being loaded into the scene. */
  isCarLoading: boolean;

  // ---- Imperative refs (high-frequency, do not trigger re-renders) ----
  refs: Refs;

  // ---- Actions ----
  setCarIndex: (i: number) => void;
  cycleCar: () => void;
  prevCar: () => void;
  randomizeGarage: () => void;
  setThemeName: (theme: ThemeName) => void;
  toggleTheme: () => void;
  setSectionIndex: (i: number) => void;
  triggerRev: () => void;
  resetCamera: () => void;
  armIntro: () => void;
  setHasBodyMaterial: (v: boolean) => void;
  setCarLoading: (v: boolean) => void;
  /** Set the body material to a palette color (or restore the original).
   *  Both the swatch click handler and the keyboard cycle route through here
   *  so the UI's active-swatch indicator stays in sync. */
  applyBodyColor: (color: ActiveBodyColor) => void;
  /** Pick a random palette color (skipping the current one) and apply it. */
  cycleBodyColor: () => void;
};

/** Single source of truth. React state for things that change on user actions
 *  (car, theme, section). High-frequency values (rev, body material, lamps)
 *  live on `refs` so 60fps updates don't cascade re-renders. */
export const useAppStore = create<AppState>((set, get) => ({
  carIndex: 0,
  themeName: 'dusk',
  sectionIndex: 0,
  cameraResetVersion: 0,
  activeBodyColor: 'original',
  hasBodyMaterial: false,
  isCarLoading: true,
  refs: {
    bodyMaterial: null,
    bodyOriginalColor: null,
    lamps: [],
    exposureCurrent: CARS[0]?.exposure ?? 1,
    revT: 0,
    introArmed: false,
  },
  setCarIndex: (i) => {
    const refs = get().refs;
    refs.bodyMaterial = null;
    refs.bodyOriginalColor = null;
    set({ carIndex: i, activeBodyColor: 'original', hasBodyMaterial: false });
  },
  cycleCar: () => {
    const refs = get().refs;
    refs.bodyMaterial = null;
    refs.bodyOriginalColor = null;
    set({
      carIndex: (get().carIndex + 1) % CARS.length,
      activeBodyColor: 'original',
      hasBodyMaterial: false,
    });
  },
  prevCar: () => {
    const refs = get().refs;
    refs.bodyMaterial = null;
    refs.bodyOriginalColor = null;
    set({
      carIndex: (get().carIndex - 1 + CARS.length) % CARS.length,
      activeBodyColor: 'original',
      hasBodyMaterial: false,
    });
  },
  randomizeGarage: () => {
    const { carIndex: currentIndex } = get();
    const refs = get().refs;
    refs.bodyMaterial = null;
    refs.bodyOriginalColor = null;
    const offset = 1 + Math.floor(Math.random() * (CARS.length - 1));
    const colors: ActiveBodyColor[] = ['original', ...BODY_COLOR_PALETTE];
    set({
      carIndex: (currentIndex + offset) % CARS.length,
      themeName: Math.random() > 0.5 ? 'dusk' : 'night',
      activeBodyColor: colors[Math.floor(Math.random() * colors.length)] ?? 'original',
      hasBodyMaterial: false,
    });
  },
  setThemeName: (theme) => set({ themeName: theme }),
  toggleTheme: () => set({ themeName: get().themeName === 'dusk' ? 'night' : 'dusk' }),
  setSectionIndex: (i) => set({ sectionIndex: i }),
  triggerRev: () => {
    get().refs.revT = 1;
  },
  resetCamera: () => set((state) => ({ cameraResetVersion: state.cameraResetVersion + 1 })),
  armIntro: () => {
    get().refs.introArmed = true;
  },
  setHasBodyMaterial: (v) => set({ hasBodyMaterial: v }),
  setCarLoading: (v) => set({ isCarLoading: v }),
  applyBodyColor: (color) => {
    const refs = get().refs;
    const mat = refs.bodyMaterial;
    if (!mat?.color) return;
    if (color === 'original') {
      if (refs.bodyOriginalColor) mat.color.copy(refs.bodyOriginalColor);
    } else {
      mat.color.set(color);
    }
    set({ activeBodyColor: color });
  },
  cycleBodyColor: () => {
    // Cycle in the visual order shown in the nav: Original → palette[0] → ... → wrap.
    const order: ActiveBodyColor[] = ['original', ...BODY_COLOR_PALETTE];
    const idx = order.indexOf(get().activeBodyColor);
    const next = order[(idx + 1) % order.length];
    get().applyBodyColor(next);
  },
}));
