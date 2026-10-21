import { create } from 'zustand';
import type * as THREE from 'three';
import { CARS } from './config';
import { paintChoices, type ActiveBodyColor } from './paint';
import type { ColorMaterial, Lamp, ThemeName } from './types';

export type { ActiveBodyColor } from './paint';

type Refs = {
  bodyMaterial: ColorMaterial | null;
  bodyOriginalColor: THREE.Color | null;
  lamps: Lamp[];
  exposureCurrent: number;
  revT: number;
  // Set once the first GLB has loaded, which is what releases the intro animation.
  introArmed: boolean;
};

type AppState = {
  carIndex: number;
  themeName: ThemeName;
  sectionIndex: number;
  isContactVisible: boolean;
  // Incremented to ask CameraRig to drop any manual orbit offsets.
  cameraResetVersion: number;
  activeBodyColor: ActiveBodyColor;
  hasBodyMaterial: boolean;
  isCarLoading: boolean;
  carLoadError: string | null;
  carRetryVersion: number;

  refs: Refs;

  setCarIndex: (i: number) => void;
  cycleCar: () => void;
  prevCar: () => void;
  randomizeGarage: () => void;
  setThemeName: (theme: ThemeName) => void;
  toggleTheme: () => void;
  setSectionIndex: (i: number) => void;
  setContactVisible: (visible: boolean) => void;
  triggerRev: () => void;
  resetCamera: () => void;
  armIntro: () => void;
  setHasBodyMaterial: (v: boolean) => void;
  setCarLoading: (v: boolean) => void;
  setCarLoadError: (error: string | null) => void;
  retryCar: () => void;
  applyBodyColor: (color: ActiveBodyColor) => void;
  cycleBodyColor: () => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  carIndex: 0,
  themeName: 'dusk',
  sectionIndex: 0,
  isContactVisible: false,
  cameraResetVersion: 0,
  activeBodyColor: 'original',
  hasBodyMaterial: false,
  isCarLoading: true,
  carLoadError: null,
  carRetryVersion: 0,
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
  cycleCar: () => get().setCarIndex((get().carIndex + 1) % CARS.length),
  prevCar: () => get().setCarIndex((get().carIndex - 1 + CARS.length) % CARS.length),
  randomizeGarage: () => {
    const { carIndex: currentIndex } = get();
    const refs = get().refs;
    refs.bodyMaterial = null;
    refs.bodyOriginalColor = null;
    const offset = 1 + Math.floor(Math.random() * (CARS.length - 1));
    const nextIndex = (currentIndex + offset) % CARS.length;
    const colors = paintChoices(CARS[nextIndex]).map(({ value }) => value);
    set({
      carIndex: nextIndex,
      themeName: Math.random() > 0.5 ? 'dusk' : 'night',
      activeBodyColor: colors[Math.floor(Math.random() * colors.length)] ?? 'original',
      hasBodyMaterial: false,
    });
  },
  setThemeName: (theme) => set({ themeName: theme }),
  toggleTheme: () => set({ themeName: get().themeName === 'dusk' ? 'night' : 'dusk' }),
  setSectionIndex: (i) => set({ sectionIndex: i }),
  setContactVisible: (isContactVisible) => set({ isContactVisible }),
  triggerRev: () => {
    get().refs.revT = 1;
  },
  resetCamera: () => set((state) => ({ cameraResetVersion: state.cameraResetVersion + 1 })),
  armIntro: () => {
    get().refs.introArmed = true;
  },
  setHasBodyMaterial: (v) => set({ hasBodyMaterial: v }),
  setCarLoading: (v) => set({ isCarLoading: v }),
  setCarLoadError: (carLoadError) => set({ carLoadError }),
  retryCar: () =>
    set((state) => ({
      carLoadError: null,
      isCarLoading: true,
      carRetryVersion: state.carRetryVersion + 1,
    })),
  applyBodyColor: (color) => {
    if (CARS[get().carIndex].fixedLivery) color = 'original';
    const refs = get().refs;
    const mat = refs.bodyMaterial;
    if (!mat?.color) return;
    if (color === 'original') {
      const finish = CARS[get().carIndex].defaultPaint;
      if (finish.preserveSource && refs.bodyOriginalColor) mat.color.copy(refs.bodyOriginalColor);
      else mat.color.set(finish.hex);
    } else {
      mat.color.set(color);
    }
    set({ activeBodyColor: color });
  },
  cycleBodyColor: () => {
    const order = paintChoices(CARS[get().carIndex]).map(({ value }) => value);
    const idx = order.indexOf(get().activeBodyColor);
    const next = order[(idx + 1) % order.length];
    get().applyBodyColor(next);
  },
}));
