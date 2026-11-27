import { easedProgress } from '../../hooks/useScrollStudy';

export function advanceQuake(stage: HTMLElement, progress: number, reduced: boolean) {
  const value = progress.toFixed(4);
  if (stage.dataset.studyProgress === value && stage.hasAttribute('data-quake-static') === reduced)
    return;
  stage.dataset.studyProgress = value;
  stage.toggleAttribute('data-quake-static', reduced);
  const reveal = reduced ? 1 : easedProgress(progress, 0.46, 0.78);
  stage.style.setProperty('--depth-reveal', String(reveal));
  stage.toggleAttribute('data-depth-readings', reveal > 0);
  const canvas = stage.querySelector('canvas');
  if (canvas) syncQuakeCamera(canvas);
}

export function setQuakeManual(element: HTMLElement | null, manual: boolean) {
  element?.closest('.quake-journey-run')?.toggleAttribute('data-quake-manual', manual);
}

export function syncQuakeCamera(canvas: HTMLCanvasElement) {
  const stage = canvas.closest<HTMLElement>('.quake-journey-run');
  if (stage && !stage.hasAttribute('data-quake-manual')) {
    const progress = stage.hasAttribute('data-quake-static')
      ? 0
      : Number(stage.dataset.studyProgress || 0);
    canvas.dispatchEvent(new CustomEvent('quake-journey', { detail: progress }));
  }
}
