import { useLayoutEffect, useRef } from 'react';
import { createRequestPrint } from './requestPrint';

export function RequestPulse({ onPaint }: { onPaint: (position: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current!;
    const print = createRequestPrint(canvas);
    if (!print) return;
    const owner = canvas.closest('figure')!;
    owner.dataset.printReady = 'true';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = Number(owner.dataset.pulse || 0),
      current = reduced ? target : 0,
      frame = 0,
      last = 0;
    let catchingUp = target - current > 0.6;
    let visible = false;
    const draw = () => print.paint(current);
    const resize = () => {
      print.resize();
      draw();
    };
    const tick = (now: number) => {
      frame = 0;
      if (catchingUp && (!visible || document.hidden)) return;
      const dt = Math.min(64, Math.max(1, now - last));
      last = now;
      const step = (target - current) * (1 - Math.exp(-dt / 44));
      current += catchingUp ? Math.min(step, dt / 740) : step;
      if (Math.abs(target - current) < 0.0015) current = target;
      draw();
      onPaint(current);
      if (current === target) catchingUp = false;
      else frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (frame || target === current || (catchingUp && (!visible || document.hidden))) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const update = (event: Event) => {
      const { value, instant, catchUp } = (
        event as CustomEvent<{
          value: number;
          instant?: boolean;
          catchUp?: boolean;
        }>
      ).detail;
      const jumpsForward = value - current > 0.6;
      catchingUp =
        value !== current &&
        !instant &&
        (!!catchUp || jumpsForward || (catchingUp && value >= target));
      target = value;
      if (instant || (!catchingUp && current - target > 0.6)) {
        cancelAnimationFrame(frame);
        frame = 0;
        current = target;
        draw();
        onPaint(current);
      } else wake();
    };
    owner.addEventListener('pulse-position', update);
    document.addEventListener('visibilitychange', wake);
    const visibility = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        wake();
      },
      { threshold: 0.6 },
    );
    visibility.observe(canvas);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    onPaint(current);
    return () => {
      delete owner.dataset.printReady;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      owner.removeEventListener('pulse-position', update);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [onPaint]);
  return <canvas ref={ref} className="request-pulse" aria-hidden="true" />;
}
