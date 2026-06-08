import { useEffect } from 'react';

/** Toggle `.visible` on each `.panel` as it scrolls in/out. CSS owns the
 *  fade/slide transitions. */
export function useReveal(threshold = 0.35): void {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('visible', entry.isIntersecting);
        }
      },
      { threshold },
    );
    for (const panel of Array.from(document.querySelectorAll('.panel'))) {
      observer.observe(panel);
    }
    return () => observer.disconnect();
  }, [threshold]);
}
