import { useGarageStudio } from './state';
import { cancelStudioTour, clearSignatureBookmark } from './studioTour';

export function restoreStudioFocus() {
  if (useGarageStudio.getState().active) return;
  cancelStudioTour();
  clearSignatureBookmark();
  Array.from(document.querySelectorAll<HTMLButtonElement>('.all-controls-trigger'))
    .find((button) => button.getClientRects().length)
    ?.focus({ preventScroll: true });
}
