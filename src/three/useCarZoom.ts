import { useRef } from 'react';
import type { Object3D } from 'three';
import { useAppStore } from '../store';
import { clamp, lerp, smoothTowards } from '../math';
import { CarFraming } from './carFraming';
import { isOpeningStudio, STUDIO_TALL_ASPECT } from '../lighting';
import { studioMobileDistance } from './studio/carGrounding';
import type { StudioFraming } from './studio/cameraFraming';
import { zoomedIntroDistance } from './carZoom';

type View = {
  model: Object3D | null;
  azimuth: number;
  elevation: number;
  distance: number;
  targetY: number;
  width: number;
  height: number;
  fov: number;
  scrollT: number;
  dt: number;
  reduced: boolean;
  manualOrbit: boolean;
  clean: boolean;
  studioShot: StudioFraming;
};

export function useCarZoom() {
  const framing = useRef(new CarFraming());
  const current = useRef({ zoom: 1, resetVersion: 0 });
  return (view: View) => {
    if (view.clean) return view.distance;
    const { model, azimuth, elevation, distance, targetY, width, height, fov, scrollT } = view;
    const state = useAppStore.getState();
    const reset = current.current.resetVersion !== state.cameraResetVersion;
    current.current.resetVersion = state.cameraResetVersion;
    current.current.zoom =
      view.reduced || reset
        ? state.cameraZoom
        : smoothTowards(current.current.zoom, state.cameraZoom, Math.min(1, view.dt * 12));
    if (Math.abs(current.current.zoom - state.cameraZoom) < 0.001)
      current.current.zoom = state.cameraZoom;
    const { rear, wheel } = view.studioShot;
    const mobile = width < 768;
    const baseDistance = distance * (1 - 0.02 * rear);
    const base =
      scrollT === 0 && view.manualOrbit
        ? mobile && rear > 0
          ? studioMobileDistance(
              model,
              azimuth,
              elevation,
              baseDistance,
              targetY,
              width,
              height,
              fov,
            )
          : framing.current.fit(
              model,
              azimuth,
              elevation,
              baseDistance,
              targetY,
              width,
              height,
              fov,
            )
        : baseDistance;
    const zoom = current.current.zoom;
    const aspect = width / height;
    if (wheel > 0) {
      const close = mobile ? 3.77 * Math.max(1, 0.43 / aspect) : 2.84;
      return zoomedIntroDistance(lerp(base, close, wheel), zoom, scrollT);
    }
    if (
      !isOpeningStudio(state) ||
      width >= 768 ||
      scrollT !== 0 ||
      (zoom <= 1 && aspect >= STUDIO_TALL_ASPECT)
    )
      return zoomedIntroDistance(base, zoom, scrollT);

    const minimum = studioMobileDistance(model, azimuth, elevation, 0, targetY, width, height, fov);
    // Leave room to zoom in when the settled shot already fills a tall screen.
    const headroom = clamp((STUDIO_TALL_ASPECT - aspect) / 0.05, 0, 1) * 0.1;
    const fitted = headroom > 0 ? Math.max(base, minimum * (1 + headroom)) : base;
    return Math.max(zoomedIntroDistance(fitted, zoom, scrollT), minimum);
  };
}
