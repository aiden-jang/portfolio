import { useAppStore } from '../store';
import { ControlIcon } from './ControlIcon';

export function CameraResetButton({ className = '' }: { className?: string }) {
  const resetCamera = useAppStore((state) => state.resetCamera);

  return (
    <button
      type="button"
      onClick={() => {
        Array.from(document.querySelectorAll<HTMLButtonElement>('.all-controls-trigger'))
          .find((element) => element.getClientRects().length)
          ?.focus({ preventScroll: true });
        resetCamera();
      }}
      aria-label="Reset camera view"
      title="Reset camera view (V)"
      className={`camera-reset-button ${className} group inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-neon)]`}
    >
      <span
        aria-hidden="true"
        className="text-[1rem] leading-none transition-transform duration-300 group-hover:-rotate-180"
      >
        <ControlIcon name="reset" />
      </span>
      <span className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.13em] uppercase">
        Reset view
      </span>
    </button>
  );
}
