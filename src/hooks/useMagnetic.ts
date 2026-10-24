import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from './reducedMotion';

/** `strength` is the fraction of the cursor's distance from centre to follow: 0.3 is subtle. */
export function useMagnetic<T extends HTMLElement>(ref: RefObject<T | null>, strength = 0.3): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia || window.matchMedia('(hover: none)').matches) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onMove = (e: MouseEvent) => {
      if (prefersReducedMotion()) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };

    const onPreference = () => {
      if (motion.matches) onLeave();
    };
    motion.addEventListener('change', onPreference);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      motion.removeEventListener('change', onPreference);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.style.transform = '';
    };
  }, [ref, strength]);
}
