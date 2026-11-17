import { useRef } from 'react';
import type { Object3D } from 'three';
import { useAppStore } from '../store';
import { smoothTowards } from '../math';
import { CarFraming } from './carFraming';
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
    const base =
      scrollT === 0 && view.manualOrbit
        ? framing.current.fit(model, azimuth, elevation, distance, targetY, width, height, fov)
        : distance;
    return zoomedIntroDistance(base, current.current.zoom, scrollT);
  };
}
