import type { ThemeName } from '../types';

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

export type CameraView = keyof typeof DEFAULT_VIEWS;

export function cameraViews(theme: ThemeName, renderFinish: string | null, mobile = false) {
  if (theme !== 'studio' || renderFinish) return DEFAULT_VIEWS;
  return mobile ? MOBILE_STUDIO_VIEWS : STUDIO_VIEWS;
}
