import { useCallback, useEffect, useRef, type RefObject } from 'react';

export function useTimedScene(
  subject: RefObject<HTMLElement | null>,
  draw: (progress: number) => void,
  {
    enabled = true,
    duration,
    hold = 0,
    startThreshold = 0.64,
    restartAfterExit = false,
  }: {
    enabled?: boolean;
    duration: number;
    hold?: number;
    startThreshold?: number;
    restartAfterExit?: boolean;
  },
) {
  const clock = useRef({ elapsed: 0, remainingHold: hold, started: false });

  const seek = useRef<(progress: number, linger: number) => void>();
  const fastForward = useCallback((progress: number, linger: number) => {
    seek.current?.(progress, linger);
  }, []);

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
    let cueUntil = 0;
    let cueTimer = 0;
    seek.current = (progress, linger) => {
      if (preference.matches || timeline.elapsed >= duration * progress) return;
      stop();
      timeline.elapsed = duration * progress;
      timeline.started = true;
      cueUntil = performance.now() + linger;
      draw(progress);
      schedule();
    };

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
      clearTimeout(cueTimer);
      cueTimer = 0;
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
      const reading = Boolean(node?.parentElement?.querySelector(':focus-visible'));
      const running =
        visible &&
        timeline.started &&
        !document.hidden &&
        !preference.matches &&
        !(hold > 0 && reading);
      if (!running) {
        stop();
      } else if (performance.now() < cueUntil) {
        if (!cueTimer)
          cueTimer = window.setTimeout(() => {
            cueTimer = 0;
            schedule();
          }, cueUntil - performance.now());
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
      (entries) => {
        const entry = entries[entries.length - 1];
        visible = entry.isIntersecting && entry.intersectionRatio > 0;
        if (!visible && restartAfterExit && timeline.elapsed >= duration) {
          timeline.elapsed = 0;
          timeline.started = false;
          cueUntil = 0;
          draw(0);
        }
        if (
          visible &&
          !preference.matches &&
          entries.some(
            (sample) => sample.isIntersecting && sample.intersectionRatio >= startThreshold,
          )
        )
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
    function wake() {
      queueMicrotask(schedule);
    }
    observer.observe(node);
    preference.addEventListener('change', preferenceChanged);
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', wake);
    return () => {
      seek.current = undefined;
      observer.disconnect();
      stop();
      preference.removeEventListener('change', preferenceChanged);
      document.removeEventListener('visibilitychange', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', wake);
    };
  }, [subject, draw, enabled, duration, hold, startThreshold, restartAfterExit]);
  return fastForward;
}
