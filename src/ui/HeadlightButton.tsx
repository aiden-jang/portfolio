import { CARS } from '../config';
import { useAppStore } from '../store';

export function HeadlightButton() {
  const carIndex = useAppStore((state) => state.carIndex);
  const raised = useAppStore((state) => state.headlightsRaised);
  const loading = useAppStore((state) => state.isCarLoading);
  const available = useAppStore((state) => state.hasPopupHeadlights);
  const toggle = useAppStore((state) => state.toggleHeadlights);
  if (!CARS[carIndex].popupHeadlights) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || !available}
      aria-label="Pop-up headlights"
      aria-pressed={raised}
      title={raised ? 'Lower headlights' : 'Raise headlights'}
      className="pointer-events-auto inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-neon)] disabled:opacity-40"
    >
      <span aria-hidden="true">{raised ? '◉' : '◡'}</span>
      <span className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.13em] uppercase">
        Lights
      </span>
    </button>
  );
}
