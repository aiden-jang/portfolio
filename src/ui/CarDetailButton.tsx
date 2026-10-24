import { CARS } from '../config';
import { useAppStore } from '../store';

export function CarDetailButton() {
  const car = CARS[useAppStore((state) => state.carIndex)];
  const open = useAppStore((state) => state.drsOpen);
  const available = useAppStore((state) => state.hasDRS);
  const loading = useAppStore((state) => state.isCarLoading);
  const error = useAppStore((state) => state.carLoadError);
  const toggle = useAppStore((state) => state.toggleDRS);
  if (!car.drs) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || !!error || !available}
      aria-label="DRS rear wing"
      aria-pressed={open}
      title={`${open ? 'Close' : 'Open'} rear-wing flap`}
      className="pointer-events-auto inline-flex min-h-11 min-w-11 justify-center items-center gap-1.5 rounded-full px-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-neon)] disabled:opacity-40 aria-pressed:text-[var(--color-neon)]"
    >
      <span aria-hidden="true">{open ? '↔' : '↗'}</span>
      <span className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.13em] uppercase">
        DRS
      </span>
    </button>
  );
}
