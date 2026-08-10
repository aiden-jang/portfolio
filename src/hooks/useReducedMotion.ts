import { useEffect, useState } from 'react';

const MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

/** Synchronous read. Use inside useFrame callbacks, event handlers, or any
 *  non-React context. Re-evaluates on every call so OS toggles are picked up. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}

/** Reactive hook — re-renders the component when the user changes their OS
 *  motion setting. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => prefersReducedMotion());
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(MEDIA_QUERY);
    const onChange = () => setReduced(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    // Older Safari exposes the legacy MediaQueryList listener pair.
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);
  return reduced;
}
