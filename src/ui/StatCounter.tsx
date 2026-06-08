import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 1300;

type Props = {
  /** Target value to count up to. */
  to: number;
  /** Format the number for display (e.g. compact "240M+"). */
  format?: (n: number) => string;
  /** Optional suffix appended after the formatted number. */
  suffix?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Counts up from 0 to `to` the first time the element enters the viewport.
 *  Uses rAF + an ease-out curve so the number decelerates as it lands. */
export function StatCounter({ to, format, suffix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / DURATION_MS);
              setValue(Math.round(to * easeOutCubic(t)));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {format ? format(value) : value.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Compact number formatter: 1500 -> "1.5K", 240000000 -> "240M". */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return n.toString();
}
