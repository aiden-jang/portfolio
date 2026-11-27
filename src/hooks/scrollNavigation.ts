import { prefersReducedMotion } from './reducedMotion';

let scrollRaf = 0;
let nativeTarget: number | undefined;
// Module-level so manual scroll input can abort a tween started from anywhere.
let restoreSnap: (() => void) | null = null;

function finishNativeScroll() {
  if (nativeTarget === undefined || Math.abs(window.scrollY - nativeTarget) > 1) return;
  nativeTarget = undefined;
  document.removeEventListener('scrollend', finishNativeScroll);
}

export function cancelSmoothScroll(): void {
  if (nativeTarget !== undefined) {
    const currentY = window.scrollY;
    if (Math.abs(currentY - nativeTarget) > 1)
      window.scrollTo({ top: currentY, behavior: 'instant' });
    nativeTarget = undefined;
    document.removeEventListener('scrollend', finishNativeScroll);
  }
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
  cancelSmoothScroll();
  const startY = window.scrollY;
  const dist = targetY - startY;
  if (Math.abs(dist) < 2) return;

  const html = document.documentElement;
  html.style.scrollSnapType = 'none';
  restoreSnap = () => {
    html.style.scrollSnapType = '';
  };

  if (prefersReducedMotion()) {
    window.scrollTo({ top: targetY, behavior: 'instant' });
    return;
  }

  const coarsePointer = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (coarsePointer) {
    const maxY = Math.max(0, (document.scrollingElement?.scrollHeight ?? 0) - innerHeight);
    nativeTarget = Math.max(0, Math.min(maxY, targetY));
    document.addEventListener('scrollend', finishNativeScroll);
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

export function sectionLanding(section: HTMLElement) {
  if (section.id === 'sec-more-work') {
    const heading = section.querySelector(
      '.bloom-garden-inner:not([hidden]) #bloom-garden-title, .bloom-draft:not([hidden]) #bloom-draft-title',
    );
    const header = document.querySelector('.portfolio-header');
    if (heading) {
      return (
        heading.getBoundingClientRect().top +
        scrollY -
        (header?.getBoundingClientRect().height ?? 0) -
        14
      );
    }
  }
  return section.getBoundingClientRect().top + scrollY;
}
