const KBD =
  'inline-block px-1.5 py-[0.1rem] bg-white/[0.05] border border-[var(--color-line)] rounded text-[var(--color-fg)]/90 text-[0.9em] tracking-[0.12em]';

/** Bottom-center hint strip showing primary controls. */
export function Hint() {
  return (
    <div
      id="hint"
      className="
        fixed left-1/2 -translate-x-1/2 bottom-[1vh] z-20
        hidden md:flex items-center justify-center gap-3 md:gap-[1.1rem]
        whitespace-nowrap pointer-events-none
        font-[var(--font-mono)] text-[0.5rem] md:text-[0.6rem]
        tracking-[0.16em] md:tracking-[0.2em] uppercase
        text-[var(--color-muted)]/80
      "
    >
      {/* Keyboard + gesture reference. The click controls live in the dock;
       *  this lists the shortcut for each, kept uniform across all of them. */}
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>drag</kbd> orbit
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>scroll</kbd> / <kbd className={KBD}>↑↓</kbd> sections
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>←→</kbd> cars
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>C</kbd> color
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>B</kbd> background
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>R</kbd> rev
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>V</kbd> view
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>X</kbd> mix
      </span>
      <span className="hidden md:inline-flex items-center gap-2">
        <kbd className={KBD}>?</kbd> commands
      </span>
    </div>
  );
}
