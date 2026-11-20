import { resetStudyCamera, track, useGarageStudy } from '../garageStudy/state';
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

export const useGarageStudio = create<StudioState>((set, get) => ({
  active: false,
  chapter: 'walk',
  proposed: true,
  guides: false,
  photo: null,
  study: null,
  orbit: pose(),
  detailOrbit: pose(),
  pairOrbit: pose(),
  saved: null,
  beforeDetail: null,
  open: () => {
    if (get().active) return;
    resetStudyCamera();
    useGarageStudy.setState({ refined: true });
    set({
      active: true,
      chapter: 'walk',
      proposed: true,
      photo: null,
      study: null,
      guides: false,
      saved: setup(),
      beforeDetail: null,
      orbit: pose(),
      detailOrbit: pose(),
      pairOrbit: pose(window.innerWidth < 768 ? -0.58 : 0.72),
    });
  },
  close: () => {
    const { saved } = get();
    resetStudyCamera();
    useLineup.getState().close();
    if (saved) restoreCameraAndCar(saved);
    const url = new URL(window.location.href);
    if (url.searchParams.get('garage') === 'studio') {
      for (const name of [
        'garage',
        'scene',
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
    resetStudyCamera();
    if (last === 'detail' && beforeDetail) restoreCameraAndCar(beforeDetail);
    if (last === 'lineup') useLineup.getState().close();
    if (chapter === 'lineup') useLineup.getState().open();
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
    }
    const { detailOrbit } = get();
    if (supportsDetail(id)) Object.assign(detailOrbit, pose(detailYaw(id)));
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
  activeOrbit().yaw = yaw;
  activeOrbit().pitch = 0;
  repaintStudio();
}

export const inBlackout = () => {
  const { active, chapter, proposed, study } = useGarageStudio.getState();
  return active && chapter === 'light' && proposed && (!study || study === 'finished');
};

export function shotUrl() {
  const state = useGarageStudio.getState();
  const current = activeOrbit(state);
  const app = useAppStore.getState();
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set('garage', 'studio');
  url.searchParams.set('scene', state.chapter);
  url.searchParams.set('variant', state.proposed ? 'proposed' : 'current');
  url.searchParams.set(
    'yaw',
    Math.atan2(Math.sin(current.shownYaw), Math.cos(current.shownYaw)).toFixed(5),
  );
  url.searchParams.set('pitch', current.pitch.toFixed(4));
  url.searchParams.set('zoom', current.zoom.toFixed(4));
  url.searchParams.set('car', String(app.carIndex));
  url.searchParams.set('paint', app.activeBodyColor);
  url.searchParams.set('light', 'studio');
  url.searchParams.set(
    'part',
    (CARS[app.carIndex].drs ? app.drsOpen : app.headlightsRaised) ? 'up' : 'down',
  );
  const optics = useGarageStudy.getState();
  url.searchParams.set('finish', optics.refined ? 'refined' : 'current');
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
    proposed: params.get('variant') !== 'current',
    guides: params.get('guides') === '1',
  });
  const camera = params.get('camera');
  const { chapter: view, proposed } = useGarageStudio.getState();
  const car = useAppStore.getState().carIndex;
  useGarageStudy.setState({ refined: params.get('finish') !== 'current' });
  if (view === 'walk' && (camera === 'profile' || (car === 0 && camera === 'deck'))) {
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
  }
}
