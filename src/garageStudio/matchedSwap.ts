import { resetExhibit, useGarageExhibit } from '../garageExhibits/state';
import { useEffect } from 'react';
import { create } from 'zustand';
import { CARS, GARAGE_INDICES } from '../config';
import { useGarageStudy } from '../garageStudy/state';
import { useAppStore } from '../store';
import { stopOrbitMotion } from './orbitMotion';
import { activeOrbit, repaintStudio, supportsDetail, useGarageStudio } from './state';
import { clearStudioCut, stageStudioCut } from './studioCut';

export const matchedRearYaw = 2.53;
type Swap = { outgoing: number; incoming: number; still: string | null };
export const useMatchedSwap = create(() => ({ swap: null as Swap | null }));

function swapStudioCar(incoming: number) {
  const app = useAppStore.getState();
  const outgoing = useMatchedSwap.getState().swap?.outgoing ?? app.carIndex;
  if (app.carIndex === incoming) return;
  const orbit = activeOrbit();
  stopOrbitMotion(orbit);
  const { camera, look } = useGarageStudy.getState();
  const atRear =
    camera === 'profile' &&
    (!look || look === 'studio') &&
    Math.abs(orbit.yaw - matchedRearYaw) < 0.022 &&
    Math.abs(orbit.pitch) < 0.012 &&
    Math.abs(orbit.zoom - 1) < 0.01;
  const still =
    atRear && GARAGE_INDICES.includes(incoming) ? CARS[incoming].file.replace('.glb', '') : null;
  useMatchedSwap.setState({ swap: { outgoing, incoming, still } });
  stageStudioCut(() => {
    const studio = useGarageStudio.getState();
    if (!studio.active || useMatchedSwap.getState().swap?.incoming !== incoming) return;
    studio.selectCar(incoming);
    useAppStore.setState({ isCarLoading: true });
    if (camera === 'profile') useGarageStudy.setState({ camera });
    repaintStudio();
  }, true);
  repaintStudio();
}

export function chooseStudioCar(incoming: number) {
  const studio = useGarageStudio.getState();
  if (
    studio.chapter === 'walk' &&
    useGarageExhibit.getState().exhibit === 'free' &&
    !useAppStore.getState().carLoadError
  ) {
    swapStudioCar(incoming);
    return;
  }
  if (studio.chapter === 'detail' && !supportsDetail(incoming)) studio.select('walk');
  clearStudioCut();
  useMatchedSwap.setState({ swap: null });
  resetExhibit();
  studio.selectCar(incoming);
  repaintStudio();
}

export function useMatchedCar(id: number, loading: boolean, error: string | null) {
  const swap = useMatchedSwap((s) => s.swap);
  useEffect(() => {
    if (swap?.incoming === id && !loading && !error) useMatchedSwap.setState({ swap: null });
  }, [swap, id, loading, error]);
  useEffect(() => {
    const clear = () => clearStudioCut(false);
    window.addEventListener('resize', clear);
    return () => {
      window.removeEventListener('resize', clear);
      clearStudioCut();
    };
  }, []);
  return swap;
}
