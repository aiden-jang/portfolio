import { useEffect } from 'react';

export function useShowroomTransition() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const intro = document.getElementById('sec-intro')!;
    const work = document.getElementById('sec-work')!;
    if (!intro || !work) return;
    const figure = document.querySelector<HTMLElement>('#project-everythingisfine > figure');
    let frame = 0;
    const paint = () => {
      frame = 0;
      const scene = document.querySelector<HTMLElement>('.portfolio-scene');
      const progress = Math.max(0, Math.min(1, scrollY / (intro.offsetHeight * 0.85)));
      const contact =
        document.getElementById('sec-contact')!.getBoundingClientRect().top < innerHeight;
      scene?.style.setProperty(
        '--stage-opacity',
        String(contact || media.matches ? 1 : 1 - progress * progress),
      );
      scene?.style.setProperty(
        '--stage-shift',
        `${contact || media.matches ? 0 : -20 * progress}px`,
      );
      const incoming = Math.max(
        0,
        Math.min(
          1,
          1 - (work.getBoundingClientRect().top - innerHeight * 0.08) / (innerHeight * 0.85),
        ),
      );
      if (figure) {
        figure.style.transform = media.matches
          ? ''
          : `translateY(${22 * (1 - incoming)}px) scale(${0.978 + 0.022 * incoming})`;
        figure.style.transformOrigin = '70% 50%';
      }
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
      document
        .querySelector<HTMLElement>('.portfolio-scene')
        ?.style.removeProperty('--stage-opacity');
    };
  }, []);
}
