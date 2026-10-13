import { useProgress } from '@react-three/drei';
import { CARS } from '../config';
import { useAppStore } from '../store';

export function LoadingBar() {
  const { progress, active } = useProgress();
  const carIndex = useAppStore((state) => state.carIndex);
  const car = CARS[carIndex];
  const pct = Math.round(progress);
  return (
    <div
      className={`
        car-loading-progress
        fixed top-0 left-0 right-0 z-50 pointer-events-none
        transition-opacity duration-300
        ${active ? 'opacity-100' : 'opacity-0'}
      `}
      role="status"
      aria-hidden={!active}
      aria-label={active ? `Loading ${car?.name ?? 'car'}` : undefined}
    >
      <div className="h-[2px]">
        <div
          className="h-full bg-[var(--color-neon)] origin-left transition-transform duration-150 ease-out [box-shadow:0_0_8px_var(--color-neon)]"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
      <div
        className="
          mt-2 text-center font-[var(--font-mono)] text-[0.6rem] tracking-[0.28em]
          uppercase text-[var(--color-muted)]
        "
      >
        Bringing in {car?.name ?? 'the car'}
        <span className="text-[var(--color-fg)] tabular-nums"> · {pct}%</span>
      </div>
    </div>
  );
}
