import { easedProgress } from '../../hooks/useScrollStudy';
import './gardenFocus.css';

const entrances = [
  [0.13, 0.67],
  [0, 0.64],
  [0.28, 0.84],
] as const;

export function advanceGarden(el: HTMLElement, progress: number) {
  for (const [index, [start, end]] of entrances.entries()) {
    el.style.setProperty('--growth-' + index, easedProgress(progress, start, end).toFixed(3));
  }
  el.style.setProperty('--note-ink', easedProgress(progress, 0.38, 0.87).toFixed(3));
  el.dataset.studyProgress = progress.toFixed(3);
}
