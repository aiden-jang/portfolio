import { easedProgress } from '../../hooks/useScrollStudy';
import './gardenFocus.css';

export function advanceGarden(el: HTMLElement, progress: number) {
  el.style.setProperty('--flower-focus', easedProgress(progress, 0.08, 0.75).toFixed(3));
  el.style.setProperty('--note-ink', easedProgress(progress, 0.33, 0.79).toFixed(3));
  el.dataset.studyProgress = progress.toFixed(3);
}
