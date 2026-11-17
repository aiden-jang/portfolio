import { useEffect } from 'react';

export function useShowroomTransition() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const intro = document.getElementById('sec-intro');
    const work = document.getElementById('sec-work');
    if (!intro || !work) return;
    const root = document.documentElement;
    let frame = 0;
    const paint = () => {
      frame = 0;
      const h = innerHeight;
      const exit = Math.max(0, Math.min(1, (scrollY / h - 0.12) / 0.58));
      const contact = document.getElementById('sec-contact')!.getBoundingClientRect().top < h;
      const arrival = Math.max(
        0,
        Math.min(1, (h * 0.95 - work.getBoundingClientRect().top) / (h * 0.9)),
      );
      root.style.setProperty(
        '--stage-opacity',
        String(contact || media.matches ? 1 : 1 - exit * exit),
      );
      root.style.setProperty('--work-title-shift', `${media.matches ? 0 : 90 * (1 - arrival)}px`);
      root.style.setProperty(
        '--work-figure-scale',
        String(media.matches ? 1 : 0.88 + 0.12 * arrival),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    paint();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
      for (const name of ['--stage-opacity', '--work-title-shift', '--work-figure-scale'])
        root.style.removeProperty(name);
    };
  }, []);
}
