import { easedProgress } from '../../hooks/useScrollStudy';

function quakeTravel(stage: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  if (stage.hasAttribute('data-scene-arrival')) return 1;
  return easedProgress(Number(stage.dataset.studyProgress) || 0, 0.03, 0.6);
}

export function advanceQuake(stage: HTMLElement, progress: number) {
  const immediate =
    stage.hasAttribute('data-scene-arrival') ||
    matchMedia('(prefers-reduced-motion: reduce)').matches;
  stage.style.setProperty(
    '--depth-reveal',
    String(immediate ? 1 : easedProgress(progress, 0.32, 0.49)),
  );
  stage.toggleAttribute('data-depth-readings', immediate || progress >= 0.32);
  stage.dataset.studyProgress = progress.toFixed(3);
  const canvas = stage.querySelector('canvas');
  if (canvas) syncQuakeCamera(canvas);
}

export function setQuakeManual(element: HTMLElement | null, manual: boolean) {
  element?.closest('.quake-journey-run')?.toggleAttribute('data-quake-manual', manual);
}

export function syncQuakeCamera(canvas: HTMLCanvasElement) {
  const stage = canvas.closest<HTMLElement>('.quake-journey-run');
  if (stage && !stage.hasAttribute('data-quake-manual'))
    canvas.dispatchEvent(new CustomEvent('quake-journey', { detail: quakeTravel(stage) }));
}

export function settleQuake(progress: number) {
  return progress > 0.16 && progress < 0.6 ? 0.6 : progress;
}
