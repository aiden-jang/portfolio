import { useLocalTime } from '../hooks/useLocalTime';

/** Top-left brand block — fixed-position chrome over the canvas. */
export function Brand() {
  const time = useLocalTime();
  return (
    <header className="fixed top-[4vh] left-[5vw] z-20 pointer-events-none">
      <h1 className="mb-1.5 text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.04em] leading-[0.95] [text-shadow:0_0_40px_rgba(255,107,28,0.22)]">
        Aiden Jang
      </h1>
      <span className="font-[var(--font-mono)] text-[0.66rem] tracking-[0.32em] uppercase text-[var(--color-muted)] inline-flex items-center gap-2">
        <span>Software Engineer · New York</span>
        <span className="text-[var(--color-line)]">·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-[var(--color-neon)] animate-pulse" />
          <span className="tabular-nums">{time}</span>
        </span>
      </span>
    </header>
  );
}
