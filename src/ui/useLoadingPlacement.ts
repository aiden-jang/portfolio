import { useLayoutEffect, type RefObject } from 'react';

export function useLoadingPlacement(
  bar: RefObject<HTMLDivElement | null>,
  active: boolean,
  section: number,
) {
  useLayoutEffect(() => {
    const element = bar.current;
    if (!active || !element) return;
    const docks = [...document.querySelectorAll<HTMLElement>('#desktop-dock, #mobile-bar')];
    const header = document.querySelector('.portfolio-header');
    const gap = 14;

    const place = () => {
      const top =
        docks
          .find((dock) => dock.offsetHeight > 0 && getComputedStyle(dock).visibility === 'visible')
          ?.getBoundingClientRect().top ?? 0;
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
      const aboveDock = top > headerBottom + 70;
      element.style.setProperty(
        '--loading-anchor',
        Math.round(aboveDock ? top - gap : headerBottom + gap) + 'px',
      );
      element.style.setProperty('--loading-offset', aboveDock ? '-100%' : '0px');
    };

    const observer = new ResizeObserver(place);
    for (const dock of docks) observer.observe(dock);
    if (header) observer.observe(header);
    window.addEventListener('resize', place);
    place();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [active, bar, section]);
}
