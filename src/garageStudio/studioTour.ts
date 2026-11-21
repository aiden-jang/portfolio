import { create } from 'zustand';
import { useAppStore } from '../store';
import { openRearLouvers, selectExhibit } from '../garageExhibits/select';
import { useGarageExhibit } from '../garageExhibits/state';
import { alignPorsches } from '../garageExhibits/mechanical';
import { useGarageStudy } from '../garageStudy/state';
import { activeOrbit, repaintStudio, selectPose, useGarageStudio } from './state';

export function takeStudioSnapshot() {
  const stage = useGarageStudio.getState();
  const { carIndex, activeBodyColor, headlightsRaised, drsOpen, renderFinish } =
    useAppStore.getState();
  return {
    stage: {
      ...stage,
      orbit: { ...stage.orbit },
      detailOrbit: { ...stage.detailOrbit },
      pairOrbit: { ...stage.pairOrbit },
    },
    scene: { carIndex, activeBodyColor, headlightsRaised, drsOpen, renderFinish },
    exhibit: { ...useGarageExhibit.getState() },
    optics: { ...useGarageStudy.getState() },
    focus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
  };
}
export const useSignatureBookmark = create(() => ({
  snapshot: null as ReturnType<typeof takeStudioSnapshot> | null,
}));

export function clearSignatureBookmark() {
  useSignatureBookmark.setState({ snapshot: null });
}

let saved: ReturnType<typeof takeStudioSnapshot> | null = null;
export const useTour = create<{ index: number | null }>(() => ({ index: null }));

export function visitTourStop(index: number) {
  useTour.setState({ index });
  useGarageStudio.setState({ study: null, photo: null });
  useAppStore.setState({ renderFinish: null });
  if (index === 0) openRearLouvers();
  if (index === 1) {
    selectExhibit('lamps');
    useAppStore.setState({ headlightsRaised: true });
  }
  if (index === 2) {
    selectExhibit('porsche');
    alignPorsches(true);
  }
  if (index === 3) {
    const studio = useGarageStudio.getState();
    studio.select('walk');
    studio.selectCar(0);
    selectPose(0.7);
    activeOrbit().zoom = 1;
    useGarageStudy.setState({ camera: 'orbit', playing: false, refined: true, look: 'studio' });
    useGarageStudio.setState({ study: 'reflection' });
  }
  repaintStudio();
}

export function startStudioTour() {
  if (!saved) saved = takeStudioSnapshot();
  visitTourStop(0);
}

export function cancelStudioTour() {
  saved = null;
  useTour.setState({ index: null });
}

export function finishStudioTour() {
  const snapshot = saved;
  cancelStudioTour();
  if (!snapshot) return;
  restoreStudioSnapshot(snapshot);
}

export function restoreStudioSnapshot(snapshot: ReturnType<typeof takeStudioSnapshot>) {
  const studio = useGarageStudio.getState();
  studio.select(snapshot.stage.chapter);
  studio.selectCar(snapshot.scene.carIndex);
  useAppStore.setState(snapshot.scene);
  useAppStore.getState().applyBodyColor(snapshot.scene.activeBodyColor);
  useGarageStudio.setState(snapshot.stage);
  useGarageStudy.setState(snapshot.optics);
  useGarageExhibit.setState(snapshot.exhibit);
  repaintStudio();
  requestAnimationFrame(() => {
    const target = snapshot.focus;
    if (target?.isConnected && target.getClientRects().length)
      target.focus({ preventScroll: true });
    else
      document.querySelector<HTMLButtonElement>('.studio-return')?.focus({ preventScroll: true });
  });
}
