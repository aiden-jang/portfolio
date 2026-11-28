import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { clamp } from '../../math';

type DinnerMoment = 'vote' | 'picked' | 'bill' | 'split' | 'entry' | 'favorite';
type DinnerAction = 'pick' | 'split' | 'favorite';
type Guide = {
  action: 'pick' | 'split';
  fromY: number;
  lastY: number;
  start: number;
  keyboard: boolean;
};

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
  const [paid, setPaid] = useState(false);
  const apply = useRef<(action: DinnerAction, keyboard: boolean) => void>(() => {});

  useLayoutEffect(() => {
    const section = track.current;
    const pin = stage.current;
    if (!section || !pin) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const bill = section.querySelector<HTMLElement>('#project-owewell');
    const journal = section.querySelector<HTMLElement>('#project-worth');
    if (!bill || !journal) return;
    const entranceMarker = section.querySelector<HTMLElement>('.supper-entrance');
    let frame = 0;
    let active = true;
    let inset = parseFloat(getComputedStyle(pin).top) || 0;
    let guide: Guide | null = null;
    let focusTarget: string | null = null;
    let hasSplit = false;
    let favorite = false;
    let lastMoment: DinnerMoment | undefined;
    let previousLens = -1;
    let previousFile = -1;

    const paint = (now: number) => {
      frame = 0;
      if (focusTarget) {
        const next = pin.querySelector<HTMLButtonElement>(focusTarget);
        if (document.activeElement !== pin.querySelector('.meal-name')) {
          focusTarget = null;
        } else if (next && !next.disabled && !next.closest('[aria-hidden="true"]')) {
          next.focus({ preventScroll: true });
          focusTarget = null;
        }
      }
      const bounds = section.getBoundingClientRect();
      const entrance = entranceMarker?.offsetHeight ?? 0;
      const run = Math.max(1, bounds.height - pin.clientHeight - entrance);
      const startY = scrollY + bounds.top - inset + entrance;
      let p = clamp((scrollY - startY) / run, 0, 1);
      const offscreen = bounds.top > innerHeight + 32 || bounds.bottom < -32;
      if (offscreen) {
        guide = null;
        focusTarget = null;
        if (lastMoment !== undefined) return;
        // The browser can mount the scene before landing on its fragment.
        const hash = location.hash;
        const linked =
          hash === '#project-worth' || hash === '#project-owewell'
            ? section.querySelector<HTMLElement>(hash)
            : null;
        p = linked ? (linked.offsetTop - entrance) / run : 0;
      }
      const reduced = motion.matches;
      if (guide && (document.hidden || Math.abs(scrollY - guide.lastY) > 2)) guide = null;
      const guidedPick = guide?.action === 'pick';
      if (guide) {
        const { action, fromY, start, keyboard } = guide;
        const splitting = action === 'split';
        const hold = splitting ? 750 : 0;
        const duration = splitting ? 680 : 780;
        const elapsed = now - start;
        const t = reduced ? Number(elapsed >= hold) : ramp(elapsed, hold, hold + duration);
        const targetY = startY - entrance + (splitting ? journal : bill).offsetTop;
        const nextY = Math.round(fromY + (targetY - fromY) * t);
        if (nextY !== scrollY) window.scrollTo({ top: nextY, behavior: 'instant' });
        guide.lastY = scrollY;
        p = clamp((scrollY - startY) / run, 0, 1);
        if (t === 1) {
          guide = null;
          if (keyboard) focusTarget = splitting ? '.meal-favorite' : '.meal-split';
        }
      }

      const onBill = p >= 0.35;
      const onEntry = p >= 0.85;
      const picked = guidedPick || p >= 0.19;
      let current: DinnerMoment = picked ? 'picked' : 'vote';
      if (onBill) current = hasSplit || p >= 0.55 ? 'split' : 'bill';
      if (onEntry) current = favorite ? 'favorite' : 'entry';
      if (current !== lastMoment) {
        lastMoment = current;
        setMoment(current);
      }
      const lens = reduced ? Number(picked) : ramp(p, 0.055, 0.25);
      const file = reduced ? Number(onEntry) : ramp(p, 0.695, 0.878);
      if (lens !== previousLens || file !== previousFile) {
        previousLens = lens;
        previousFile = file;
        pin.toggleAttribute('data-photo-header', lens > 0.94 && file < 0.29);
        pin.style.setProperty('--photo-card', String(1 - lens));
        pin.style.setProperty('--photo-table', String(lens * (1 - file)));
        pin.style.setProperty('--photo-entry', String(file));
      }
      if (guide || focusTarget) queue();
    };

    function queue() {
      if (active && !frame) frame = requestAnimationFrame(paint);
    }

    const cancel = () => {
      focusTarget = null;
      if (!guide) return;
      guide = null;
      queue();
    };
    const resize = () => {
      inset = parseFloat(getComputedStyle(pin).top) || 0;
      queue();
    };
    const size = new ResizeObserver(resize);
    size.observe(pin);
    size.observe(section);
    size.observe(document.body);
    apply.current = (action, keyboard) => {
      if (action === 'favorite') favorite = !favorite;
      else {
        hasSplit = action === 'split';
        setPaid(hasSplit);
        guide = { action, keyboard, fromY: scrollY, lastY: scrollY, start: performance.now() };
      }
      queue();
    };
    const interrupt = ['wheel', 'pointerdown', 'touchstart', 'keydown', 'hashchange', 'pagehide'];
    interrupt.forEach((type) =>
      window.addEventListener(type, cancel, { passive: true, capture: true }),
    );
    document.addEventListener('visibilitychange', cancel);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pageshow', queue);
    motion.addEventListener('change', queue);
    void document.fonts.ready.then(queue);
    paint(performance.now());
    return () => {
      active = false;
      apply.current = () => {};
      cancelAnimationFrame(frame);
      size.disconnect();
      interrupt.forEach((type) => window.removeEventListener(type, cancel, true));
      document.removeEventListener('visibilitychange', cancel);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pageshow', queue);
      motion.removeEventListener('change', queue);
    };
  }, [track, stage]);

  return {
    moment,
    paid,
    act: (action: DinnerAction, keyboard = false) => apply.current(action, keyboard),
  };
}
