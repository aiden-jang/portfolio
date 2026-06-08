/** Top-left brand block — fixed-position chrome over the canvas. */
export function Brand() {
  return (
    <header className="fixed top-[4vh] left-[5vw] z-20 pointer-events-none">
      <span className="font-[var(--font-mono)] text-[0.72rem] tracking-[0.4em] uppercase text-[var(--color-muted)] inline-flex items-center gap-2 before:content-[''] before:inline-block before:w-7 before:h-px before:bg-[var(--color-neon)]">
        Portfolio
      </span>
      <h1 className="mt-2 mb-0 text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.02em] [text-shadow:0_0_32px_rgba(255,107,28,0.25)]">
        Aiden Jang
      </h1>
    </header>
  );
}
