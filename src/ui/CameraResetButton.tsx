import { useAppStore } from '../store';

/** Returns the view to the section's composed camera angle after a visitor has
 * explored the car manually. Kept next to the garage controls so the escape
 * hatch is visible right where orbiting is introduced. */
export function CameraResetButton() {
  const resetCamera = useAppStore((state) => state.resetCamera);

  return (
    <button
      type="button"
      onClick={resetCamera}
      aria-label="Reset camera view"
      title="Reset camera view (V)"
      className="group inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-neon)]"
    >
      <span
        aria-hidden="true"
        className="text-[1rem] leading-none transition-transform duration-300 group-hover:-rotate-180"
      >
        ↺
      </span>
      <span className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.13em] uppercase">
        View
      </span>
    </button>
  );
}
