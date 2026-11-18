import { useEffect } from 'react';
import { useAppStore } from '../../../src/store';
import { cancelSmoothScroll } from '../../../src/hooks/scrollNavigation';
import { observeOpeningOrbit, replayOpeningOrbit } from '../../../src/three/useOpeningOrbit';

const clamp = (n: number) => Math.min(1, Math.max(0, n));
export function CinemaDirector() {
  useEffect(() => {
    const stopObserving = observeOpeningOrbit((phase) => {
      if (window.parent !== window)
        window.parent.postMessage({ openingOrbit: phase }, location.origin);
    });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let playback = 0;
    const interrupt = () => cancelAnimationFrame(playback);
    const target = (moment: string) =>
      moment === 'hero'
        ? 0
        : moment === 'handoff'
          ? innerHeight * 0.45
          : document
              .getElementById(moment === 'globe' ? 'project-everythingisfine' : 'project-iodine')!
              .getBoundingClientRect().top +
            scrollY -
            110;
    const receive = (event: MessageEvent) => {
      if (event.source !== parent || event.origin !== location.origin) return;
      if (event.data?.replayOpeningOrbit === true) {
        interrupt();
        cancelSmoothScroll();
        window.scrollTo({ top: 0, behavior: 'instant' });
        replayOpeningOrbit();
        return;
      }
      if (['hero', 'handoff', 'globe', 'iodine'].includes(event.data?.cinemaMoment)) {
        interrupt();
        window.scrollTo({ top: target(event.data.cinemaMoment), behavior: 'instant' });
      }
      if (event.data?.cinemaPlay === true) {
        interrupt();
        window.scrollTo({ top: 0, behavior: 'instant' });
        useAppStore.getState().resetCamera();
        const destination = target('globe');
        if (reduced.matches) {
          window.scrollTo({ top: destination, behavior: 'instant' });
          return;
        }
        const start = performance.now();
        const tick = (time: number) => {
          const t = clamp((time - start - 1800) / 5600);
          window.scrollTo({ top: destination * t * t * (3 - 2 * t), behavior: 'instant' });
          if (t < 1) playback = requestAnimationFrame(tick);
        };
        playback = requestAnimationFrame(tick);
      }
    };
    addEventListener('wheel', interrupt, { passive: true });
    addEventListener('touchstart', interrupt, { passive: true });
    addEventListener('keydown', interrupt);
    addEventListener('message', receive);
    return () => {
      interrupt();
      stopObserving();
      removeEventListener('wheel', interrupt);
      removeEventListener('touchstart', interrupt);
      removeEventListener('keydown', interrupt);
      removeEventListener('message', receive);
    };
  }, []);
  return null;
}
