import { COMMAND_MENU_EVENT } from './CommandMenu';

export function MobileCommandButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COMMAND_MENU_EVENT))}
      aria-label="Open portfolio controls"
      className="pointer-events-auto inline-grid h-11 w-11 place-items-center rounded-full border border-[var(--color-line)] bg-white/[0.04] text-[var(--color-muted)] transition-colors active:border-[var(--color-neon)] active:text-[var(--color-neon)]"
    >
      {/* Sliders, not a ⌘: a phone has no command key, so the glyph named a shortcut nobody has. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-[1.05rem] w-[1.05rem]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M3 6h5M12 6h5M3 14h9M16 14h1" />
        <circle cx="10" cy="6" r="2" />
        <circle cx="14" cy="14" r="2" />
      </svg>
    </button>
  );
}
