import { create } from 'zustand';
import type * as THREE from 'three';
import { CARS, DEFAULT_CAR_INDEX, F40_INDEX, GARAGE_INDICES, adjacentCar } from './config';
import { paintChoices, type ActiveBodyColor } from './paint';
import type { ColorMaterial, Lamp, ThemeName } from './types';
import { cameraViews, isFerrariView, type CameraView } from './three/cameraViews';
import * as lighting from './lighting';
import { clampCarZoom } from './three/carZoom';

type Refs = {
  bodyMaterial: ColorMaterial | null;
  bodyOriginalColor: THREE.Color | null;
  lamps: Lamp[];
  f40HeadlightBeam?: number;
  afterHoursBlend: number;
  exposureCurrent: number;
  floorReflection: number;
  lightPulseT: number;
  carModel: THREE.Object3D | null;
  holdOpeningPose: boolean;
  onOpeningFrame: (() => void) | null;
  // Set once the first GLB has loaded, which is what releases the intro animation.
  introArmed: boolean;
};

type AppState = {
  carIndex: number;
  themeName: ThemeName;
  sectionIndex: number;
  isContactVisible: boolean;
  renderFinish: RenderFinish | null;
  setRenderFinish: (finish: RenderFinish | null) => void;
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
  renderedCarIndex: number | null;
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
  setCarLoading: (loading: boolean, renderedCarIndex?: number) => void;
  setCarLoadError: (error: string | null) => void;
  retryCar: () => void;
  applyBodyColor: (color: ActiveBodyColor) => void;
  cycleBodyColor: () => void;
};

export type RenderFinish = 'studio' | 'clay';

export function canStudyRender(state: AppState): boolean {
  return (
    state.carIndex === 0 &&
    state.sectionIndex === 0 &&
    !state.isCarLoading &&
    !state.carLoadError &&
    !state.sceneUnavailable
  );
}

function resetFerrariView(state: AppState) {
  if (!isFerrariView(state.cameraView)) return {};
  return {
    cameraView: 'front' as const,
    cameraResetVersion: state.cameraResetVersion + 1,
    hasManualView: false,
    cameraZoom: 1,
  };
}

function initialCarIndex() {
  if (typeof location === 'undefined') return DEFAULT_CAR_INDEX;
  const sharedCar = new URLSearchParams(location.search).get('car');
  const index = sharedCar?.trim() ? Number(sharedCar) : NaN;
  return Number.isInteger(index) && index >= 0 && index < CARS.length ? index : DEFAULT_CAR_INDEX;
}

const initialIndex = initialCarIndex();
const initialTheme = lighting.readOpeningTheme();

export const useAppStore = create<AppState>((set, get) => ({
  carIndex: initialIndex,
  themeName: initialTheme,
  sectionIndex: 0,
  isContactVisible: false,
  renderFinish: null,
  setRenderFinish: (finish) => {
    if (finish === null || canStudyRender(get())) set({ renderFinish: finish });
  },
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
    const preset = cameraViews(state)[view];
    if (!preset || state.isContactVisible) return;
    set({
      cameraView: view,
      cameraViewVersion: state.cameraViewVersion + 1,
      cameraZoom: preset.zoom,
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
  renderedCarIndex: null,
  carLoadError: null,
  carRetryVersion: 0,
  sceneUnavailable: false,
  sceneRetryVersion: 0,
  retryScene: () =>
    set((state) => ({
      ...resetFerrariView(state),
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
  headlightsRaised: lighting.openingHeadlights(initialIndex, initialTheme),
  hasPopupHeadlights: false,
  toggleHeadlights: () => {
    const { carIndex, hasPopupHeadlights, isCarLoading, headlightsRaised } = get();
    const supportsHeadlights = carIndex === F40_INDEX || CARS[carIndex].popupHeadlights;
    if (supportsHeadlights && hasPopupHeadlights && !isCarLoading)
      set({ headlightsRaised: !headlightsRaised });
  },
  refs: {
    bodyMaterial: null,
    bodyOriginalColor: null,
    lamps: [],
    afterHoursBlend: 0,
    exposureCurrent: CARS[initialIndex].exposure,
    floorReflection: 1,
    lightPulseT: 0,
    carModel: null,
    holdOpeningPose: false,
    onOpeningFrame: null,
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
      headlightsRaised: lighting.openingHeadlights(i, get().themeName),
      hasPopupHeadlights: false,
      carIndex: i,
      cameraZoom: 1,
      ...resetFerrariView(get()),
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
    const themeName =
      lighting.LIGHTING_MODES[Math.floor(Math.random() * lighting.LIGHTING_MODES.length)];
    set({
      carIndex: nextIndex,
      cameraZoom: 1,
      ...resetFerrariView(get()),
      drsOpen: false,
      hasDRS: false,
      headlightsRaised: lighting.openingHeadlights(nextIndex, themeName),
      hasPopupHeadlights: false,
      themeName,
      activeBodyColor: colors[Math.floor(Math.random() * colors.length)] ?? 'original',
      hasBodyMaterial: false,
    });
  },
  setThemeName: (theme) => set(lighting.openingLighting(get(), theme)),
  toggleTheme: () => get().setThemeName(lighting.nextLighting(get().themeName)),
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
      cameraView: 'front',
      cameraResetVersion: state.cameraResetVersion + 1,
      hasManualView: false,
      cameraZoom: 1,
    })),
  armIntro: () => {
    get().refs.introArmed = true;
  },
  setHasBodyMaterial: (v) => set({ hasBodyMaterial: v }),
  setCarLoading: (loading, renderedCarIndex) =>
    set(
      loading
        ? { isCarLoading: true, renderedCarIndex: null, drsOpen: false, hasDRS: false }
        : { isCarLoading: false, renderedCarIndex: renderedCarIndex ?? null },
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
