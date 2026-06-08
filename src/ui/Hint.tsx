const KBD =
  'inline-block px-2.5 py-1 bg-white/[0.06] border border-[var(--color-line)] rounded-md text-[var(--color-fg)] text-[0.92em] tracking-[0.14em]';

/** Bottom-center hint strip showing primary controls. */
export function Hint() {
  return (
    <div
      id="hint"
      className="
        fixed left-1/2 -translate-x-1/2 bottom-[3vh] z-20
        flex items-center gap-[1.4rem] whitespace-nowrap pointer-events-none
        font-[var(--font-mono)] text-[0.7rem] tracking-[0.22em] uppercase
        text-[var(--color-muted)]
      "
    >
      <span className="inline-flex items-center gap-2">
        <kbd className={KBD}>drag</kbd> orbit
      </span>
      <span className="inline-flex items-center gap-2">
        <kbd className={KBD}>wheel</kbd> / <kbd className={KBD}>↑↓</kbd> navigate
      </span>
      <span className="inline-flex items-center gap-2">
        <kbd className={KBD}>click</kbd> rev
      </span>
    </div>
  );
}
