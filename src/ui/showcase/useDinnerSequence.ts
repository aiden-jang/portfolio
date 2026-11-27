import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { clamp } from '../../math';

type DinnerMoment = 'vote' | 'picked' | 'bill' | 'split' | 'entry' | 'favorite';
type DinnerAction = 'pick' | 'split' | 'favorite';

function linkedMoment(): DinnerMoment {
  if (location.hash === '#project-owewell') return 'bill';
  if (location.hash === '#project-worth') return 'entry';
  return 'vote';
}

function ramp(value: number, from: number, to: number) {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}

export function useDinnerSequence(track: RefObject<HTMLElement>, stage: RefObject<HTMLDivElement>) {
  const [moment, setMoment] = useState<DinnerMoment>(linkedMoment);
  const input = useRef({ pickedAt: null as number | null, split: false, favorite: false });
  const schedule = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const section = track.current;
    const pin = stage.current;
    if (!section || !pin) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let active = true;
    let inset = parseFloat(getComputedStyle(pin).top) || 0;
    let lastMoment: DinnerMoment | undefined;
    let previousLens = -1;
    let previousFile = -1;
    let previousUnroll = -1;

    const paint = (now: number) => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const run = Math.max(1, bounds.height - pin.clientHeight);
      let p = clamp((inset - bounds.top) / run, 0, 1);
      if (bounds.top > innerHeight + 32 || bounds.bottom < -32) {
        if (lastMoment !== undefined) return;
        // A cold fragment navigation can mount before the browser has reached its target.
        const hash = location.hash;
        const linked =
          hash === '#project-worth' || hash === '#project-owewell'
            ? section.querySelector<HTMLElement>(hash)
            : null;
        p = linked ? linked.offsetTop / run : 0;
      }
      const { pickedAt, split, favorite } = input.current;
      const reduced = motion.matches;
      const picked = pickedAt !== null || p >= 0.204;
      const onBill = p >= 0.37;
      const onEntry = p >= 0.781;
      let current: DinnerMoment = picked ? 'picked' : 'vote';
      if (onBill) current = split || p >= 0.643 ? 'split' : 'bill';
      if (onEntry) current = favorite || p >= 0.953 ? 'favorite' : 'entry';
      if (current !== lastMoment) {
        lastMoment = current;
        setMoment(current);
      }

      const manualZoom = pickedAt !== null ? ramp(now - pickedAt, 0, 630) : 0;
      const lens = reduced ? Number(picked) : Math.max(ramp(p, 0.1, 0.235), manualZoom);
      const file = reduced ? Number(onEntry) : ramp(p, 0.71, 0.837);
      const unroll = reduced ? Number(onBill) : ramp(p, 0.335, 0.47);
      if (lens !== previousLens || file !== previousFile || unroll !== previousUnroll) {
        previousLens = lens;
        previousFile = file;
        previousUnroll = unroll;
        pin.style.setProperty('--photo-card', String(1 - lens));
        pin.style.setProperty('--photo-table', String(lens * (1 - file)));
        pin.style.setProperty('--photo-entry', String(file));
        pin.style.setProperty('--bill-lines', String(unroll * (1 - file)) + 'fr');
        pin.style.setProperty('--entry-lines', String(file) + 'fr');
      }
      if (!reduced && pickedAt !== null && lens < 1) queue();
    };

    function queue() {
      if (active && !frame) frame = requestAnimationFrame(paint);
    }

    const resize = () => {
      inset = parseFloat(getComputedStyle(pin).top) || 0;
      queue();
    };
    const size = new ResizeObserver(resize);
    size.observe(pin);
    size.observe(section);
    size.observe(document.body);
    schedule.current = queue;
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pageshow', queue);
    window.addEventListener('hashchange', queue);
    motion.addEventListener('change', queue);
    void document.fonts.ready.then(queue);
    paint(performance.now());
    return () => {
      active = false;
      schedule.current = () => {};
      cancelAnimationFrame(frame);
      size.disconnect();
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pageshow', queue);
      window.removeEventListener('hashchange', queue);
      motion.removeEventListener('change', queue);
    };
  }, [track, stage]);

  function act(action: DinnerAction) {
    if (action === 'pick') input.current.pickedAt ??= performance.now();
    else input.current[action] = true;
    schedule.current();
  }
  return { moment, act };
}
