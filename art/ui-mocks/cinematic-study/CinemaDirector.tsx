import { useEffect } from 'react';
import { KEYFRAMES } from '../../../src/config';
import { useAppStore } from '../../../src/store';

const clamp = (n: number) => Math.min(1, Math.max(0, n));
export function CinemaDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0,
      playback = 0;
    const paint = () => {
      frame = 0;
      KEYFRAMES[1].distance = innerWidth < 768 ? 12 : 8.6;
      const h = innerHeight;
      const exit = clamp((scrollY / h - 0.12) / 0.58);
      const contact = document.getElementById('sec-contact')!.getBoundingClientRect().top < h;
      const work = document.getElementById('sec-work')!.getBoundingClientRect().top;
      const arrival = clamp((h * 0.95 - work) / (h * 0.9));
      root.style.setProperty(
        '--cinema-car-opacity',
        String(contact || reduced.matches ? 1 : 1 - exit * exit),
      );
      root.style.setProperty(
        '--cinema-title-shift',
        `${reduced.matches ? 0 : 90 * (1 - arrival)}px`,
      );
      root.style.setProperty(
        '--cinema-figure-scale',
        String(reduced.matches ? 1 : 0.88 + 0.12 * arrival),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
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
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('wheel', interrupt, { passive: true });
    addEventListener('touchstart', interrupt, { passive: true });
    addEventListener('keydown', interrupt);
    addEventListener('message', receive);
    reduced.addEventListener('change', schedule);
    paint();
    return () => {
      cancelAnimationFrame(frame);
      interrupt();
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      removeEventListener('wheel', interrupt);
      removeEventListener('touchstart', interrupt);
      removeEventListener('keydown', interrupt);
      removeEventListener('message', receive);
      reduced.removeEventListener('change', schedule);
    };
  }, []);
  return null;
}
