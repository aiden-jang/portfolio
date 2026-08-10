import { useAppStore } from '../store';

/** A deliberately small delight control. The scene already supports a tap-to-
 * rev gesture; this makes that moment discoverable on desktop and pairs it
 * with the `R` shortcut in the control hint. */
export function RevButton() {
  const triggerRev = useAppStore((state) => state.triggerRev);

  return (
    <button
      type="button"
      onClick={triggerRev}
      aria-label="Rev engine"
      title="Rev engine (R)"
      className="group inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-neon)]"
    >
      <span aria-hidden="true" className="text-[0.9rem] leading-none group-hover:animate-pulse">
        ⌁
      </span>
      <span className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.13em] uppercase">
        Rev
      </span>
    </button>
  );
}
