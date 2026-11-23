import { useEffect, useRef, type RefObject } from 'react';

export function useTimedScene(
  subject: RefObject<HTMLElement | null>,
  draw: (progress: number) => void,
  {
    enabled = true,
    duration,
    replay = 0,
  }: { enabled?: boolean; duration: number; replay?: number },
) {
  const clock = useRef({ replay, elapsed: 0, started: false });

  useEffect(() => {
    const node = subject.current;
    if (!node || !enabled) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (clock.current.replay !== replay) clock.current = { replay, elapsed: 0, started: false };
    const timeline = clock.current;
    let frame = 0;
    let previous: number | undefined;
    let visible = false;

    function render(now: number) {
      frame = 0;
      timeline.elapsed = Math.min(
        duration,
        timeline.elapsed + (previous === undefined ? 0 : now - previous),
      );
      previous = now;
      draw(timeline.elapsed / duration);
      schedule();
    }

    function schedule() {
      const running =
        visible &&
        timeline.started &&
        !document.hidden &&
        !preference.matches &&
        timeline.elapsed < duration;
      if (running && !frame) frame = requestAnimationFrame(render);
      if (!running) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = undefined;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio > 0;
        if (!preference.matches && entry.intersectionRatio >= 0.64) timeline.started = true;
        schedule();
      },
      { threshold: [0, 0.64] },
    );

    const preferenceChanged = () => {
      if (!preference.matches && timeline.elapsed < duration) {
        observer.unobserve(node);
        observer.observe(node);
      }
      schedule();
    };
    if (!preference.matches) draw(timeline.elapsed / duration);
    observer.observe(node);
    preference.addEventListener('change', preferenceChanged);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', preferenceChanged);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [subject, draw, enabled, duration, replay]);
}
