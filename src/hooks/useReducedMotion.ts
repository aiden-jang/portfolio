import { useEffect, useState } from 'react';

const MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

/** Re-reads on every call, so it belongs in useFrame and event handlers rather than in render. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}

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
    // Older Safari only has the legacy MediaQueryList listener pair.
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);
  return reduced;
}
