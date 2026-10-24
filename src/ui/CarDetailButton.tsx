import { CARS } from '../config';
import { useAppStore } from '../store';

export function CarDetailButton() {
  const car = CARS[useAppStore((state) => state.carIndex)];
  const open = useAppStore((state) => state.drsOpen);
  const flashing = useAppStore((state) => state.flashActive);
  const available = useAppStore((state) => (car.drs ? state.hasDRS : state.hasFlashLights));
  const loading = useAppStore((state) => state.isCarLoading);
  const error = useAppStore((state) => state.carLoadError);
  const toggle = useAppStore((state) => state.toggleDRS);
  const flash = useAppStore((state) => state.flashLights);
  if (!car.drs && !car.flashMaterial) return null;
  return (
    <button
      type="button"
      onClick={car.drs ? toggle : flash}
      disabled={loading || !!error || !available || (!car.drs && flashing)}
      aria-label={car.drs ? 'DRS rear wing' : 'Flash headlights'}
      aria-pressed={car.drs ? open : undefined}
      title={car.drs ? `${open ? 'Close' : 'Open'} rear-wing flap` : 'Flash headlights'}
      className="pointer-events-auto inline-flex min-h-11 min-w-11 justify-center items-center gap-1.5 rounded-full px-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-neon)] disabled:opacity-40 aria-pressed:text-[var(--color-neon)]"
    >
      <span aria-hidden="true">{car.drs ? (open ? '↔' : '↗') : '✦'}</span>
      <span className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.13em] uppercase">
        {car.drs ? 'DRS' : 'Flash'}
      </span>
    </button>
  );
}
