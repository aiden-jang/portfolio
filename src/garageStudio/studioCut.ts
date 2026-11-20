import { prefersReducedMotion } from '../hooks/reducedMotion';

type Cut = { run: () => void; waitForCar: boolean; timer: number };
let next: Cut | undefined;
let previous: HTMLCanvasElement | undefined;
let animation: Animation | undefined;
let waiting = false;
let expiry = 0;

export function clearStudioCut(cancelPending = true) {
  if (cancelPending && next) {
    clearTimeout(next.timer);
    next = undefined;
  }
  animation?.cancel();
  previous?.remove();
  previous = undefined;
  animation = undefined;
  waiting = false;
  clearTimeout(expiry);
}

export function stageStudioCut(run: () => void, waitForCar: boolean) {
  clearStudioCut();
  if (!waitForCar && prefersReducedMotion()) {
    run();
    return;
  }
  const timer = window.setTimeout(() => {
    if (!next) return;
    next = undefined;
    run();
  }, 300);
  next = { run, waitForCar, timer };
}

function reveal(duration: number) {
  const plate = previous;
  if (!plate || animation) return;
  animation = plate.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration,
    easing: 'cubic-bezier(.22,.61,.36,1)',
    fill: 'forwards',
  });
  const remove = () => {
    plate.remove();
    if (previous === plate) clearStudioCut();
  };
  void animation.finished.then(remove, remove);
}

export function paintStudioCut(canvas: HTMLCanvasElement, loading: boolean, error: boolean) {
  if (previous && waiting && !loading && !error) clearStudioCut(false);
  const cut = next;
  if (!cut) return;
  clearTimeout(cut.timer);
  next = undefined;
  const plate = document.createElement('canvas');
  plate.width = canvas.width;
  plate.height = canvas.height;
  plate.className = 'studio-car-swap';
  plate.setAttribute('aria-hidden', 'true');
  const context = plate.getContext('2d');
  if (context && canvas.parentElement) {
    context.drawImage(canvas, 0, 0);
    canvas.parentElement.append(plate);
    previous = plate;
    waiting = cut.waitForCar;
    if (!waiting) expiry = window.setTimeout(clearStudioCut, 10000);
  }
  queueMicrotask(() => {
    cut.run();
    if (!cut.waitForCar) reveal(680);
  });
}
