const MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

/** Re-reads on every call, so it belongs in useFrame and event handlers rather than in render. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}
