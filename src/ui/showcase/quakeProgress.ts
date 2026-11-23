import { easedProgress } from '../../hooks/useScrollStudy';

function quakeTravel(el: HTMLElement) {
  return easedProgress(Number(el.dataset.studyProgress ?? 0), 0.02, 0.55);
}

export function advanceQuake(el: HTMLElement, progress: number) {
  const mapReveal = easedProgress(progress, 0.43, 0.72);
  const depths = easedProgress(progress, 0.65, 0.94);
  el.style.setProperty('--directed-map-reveal', mapReveal.toFixed(3));
  el.style.setProperty('--directed-depth-reveal', depths.toFixed(3));
  el.style.setProperty('--map-scale', (1.16 - mapReveal * 0.16).toFixed(3));
  el.dataset.studyProgress = progress.toFixed(3);
  const view = mapReveal >= 1 ? 'map' : 'globe';
  if (el.dataset.quakeView !== view) el.dataset.quakeView = view;
  const canvas = el.querySelector('canvas');
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
  if (progress <= 0.43 || progress >= 0.94) return progress;
  return progress < 0.68 ? 0.43 : 0.94;
}
