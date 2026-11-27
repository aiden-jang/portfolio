import { prefersReducedMotion } from '../hooks/reducedMotion';
import { clearStudioCut } from './studioCut';
import { useMatchedSwap } from './matchedSwap';
import { stopOrbitMotion } from './orbitMotion';
import { applyF40HeadlightPreset, parseStudioLighting, saveStudioLighting } from './lighting';
import { resetExhibit } from '../garageExhibits/state';
import { resetStudyCamera, startLineupGlide, track, useGarageStudy } from '../garageStudy/state';
import { create } from 'zustand';
import { useAppStore } from '../store';
import { useLineup } from '../lineup/state';
import { CARS } from '../config';
import { clamp } from '../math';
import { SCENE_ACTIVITY_EVENT } from '../three/useSceneActivity';

export type Chapter = 'walk' | 'detail' | 'light' | 'lineup';
export type Study = 'finished' | 'clay' | 'shadows' | 'reflection';
export type PhotoShape = 'portrait' | 'landscape';
export type Orbit = { yaw: number; shownYaw: number; pitch: number; zoom: number };

export const chapters: Record<Chapter, string> = {
  walk: 'Walkaround',
  detail: 'Details',
  light: 'Blackout',
  lineup: 'Lineup',
};
export const detailCars = [15, 16, 10] as const;
export const detailYaw = (car: number) => (car === 10 ? 0.02 : car === 16 ? 2.81 : 2.61);
export const photoRatio = (shape: PhotoShape) => (shape === 'portrait' ? 4 / 5 : 16 / 9);

function setup() {
  const {
    carIndex,
    themeName,
    activeBodyColor,
    drsOpen,
    headlightsRaised,
    cameraResetVersion,
    cameraZoom,
    cameraView,
    cameraViewVersion,
    hasManualView,
  } = useAppStore.getState();
  return {
    carIndex,
    themeName,
    activeBodyColor,
    drsOpen,
    headlightsRaised,
    cameraResetVersion,
    cameraZoom,
    cameraView,
    cameraViewVersion,
    hasManualView,
  };
}
function restoreCameraAndCar(saved: ReturnType<typeof setup>) {
  const app = useAppStore.getState();
  if (app.carIndex !== saved.carIndex) app.setCarIndex(saved.carIndex);
  useAppStore.setState(saved);
  useAppStore.getState().applyBodyColor(saved.activeBodyColor);
}

const pose = (yaw = 0.65): Orbit => ({ yaw, shownYaw: yaw, pitch: 0, zoom: 1 });
type StudioState = {
  firstFrameShown: boolean;
  active: boolean;
  chapter: Chapter;
  proposed: boolean;
  guides: boolean;
  photo: PhotoShape | null;
  study: Study | null;
  orbit: Orbit;
  detailOrbit: Orbit;
  pairOrbit: Orbit;
  saved: ReturnType<typeof setup> | null;
  beforeDetail: ReturnType<typeof setup> | null;
  open: () => void;
  close: () => void;
  select: (chapter: Chapter) => void;
  selectCar: (id: number) => void;
};

const openingView = {
  firstFrameShown: false,
  chapter: 'walk' as const,
  proposed: true,
  guides: false,
  photo: null,
  study: null,
};

export const useGarageStudio = create<StudioState>((set, get) => ({
  active: false,
  ...openingView,
  orbit: pose(),
  detailOrbit: pose(),
  pairOrbit: pose(),
  saved: null,
  beforeDetail: null,
  open: () => {
    if (get().active) return;
    resetStudyCamera();
    useGarageStudy.setState({ refined: true, look: null });
    set({
      active: true,
      ...openingView,
      saved: setup(),
      beforeDetail: null,
      orbit: pose(),
      detailOrbit: pose(),
      pairOrbit: pose(window.innerWidth < 768 ? -0.58 : 0.72),
    });
  },
  close: () => {
    clearStudioCut();
    useMatchedSwap.setState({ swap: null });
    useGarageStudy.setState({ look: null });
    const { saved } = get();
    resetExhibit();
    resetStudyCamera();
    useLineup.getState().close();
    if (saved) restoreCameraAndCar(saved);
    const url = new URL(window.location.href);
    if (url.searchParams.get('garage') === 'studio') {
      for (const name of [
        'garage',
        'scene',
        'exhibit',
        'louvers',
        'look',
        'studioLook',
        'focus',
        'wheel',
        'exhibitPaint',
        'aligned',
        'silhouette',
        'shot',
        'edges',
        'variant',
        'yaw',
        'pitch',
        'zoom',
        'part',
        'guides',
        'finish',
        'camera',
        'glide',
      ])
        url.searchParams.delete(name);
      window.history.replaceState(window.history.state, '', url);
    }
    set({ active: false, saved: null, beforeDetail: null, photo: null, study: null });
  },
  select: (chapter) => {
    const { chapter: last, beforeDetail } = get();
    if (last === chapter) return;
    clearStudioCut();
    useMatchedSwap.setState({ swap: null });
    useGarageStudy.setState({ look: null });
    resetExhibit();
    resetStudyCamera();
    if (last === 'detail' && beforeDetail) restoreCameraAndCar(beforeDetail);
    if (last === 'lineup') useLineup.getState().close();
    if (chapter === 'lineup') {
      useLineup.getState().open();
      if (!prefersReducedMotion()) {
        startLineupGlide();
        set({ proposed: false });
      }
    }
    if (chapter === 'detail') {
      const prior = setup();
      const id = supportsDetail(prior.carIndex) ? prior.carIndex : 15;
      get().selectCar(id);
      set({ chapter, beforeDetail: prior, photo: null, study: null });
    } else set({ chapter, beforeDetail: null, photo: null, study: null });
  },
  selectCar: (id) => {
    const app = useAppStore.getState();
    if (app.carIndex !== id) {
      resetStudyCamera();
      app.setCarIndex(id);
      if (get().chapter === 'walk') applyF40HeadlightPreset(useGarageStudy.getState().look);
    }
    if (supportsDetail(id)) Object.assign(get().detailOrbit, pose(detailYaw(id)));
  },
}));

export const supportsDetail = (id: number) => detailCars.some((car) => car === id);

export function activeOrbit(state = useGarageStudio.getState()) {
  return state.chapter === 'lineup'
    ? state.pairOrbit
    : state.chapter === 'detail'
      ? state.detailOrbit
      : state.orbit;
}

export function repaintStudio() {
  window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT));
}

export function selectPose(yaw: number) {
  const orbit = activeOrbit();
  stopOrbitMotion(orbit);
  orbit.yaw = yaw;
  orbit.pitch = 0;
  repaintStudio();
}

export const inBlackout = () => {
  const { active, chapter, proposed, study } = useGarageStudio.getState();
  const look = useGarageStudy.getState().look;
  return (
    active &&
    (look ? look === 'blackout' : chapter === 'light' && proposed) &&
    (!study || study === 'finished')
  );
};

export function shotUrl() {
  const state = useGarageStudio.getState();
  const current = activeOrbit(state);
  const app = useAppStore.getState();
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set('garage', 'studio');
  url.searchParams.set('scene', state.chapter);
  url.searchParams.delete('louvers');
  url.searchParams.delete('silhouette');
  url.searchParams.set('variant', state.proposed ? 'proposed' : 'current');
  url.searchParams.set('yaw', Math.atan2(Math.sin(current.yaw), Math.cos(current.yaw)).toFixed(5));
  url.searchParams.set('pitch', current.pitch.toFixed(4));
  url.searchParams.set('zoom', current.zoom.toFixed(4));
  url.searchParams.set('car', String(app.carIndex));
  url.searchParams.set('paint', app.activeBodyColor);
  url.searchParams.set(
    'part',
    (CARS[app.carIndex].drs ? app.drsOpen : app.headlightsRaised) ? 'up' : 'down',
  );
  const optics = useGarageStudy.getState();
  url.searchParams.set('finish', optics.refined ? 'refined' : 'current');
  saveStudioLighting(url.searchParams, app.themeName, state, optics.look);
  if (optics.camera !== 'orbit') url.searchParams.set('camera', optics.camera);
  else url.searchParams.delete('camera');
  if (optics.camera === 'glide') url.searchParams.set('glide', track.position.toFixed(4));
  else url.searchParams.delete('glide');
  if (state.guides) url.searchParams.set('guides', '1');
  else url.searchParams.delete('guides');
  return url.toString();
}

export function startFromLink(params: URLSearchParams) {
  const state = useGarageStudio.getState();
  state.open();
  const chapter = params.get('scene');
  if (chapter && Object.hasOwn(chapters, chapter)) state.select(chapter as Chapter);
  useGarageStudio.setState({
    proposed: params.has('variant')
      ? params.get('variant') !== 'current'
      : chapter !== 'lineup' || prefersReducedMotion(),
    guides: params.get('guides') === '1',
  });
  const camera = params.get('camera');
  const { chapter: view, proposed } = useGarageStudio.getState();
  const car = useAppStore.getState().carIndex;
  if (view === 'lineup' && (proposed || (params.has('variant') && camera !== 'glide')))
    resetStudyCamera();
  useGarageStudy.setState({
    refined: params.get('finish') !== 'current',
    look: parseStudioLighting(params.get('studioLook'), view),
  });
  if (
    view === 'walk' &&
    (camera === 'profile' || (car === 0 && camera === 'deck') || (car === 3 && camera === 'wheel'))
  ) {
    useGarageStudy.setState({ camera });
  } else if (view === 'lineup' && !proposed && camera === 'glide') {
    const position = Number(params.get('glide'));
    track.position = Number.isFinite(position) ? clamp(position, 0, 1) : 0;
    track.entry = 1;
    useGarageStudy.setState({ camera, playing: false });
  }
  const current = activeOrbit();
  for (const key of ['yaw', 'pitch', 'zoom'] as const) {
    if (!params.has(key)) continue;
    const n = Number(params.get(key));
    if (Number.isFinite(n))
      current[key] =
        key === 'zoom'
          ? clamp(n, useGarageStudy.getState().camera === 'deck' ? 0.64 : 0.8, 1.65)
          : key === 'pitch'
            ? clamp(n, -0.18, 0.22)
            : Math.atan2(Math.sin(n), Math.cos(n));
  }
  if (params.has('part')) {
    const up = params.get('part') === 'up';
    useAppStore.setState({ drsOpen: up, headlightsRaised: up });
  } else if (view === 'walk') applyF40HeadlightPreset(useGarageStudy.getState().look);
}
