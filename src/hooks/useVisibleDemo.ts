import { useEffect, useRef, type RefObject } from 'react';

export function useVisibleDemo(ref: RefObject<HTMLElement>, run: () => void, delay: number) {
  const finished = useRef(false);
  useEffect(() => {
    const area = ref.current;
    if (!area || finished.current) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => clearTimeout(timer);
    const stop = () => {
      finished.current = true;
      cancel();
      observer.disconnect();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        cancel();
        if (reduced.matches || entry.intersectionRatio < 0.42) return;
        timer = setTimeout(() => {
          if (document.hidden || reduced.matches || area.closest('[inert]')) return;
          if (document.querySelector('dialog[open], [aria-modal="true"]:not([aria-hidden="true"])'))
            return;
          stop();
          run();
        }, delay);
      },
      { threshold: 0.42 },
    );
    observer.observe(area);
    reduced.addEventListener('change', cancel);
    area.addEventListener('pointerdown', stop, { once: true });
    area.addEventListener('keydown', stop, { once: true });
    return () => {
      cancel();
      observer.disconnect();
      reduced.removeEventListener('change', cancel);
      area.removeEventListener('pointerdown', stop);
      area.removeEventListener('keydown', stop);
    };
  }, [delay, ref, run]);
}
