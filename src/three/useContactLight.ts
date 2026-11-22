import { useRef } from 'react';
import { prefersReducedMotion } from '../hooks/reducedMotion';

const SECONDS = 1.48;

export function useContactLight() {
  const cue = useRef({ email: null as HTMLElement | null, elapsed: 0 });
  return (closing: boolean, delta: number) => {
    const current = cue.current;
    if (!closing) {
      current.elapsed = 0;
      return -1;
    }
    if (current.elapsed >= SECONDS) return 1;
    if (prefersReducedMotion()) {
      current.elapsed = SECONDS;
      return 1;
    }
    current.email ??= document.querySelector<HTMLElement>('.contact-email-link');
    if (
      current.elapsed > 0 ||
      (current.email?.getBoundingClientRect().top ?? Infinity) < innerHeight * 0.82
    )
      current.elapsed = Math.min(SECONDS, current.elapsed + Math.min(delta, 0.15));
    const t = current.elapsed / SECONDS;
    return t * t * (3 - 2 * t);
  };
}
