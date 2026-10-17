import { prefersReducedMotion } from './reducedMotion';

let scrollRaf = 0;
// Module-level so manual scroll input can abort a tween started from anywhere.
let restoreSnap: (() => void) | null = null;

export function cancelSmoothScroll(): void {
  if (scrollRaf) {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = 0;
  }
  if (restoreSnap) {
    restoreSnap();
    restoreSnap = null;
  }
}

// Snap has to stay off for the whole jump and past the end of it. A phone with snap on re-snaps
// mid-tween and reverts the jump, leaving the dot on one section and the copy on another. Coarse
// pointers also need the native scroll, because a rAF tween stalls on a real phone.
export function smoothScrollTo(targetY: number): void {
  const startY = window.scrollY;
  const dist = targetY - startY;
  if (Math.abs(dist) < 2) return;

  cancelSmoothScroll();
  const html = document.documentElement;
  html.style.scrollSnapType = 'none';
  restoreSnap = () => {
    html.style.scrollSnapType = '';
  };

  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    return;
  }

  const coarsePointer = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (coarsePointer) {
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    return;
  }

  const duration = 480;
  const start = performance.now();
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, Math.round(startY + dist * ease(t)));
    if (t < 1) {
      scrollRaf = requestAnimationFrame(step);
    } else {
      scrollRaf = 0;
    }
  };
  scrollRaf = requestAnimationFrame(step);
}
