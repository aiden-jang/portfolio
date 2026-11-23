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
  settle?: (t: number) => number,
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
    let displayed = -1;
    let finish = 0;
    let settlingToward: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const paint = (t: number) => {
      displayed = t;
      if (stage) draw(stage, t);
    };
    const stopSettling = () => {
      clearTimeout(timer);
      cancelAnimationFrame(finish);
    };
    const settleAfterScroll = (target: number) => {
      if (target === displayed) return;
      timer = setTimeout(() => {
        settlingToward = target;
        const start = performance.now();
        const from = displayed;
        const ease = (now: number) => {
          const blend = easedProgress(now - start, 0, 250);
          paint(from + (target - from) * blend);
          if (blend < 1) finish = requestAnimationFrame(ease);
        };
        finish = requestAnimationFrame(ease);
      }, 130);
    };
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
      stopSettling();
      const target = settle?.(t) ?? t;
      if (target !== settlingToward) settlingToward = undefined;
      // A nudge toward the same reading can catch the animation, but cannot rewind it.
      const next =
        settlingToward === undefined
          ? t
          : clamp(displayed, Math.min(t, target), Math.max(t, target));
      paint(next);
      settleAfterScroll(target);
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
      stopSettling();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      preference.removeEventListener('change', measure);
      size.disconnect();
    };
  }, [ref, enabled, draw, settle]);
}
