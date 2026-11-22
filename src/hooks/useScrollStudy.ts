import { useEffect, type RefObject } from 'react';
import { clamp } from '../math';

export function easedProgress(value: number, from: number, to: number) {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}

export function useScrollStudy(
  ref: RefObject<HTMLElement>,
  enabled: boolean,
  draw: (el: HTMLElement, t: number) => void,
) {
  useEffect(() => {
    const stage = ref.current;
    const pinned = stage?.querySelector<HTMLElement>('[data-study-pin]');
    if (!stage || !pinned || !enabled) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = -1;
    let inset = 0;
    let span = 1;
    let sticky = false;
    const measure = () => {
      const style = getComputedStyle(pinned);
      sticky = style.position === 'sticky';
      inset = Number.parseFloat(style.top) || 0;
      span = Math.max(stage.offsetHeight - pinned.offsetHeight, 1);
      schedule();
    };
    const update = () => {
      frame = 0;
      const t =
        preference.matches || !sticky
          ? 1
          : clamp((inset - stage.getBoundingClientRect().top) / span, 0, 1);
      if (t === last) return;
      last = t;
      draw(stage, t);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const size = new ResizeObserver(measure);
    size.observe(stage);
    size.observe(pinned);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    preference.addEventListener('change', measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      preference.removeEventListener('change', measure);
      size.disconnect();
    };
  }, [ref, enabled, draw]);
}
