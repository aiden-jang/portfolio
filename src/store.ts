import { create } from 'zustand';
import type * as THREE from 'three';
import { CARS, GARAGE_INDICES, adjacentCar } from './config';
import { paintChoices, type ActiveBodyColor } from './paint';
import type { ColorMaterial, Lamp, ThemeName } from './types';
import { CAMERA_VIEWS, type CameraView } from './three/cameraViews';
import { clampCarZoom } from './three/carZoom';

type Refs = {
  bodyMaterial: ColorMaterial | null;
  bodyOriginalColor: THREE.Color | null;
  lamps: Lamp[];
  exposureCurrent: number;
  lightPulseT: number;
  carModel: THREE.Object3D | null;
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
  hasManualView: boolean;
  cameraZoom: number;
  cameraView: CameraView;
  cameraViewVersion: number;
  setCameraView: (view: CameraView) => void;
  setCameraZoom: (value: number) => void;
  activeBodyColor: ActiveBodyColor;
  hasBodyMaterial: boolean;
  isCarLoading: boolean;
  carLoadError: string | null;
  carRetryVersion: number;
  sceneUnavailable: boolean;
  sceneRetryVersion: number;
  retryScene: () => void;
  drsOpen: boolean;
  hasDRS: boolean;
  toggleDRS: () => void;
  headlightsRaised: boolean;
  hasPopupHeadlights: boolean;
  toggleHeadlights: () => void;

  refs: Refs;

  setCarIndex: (i: number) => void;
  cycleCar: () => void;
  prevCar: () => void;
  randomizeGarage: () => void;
  setThemeName: (theme: ThemeName) => void;
  toggleTheme: () => void;
  setSectionIndex: (i: number) => void;
  setContactVisible: (visible: boolean) => void;
  pulseCarLights: () => void;
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
  hasManualView: false,
  cameraView: 'front',
  cameraViewVersion: 0,
  setCameraView: (view) => {
    const state = get();
    if (
      state.sectionIndex !== 0 ||
      state.isCarLoading ||
      state.carLoadError ||
      state.sceneUnavailable
    )
      return;
    set({
      cameraView: view,
      cameraViewVersion: state.cameraViewVersion + 1,
      cameraZoom: CAMERA_VIEWS[view].zoom,
      hasManualView: true,
    });
  },
  cameraZoom: 1,
  setCameraZoom: (value) => {
    const state = get();
    if (
      state.sectionIndex !== 0 ||
      state.isCarLoading ||
      state.carLoadError ||
      state.sceneUnavailable
    )
      return;
    const cameraZoom = clampCarZoom(value);
    if (cameraZoom !== state.cameraZoom) set({ cameraZoom, hasManualView: true });
  },
  activeBodyColor: 'original',
  hasBodyMaterial: false,
  isCarLoading: true,
  carLoadError: null,
  carRetryVersion: 0,
  sceneUnavailable: false,
  sceneRetryVersion: 0,
  retryScene: () =>
    set((state) => ({
      sceneUnavailable: false,
      sceneRetryVersion: state.sceneRetryVersion + 1,
      isCarLoading: true,
      hasBodyMaterial: false,
      carLoadError: null,
      hasManualView: false,
      cameraZoom: 1,
    })),
  drsOpen: false,
  hasDRS: false,
  toggleDRS: () => {
    const state = get();
    if (CARS[state.carIndex].drs && state.hasDRS && !state.isCarLoading && !state.carLoadError)
      set({ drsOpen: !state.drsOpen });
  },
  headlightsRaised: true,
  hasPopupHeadlights: false,
  toggleHeadlights: () => {
    const state = get();
    if (CARS[state.carIndex].popupHeadlights && state.hasPopupHeadlights && !state.isCarLoading)
      set({ headlightsRaised: !state.headlightsRaised });
  },
  refs: {
    bodyMaterial: null,
    bodyOriginalColor: null,
    lamps: [],
    exposureCurrent: CARS[0]?.exposure ?? 1,
    lightPulseT: 0,
    carModel: null,
    introArmed: false,
  },
  setCarIndex: (i) => {
    const refs = get().refs;
    refs.bodyMaterial = null;
    refs.bodyOriginalColor = null;
    refs.lightPulseT = 0;
    set({
      drsOpen: false,
      hasDRS: false,
      headlightsRaised: true,
      hasPopupHeadlights: false,
      carIndex: i,
      cameraZoom: 1,
      activeBodyColor: 'original',
      hasBodyMaterial: false,
    });
  },
  cycleCar: () => get().setCarIndex(adjacentCar(get().carIndex, 1)),
  prevCar: () => get().setCarIndex(adjacentCar(get().carIndex, -1)),
  randomizeGarage: () => {
    const { carIndex: currentIndex } = get();
    const refs = get().refs;
    refs.bodyMaterial = null;
    refs.bodyOriginalColor = null;
    const choices = GARAGE_INDICES.filter((index) => index !== currentIndex);
    const nextIndex = choices[Math.floor(Math.random() * choices.length)];
    const colors = paintChoices(CARS[nextIndex]).map(({ value }) => value);
    set({
      carIndex: nextIndex,
      cameraZoom: 1,
      drsOpen: false,
      hasDRS: false,
      headlightsRaised: true,
      hasPopupHeadlights: false,
      themeName: Math.random() > 0.5 ? 'dusk' : 'night',
      activeBodyColor: colors[Math.floor(Math.random() * colors.length)] ?? 'original',
      hasBodyMaterial: false,
    });
  },
  setThemeName: (theme) => set({ themeName: theme }),
  toggleTheme: () => set({ themeName: get().themeName === 'dusk' ? 'night' : 'dusk' }),
  setSectionIndex: (i) => set({ sectionIndex: i }),
  setContactVisible: (isContactVisible) => set({ isContactVisible }),
  pulseCarLights: () => {
    const state = get();
    if (
      !state.isCarLoading &&
      !state.carLoadError &&
      (state.sectionIndex === 0 || state.isContactVisible) &&
      state.refs.lamps.length
    )
      state.refs.lightPulseT = 1;
  },
  resetCamera: () =>
    set((state) => ({
      cameraResetVersion: state.cameraResetVersion + 1,
      hasManualView: false,
      cameraZoom: 1,
    })),
  armIntro: () => {
    get().refs.introArmed = true;
  },
  setHasBodyMaterial: (v) => set({ hasBodyMaterial: v }),
  setCarLoading: (v) =>
    set(
      v
        ? {
            isCarLoading: true,
            drsOpen: false,
            hasDRS: false,
          }
        : { isCarLoading: false },
    ),
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
