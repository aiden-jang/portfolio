import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from './useReducedMotion';

/** Magnetic pull effect: translate an element toward the cursor while it's
 *  hovered, snap back on leave. `strength` is the fraction of the cursor's
 *  distance-from-center to apply (0.3 = subtle pull, 0.6 = strong). */
export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  strength = 0.3,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Bail on touch / coarse-pointer devices — no meaningful hover there.
    if (window.matchMedia('(hover: none)').matches) return;
    // Bail when the user has asked for reduced motion.
    if (prefersReducedMotion()) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onLeave = () => {
      el.style.transform = 'translate(0, 0)';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.style.transform = '';
    };
  }, [ref, strength]);
}
