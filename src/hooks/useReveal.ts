import { useEffect } from 'react';

export function useReveal(threshold = 0.35): void {
  useEffect(() => {
    const panels = Array.from(document.querySelectorAll('.panel'));
    if (!('IntersectionObserver' in window)) {
      panels.forEach((panel) => panel.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('visible', entry.isIntersecting);
        }
      },
      { threshold },
    );
    for (const panel of panels) {
      observer.observe(panel);
    }
    return () => observer.disconnect();
  }, [threshold]);
}
