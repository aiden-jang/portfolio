const KBD =
  'inline-block px-2.5 py-1 bg-white/[0.06] border border-[var(--color-line)] rounded-md text-[var(--color-fg)] text-[0.92em] tracking-[0.14em]';

/** Bottom-center hint strip showing primary controls. */
export function Hint() {
  return (
    <div
      id="hint"
      className="
        fixed left-1/2 -translate-x-1/2 bottom-[3vh] z-20
        flex items-center justify-center gap-3 md:gap-[1.4rem]
        whitespace-nowrap pointer-events-none
        font-[var(--font-mono)] text-[0.58rem] md:text-[0.7rem]
        tracking-[0.18em] md:tracking-[0.22em] uppercase
        text-[var(--color-muted)]
      "
    >
      {/* Mobile-only minimal hint */}
      <span className="md:hidden">Swipe to navigate</span>

      {/* Desktop hints */}
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>drag</kbd> orbit
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>scroll</kbd> / <kbd className={KBD}>↑↓</kbd> sections
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>swipe</kbd> / <kbd className={KBD}>←→</kbd> cars
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>C</kbd> color
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>B</kbd> background
      </span>
    </div>
  );
}
