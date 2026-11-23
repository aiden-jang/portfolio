import { isOpeningStudio } from '../lighting';

const DEFAULT_VIEWS = {
  front: { label: 'Front view', azimuth: 0, elevation: 0.19, zoom: 1 },
  profile: { label: 'Profile view', azimuth: Math.PI / 2, elevation: 0.16, zoom: 1 },
  detail: { label: 'Detail view', azimuth: 0.8, elevation: 0.42, zoom: 1.15 },
} as const;

const STUDIO_VIEWS = {
  ...DEFAULT_VIEWS,
  detail: { label: 'Corner view', azimuth: 0.095, elevation: 0.19, zoom: 1 },
} as const;

const MOBILE_STUDIO_VIEWS = {
  ...STUDIO_VIEWS,
  detail: { ...STUDIO_VIEWS.detail, azimuth: 0.49 },
} as const;

const FERRARI_VIEWS = {
  rear: { label: 'Rear three-quarter', azimuth: 2.54, elevation: 0.245, zoom: 1 },
  wheel: { label: 'Front wheel close-up', azimuth: 1.39, elevation: 0.14, zoom: 1 },
} as const;

const MOBILE_FERRARI_VIEWS = {
  rear: { ...FERRARI_VIEWS.rear, azimuth: 2.56 },
  wheel: { ...FERRARI_VIEWS.wheel, azimuth: 1.31 },
} as const;

const FERRARI_STUDIO_VIEWS = { ...STUDIO_VIEWS, ...FERRARI_VIEWS };
const MOBILE_FERRARI_STUDIO_VIEWS = { ...MOBILE_STUDIO_VIEWS, ...MOBILE_FERRARI_VIEWS };

export type CameraView = keyof typeof DEFAULT_VIEWS | keyof typeof FERRARI_VIEWS;
type Preset = { label: string; azimuth: number; elevation: number; zoom: number };

type Context = { renderFinish: string | null; carIndex: number };

export function isFerrariView(view: CameraView) {
  return view === 'rear' || view === 'wheel';
}

export function isFerrariCameraFocused(
  state: Parameters<typeof isOpeningStudio>[0] &
    Pick<Context, 'carIndex'> & {
      hasManualView: boolean;
      cameraView: CameraView;
      isCarLoading: boolean;
      carLoadError: string | null;
      sceneUnavailable: boolean;
    },
) {
  return (
    isOpeningStudio(state) &&
    state.carIndex === 0 &&
    state.hasManualView &&
    !state.isCarLoading &&
    !state.carLoadError &&
    !state.sceneUnavailable &&
    isFerrariView(state.cameraView)
  );
}

export function cameraViews(state: Context, mobile = false): Partial<Record<CameraView, Preset>> {
  if (state.renderFinish) return DEFAULT_VIEWS;
  if (state.carIndex === 0) return mobile ? MOBILE_FERRARI_STUDIO_VIEWS : FERRARI_STUDIO_VIEWS;
  return mobile ? MOBILE_STUDIO_VIEWS : STUDIO_VIEWS;
}
