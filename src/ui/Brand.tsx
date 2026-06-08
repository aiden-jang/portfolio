/** Top-left brand block — fixed-position chrome over the canvas. */
export function Brand() {
  return (
    <header className="fixed top-[4vh] left-[5vw] z-20 pointer-events-none">
      <span className="font-[var(--font-mono)] text-[0.66rem] tracking-[0.4em] uppercase text-[var(--color-muted)] inline-flex items-center gap-2 before:content-[''] before:inline-block before:w-7 before:h-px before:bg-[var(--color-neon)]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-neon)] animate-pulse" />
        Available for work
      </span>
      <h1 className="mt-2 mb-0 text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.04em] leading-[0.95] [text-shadow:0_0_40px_rgba(255,107,28,0.22)]">
        Aiden Jang
      </h1>
    </header>
  );
}
