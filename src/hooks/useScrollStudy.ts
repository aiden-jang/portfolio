import { useEffect, type RefObject } from 'react';
import { clamp } from '../math';

export function easedProgress(value: number, from: number, to: number) {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}

export function useScrollStudy(
  ref: RefObject<HTMLElement>,
  enabled: boolean,
  draw: (el: HTMLElement, t: number, span: number) => void,
  settle?: (t: number) => number,
  follow?: readonly [start: number, end: number],
  reverseBuffer = 0,
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
    let aim = -1;
    let nextFrame = 0;
    let lastFrame = 0;
    let finish = 0;
    let settlingToward: number | undefined;
    let lastDirectionChange = -1;
    let reversing = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const paint = (t: number) => {
      displayed = t;
      if (stage) draw(stage, t, span);
    };
    const stopSettling = () => {
      clearTimeout(timer);
      cancelAnimationFrame(finish);
    };
    const approach = (now: number) => {
      nextFrame = 0;
      const period = lastFrame ? Math.min(32, now - lastFrame) : 16;
      lastFrame = now;
      const [start, end] = follow!;
      const position = Math.min(end, Math.max(start, displayed));
      const goal = Math.min(end, Math.max(start, aim));
      const gap = goal - position;
      if (Math.abs(gap) < 0.001) {
        paint(aim);
        lastFrame = 0;
        return;
      }
      const step = Math.min(Math.abs(gap) * (1 - Math.exp(-period / 48)), period * 0.00055);
      paint(position + Math.sign(gap) * step);
      nextFrame = requestAnimationFrame(approach);
    };
    const track = (target: number) => {
      aim = target;
      if (!nextFrame && displayed !== target) nextFrame = requestAnimationFrame(approach);
    };
    const settleAfterScroll = (target: number) => {
      if (target === displayed) return;
      timer = setTimeout(() => {
        settlingToward = target;
        if (follow) {
          track(target);
          return;
        }
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
      if (!stage.getClientRects().length) return;
      const style = getComputedStyle(pinned);
      sticky = style.position === 'sticky';
      inset = Number.parseFloat(style.top) || 0;
      span = Math.max(stage.offsetHeight - pinned.offsetHeight, 1);
      schedule();
    };
    const update = () => {
      frame = 0;
      if (!stage.getClientRects().length) return;
      const t =
        preference.matches || !sticky
          ? 1
          : clamp((inset - stage.getBoundingClientRect().top) / span, 0, 1);
      if (t === last) return;
      const backwards = t < last;
      if (backwards !== reversing) {
        lastDirectionChange = last;
        reversing = backwards;
      }
      last = t;
      stopSettling();
      const target = settle?.(t) ?? t;
      if (reverseBuffer && backwards && displayed > 0 && lastDirectionChange - t < reverseBuffer) {
        settleAfterScroll(settlingToward ?? displayed);
        return;
      }
      if (follow) {
        if (displayed === -1 || preference.matches || !sticky) {
          cancelAnimationFrame(nextFrame);
          nextFrame = 0;
          lastFrame = 0;
          paint(t);
        } else {
          track(t);
          settleAfterScroll(target);
        }
        return;
      }
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
      cancelAnimationFrame(nextFrame);
      stopSettling();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      preference.removeEventListener('change', measure);
      size.disconnect();
    };
  }, [ref, enabled, draw, settle, follow, reverseBuffer]);
}
