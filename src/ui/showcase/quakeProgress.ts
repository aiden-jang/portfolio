import { shortPhoneQuery } from '../../hooks/scrollArrival';
import { easedProgress } from '../../hooks/useScrollStudy';

function showReadings(el: HTMLElement) {
  return Boolean(el.dataset.sceneArrival) || matchMedia(shortPhoneQuery).matches;
}

function quakeTravel(el: HTMLElement) {
  const t = Number(el.dataset.studyProgress ?? 0);
  if (showReadings(el)) return 0;
  return easedProgress(t, 0.01, 0.6);
}

export function advanceQuake(el: HTMLElement, progress: number) {
  const result = showReadings(el);
  const mapReveal = result ? 0 : easedProgress(progress, 0.68, 0.94);
  const depths = result ? 1 : easedProgress(progress, 0.26, 0.54);
  el.style.setProperty('--agency-reveal', (result ? 0 : depths * (1 - mapReveal)).toFixed(3));
  el.style.setProperty(
    '--journey-pin',
    (result ? 0 : easedProgress(progress, 0.18, 0.42)).toFixed(3),
  );

  el.style.setProperty('--directed-map-reveal', mapReveal.toFixed(3));
  el.style.setProperty('--directed-depth-reveal', depths.toFixed(3));
  el.style.setProperty('--map-scale', (0.76 + mapReveal * 0.24).toFixed(3));
  el.toggleAttribute('data-quake-locked', !result && progress >= 0.68);
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
  if (progress <= 0.26 || progress >= 0.94) return progress;
  return progress < 0.71 ? 0.57 : 0.94;
}
