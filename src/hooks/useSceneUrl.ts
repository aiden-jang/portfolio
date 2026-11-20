import { useEffect, useRef, useState } from 'react';
import { CARS } from '../config';
import { useAppStore } from '../store';
import { parseScenePaint, type ActiveBodyColor } from '../paint';
import { parseLighting } from '../lighting';

export function useSceneUrl() {
  const setCarIndex = useAppStore((state) => state.setCarIndex);
  const setThemeName = useAppStore((state) => state.setThemeName);
  const applyBodyColor = useAppStore((state) => state.applyBodyColor);
  const hasBodyMaterial = useAppStore((state) => state.hasBodyMaterial);
  const carIndex = useAppStore((state) => state.carIndex);
  const activeBodyColor = useAppStore((state) => state.activeBodyColor);
  const themeName = useAppStore((state) => state.themeName);
  const scenePaintRef = useRef<ActiveBodyColor | null>(null);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const carIndex = Number(params.get('car'));
    if (Number.isInteger(carIndex) && carIndex >= 0 && carIndex < CARS.length)
      setCarIndex(carIndex);

    const light = params.get('light');
    if (light !== null) setThemeName(parseLighting(light));

    scenePaintRef.current = parseScenePaint(params.get('paint'));
    if (scenePaintRef.current && !CARS[useAppStore.getState().carIndex].fixedLivery)
      useAppStore.setState({ activeBodyColor: scenePaintRef.current });
    if (params.has('exhibit')) scenePaintRef.current = null;
    setSceneReady(true);
  }, [setCarIndex, setThemeName]);

  useEffect(() => {
    if (!sceneReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set('car', String(carIndex));
    url.searchParams.set('paint', activeBodyColor);
    url.searchParams.set('light', themeName);
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [activeBodyColor, carIndex, sceneReady, themeName]);

  // Paint has to wait for the GLB to expose its material. Clearing the ref after the first apply
  // keeps a later car change from silently reverting to the shared link's color.
  useEffect(() => {
    if (CARS[carIndex].fixedLivery) {
      scenePaintRef.current = null;
      return;
    }
    if (!hasBodyMaterial || !scenePaintRef.current) return;
    applyBodyColor(scenePaintRef.current);
    scenePaintRef.current = null;
  }, [applyBodyColor, carIndex, hasBodyMaterial]);
}
