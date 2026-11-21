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
type Swap = {
  outgoing: number;
  incoming: number;
  still: string | null;
  paint: string;
  headlightsRaised: boolean;
  drsOpen: boolean;
};
export const useMatchedSwap = create(() => ({ swap: null as Swap | null }));

function swapStudioCar(incoming: number) {
  const app = useAppStore.getState();
  const previous = useMatchedSwap.getState().swap;
  const outgoing = previous?.outgoing ?? app.carIndex;
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
  useMatchedSwap.setState({
    swap: {
      outgoing,
      incoming,
      still,
      paint: previous?.paint ?? app.activeBodyColor,
      headlightsRaised: previous?.headlightsRaised ?? app.headlightsRaised,
      drsOpen: previous?.drsOpen ?? app.drsOpen,
    },
  });
  stageStudioCut(() => {
    const studio = useGarageStudio.getState();
    if (!studio.active || useMatchedSwap.getState().swap?.incoming !== incoming) return;
    studio.selectCar(incoming);
    useAppStore.setState({ isCarLoading: true });
    useGarageStudy.setState({ camera, look });
    repaintStudio();
  }, true);
  repaintStudio();
}

export function chooseStudioCar(incoming: number) {
  const studio = useGarageStudio.getState();
  if (
    studio.chapter === 'walk' &&
    useGarageExhibit.getState().exhibit === 'free' &&
    (useMatchedSwap.getState().swap || !useAppStore.getState().carLoadError)
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
    return () => clearStudioCut();
  }, []);
  return swap;
}

export function keepPreviousCar() {
  const { swap } = useMatchedSwap.getState();
  if (!swap) return;
  const { camera, look } = useGarageStudy.getState();
  clearStudioCut();
  useMatchedSwap.setState({ swap: null });
  const app = useAppStore.getState();
  app.setCarIndex(swap.outgoing);
  useAppStore.setState({
    carLoadError: null,
    headlightsRaised: swap.headlightsRaised,
    drsOpen: swap.drsOpen,
  });
  app.applyBodyColor(swap.paint);
  useGarageStudy.setState({ camera, look, playing: false });
  repaintStudio();
}
