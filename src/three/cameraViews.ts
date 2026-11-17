export const CAMERA_VIEWS = {
  front: { label: 'Front view', azimuth: 0, elevation: 0.19, zoom: 1 },
  profile: { label: 'Profile view', azimuth: Math.PI / 2, elevation: 0.16, zoom: 1 },
  detail: { label: 'Detail view', azimuth: 0.8, elevation: 0.42, zoom: 1.15 },
} as const;
export type CameraView = keyof typeof CAMERA_VIEWS;
