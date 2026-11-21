import { returnToAboutShot } from './aboutShot';
import { useGarageStudio } from './state';
import { cancelStudioTour } from './studioTour';

export function restoreStudioFocus() {
  if (useGarageStudio.getState().active) return;
  cancelStudioTour();
  if (returnToAboutShot()) return;
  Array.from(document.querySelectorAll<HTMLButtonElement>('.all-controls-trigger'))
    .find((button) => button.getClientRects().length)
    ?.focus({ preventScroll: true });
}
