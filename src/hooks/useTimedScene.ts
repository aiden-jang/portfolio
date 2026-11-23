import { useEffect, useRef, type RefObject } from 'react';

export function useTimedScene(
  subject: RefObject<HTMLElement | null>,
  draw: (progress: number) => void,
  {
    enabled = true,
    duration,
    hold = 0,
    startThreshold = 0.64,
  }: { enabled?: boolean; duration: number; hold?: number; startThreshold?: number },
) {
  const clock = useRef({ elapsed: 0, remainingHold: hold, started: false });

  useEffect(() => {
    const node = subject.current;
    if (!node || !enabled) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const timeline = clock.current;
    let frame = 0;
    let timer = 0;
    let holdStarted = 0;
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

    function stop() {
      cancelAnimationFrame(frame);
      if (timer) {
        clearTimeout(timer);
        timeline.remainingHold = Math.max(
          0,
          timeline.remainingHold - (performance.now() - holdStarted),
        );
      }
      timer = 0;
      frame = 0;
      previous = undefined;
    }

    function schedule() {
      const running = visible && timeline.started && !document.hidden && !preference.matches;
      if (!running) {
        stop();
      } else if (timeline.elapsed < duration && !frame) {
        frame = requestAnimationFrame(render);
      } else if (timeline.elapsed >= duration && hold > 0 && !timer) {
        previous = undefined;
        holdStarted = performance.now();
        timer = window.setTimeout(() => {
          timer = 0;
          if (!visible || document.hidden || preference.matches) return;
          timeline.elapsed = 0;
          timeline.remainingHold = hold;
          draw(0);
          schedule();
        }, timeline.remainingHold);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio > 0;
        if (visible && !preference.matches && entry.intersectionRatio >= startThreshold)
          timeline.started = true;
        schedule();
      },
      { threshold: [0, startThreshold] },
    );

    const preferenceChanged = () => {
      if (hold > 0) draw(preference.matches ? 1 : timeline.elapsed / duration);
      if (!preference.matches && (timeline.elapsed < duration || hold > 0)) {
        observer.unobserve(node);
        observer.observe(node);
      }
      schedule();
    };
    if (!preference.matches) draw(timeline.elapsed / duration);
    else if (hold > 0) draw(1);
    observer.observe(node);
    preference.addEventListener('change', preferenceChanged);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      observer.disconnect();
      stop();
      preference.removeEventListener('change', preferenceChanged);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [subject, draw, enabled, duration, hold, startThreshold]);
}
