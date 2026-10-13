import { CARS, SECTION_IDS } from '../config';
import { useAppStore } from '../store';

type NavigationActions = {
  goToSection: (index: number) => void;
  nextCar: () => void;
  previousCar: () => void;
};

export function handleNavigationKey(
  e: KeyboardEvent,
  sectionIndex: number,
  actions: NavigationActions,
): void {
  const target = e.target as HTMLElement | null;
  const inField =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    !!target?.isContentEditable ||
    !!target?.closest('button, a, summary, select');
  const readingProjects =
    (sectionIndex === 2 || target?.closest('.garage-project-list')) &&
    ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key);
  if (inField || readingProjects) return;
  if (/^[1-9]$/.test(e.key)) {
    const carIndex = Number(e.key) - 1;
    if (carIndex < CARS.length) {
      e.preventDefault();
      const state = useAppStore.getState();
      if (!state.isCarLoading && state.carIndex !== carIndex) state.setCarIndex(carIndex);
    }
    return;
  }
  switch (e.key) {
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      e.preventDefault();
      actions.goToSection(sectionIndex + 1);
      break;
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      actions.goToSection(sectionIndex - 1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      actions.nextCar();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      actions.previousCar();
      break;
    case 'Home':
      e.preventDefault();
      actions.goToSection(0);
      break;
    case 'End':
      e.preventDefault();
      actions.goToSection(SECTION_IDS.length - 1);
      break;
    case 'c':
    case 'C':
      e.preventDefault();
      if (!useAppStore.getState().isCarLoading) useAppStore.getState().cycleBodyColor();
      break;
    case 'b':
    case 'B':
      e.preventDefault();
      useAppStore.getState().toggleTheme();
      break;
    case 'r':
    case 'R':
      e.preventDefault();
      useAppStore.getState().triggerRev();
      break;
    case 'v':
    case 'V':
      e.preventDefault();
      useAppStore.getState().resetCamera();
      break;
    case 'x':
    case 'X':
      e.preventDefault();
      if (!useAppStore.getState().isCarLoading) useAppStore.getState().randomizeGarage();
      break;
  }
}
