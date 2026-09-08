import { create } from 'zustand';
import type * as THREE from 'three';
import { CARS } from './config';
import type { ColorMaterial, Lamp, ThemeName } from './types';

type Refs = {
  bodyMaterial: ColorMaterial | null;
  bodyOriginalColor: THREE.Color | null;
  lamps: Lamp[];
  exposureCurrent: number;
  revT: number;
  // Set once the first GLB has loaded, which is what releases the intro animation.
  introArmed: boolean;
};

// Any value other than "original" is a hex string.
export type ActiveBodyColor = 'original' | string;

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
  // Incremented to ask CameraRig to drop any manual orbit offsets.
  cameraResetVersion: number;
  activeBodyColor: ActiveBodyColor;
  hasBodyMaterial: boolean;
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
  applyBodyColor: (color: ActiveBodyColor) => void;
  cycleBodyColor: () => void;
};

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
    // "original" is prepended so the cycle matches the order the swatches are shown in.
    const order: ActiveBodyColor[] = ['original', ...BODY_COLOR_PALETTE];
    const idx = order.indexOf(get().activeBodyColor);
    const next = order[(idx + 1) % order.length];
    get().applyBodyColor(next);
  },
}));
