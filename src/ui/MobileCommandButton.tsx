import { COMMAND_MENU_EVENT } from './CommandMenu';

/** Touch entry point for the command menu. Desktop has the `?` and Cmd/Ctrl-K
 * shortcuts; mobile needs a visible way to reach scene actions without adding
 * more buttons to the already compact bottom garage bar. */
export function MobileCommandButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COMMAND_MENU_EVENT))}
      aria-label="Open portfolio controls"
      className="pointer-events-auto inline-grid h-11 w-11 place-items-center rounded-full border border-[var(--color-line)] bg-white/[0.04] text-[var(--color-muted)] transition-colors active:border-[var(--color-neon)] active:text-[var(--color-neon)]"
    >
      <span aria-hidden="true" className="text-[1.2rem] leading-none">
        ⌘
      </span>
    </button>
  );
}
