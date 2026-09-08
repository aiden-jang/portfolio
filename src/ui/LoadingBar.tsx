import { useProgress } from '@react-three/drei';
import { CARS } from '../config';
import { useAppStore } from '../store';

// `useProgress` reads Three's default LoadingManager, so this tracks car swaps too, not just
// the first load.
export function LoadingBar() {
  const { progress, active } = useProgress();
  const carIndex = useAppStore((state) => state.carIndex);
  const car = CARS[carIndex];
  const pct = Math.round(progress);
  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 pointer-events-none
        transition-opacity duration-300
        ${active ? 'opacity-100' : 'opacity-0'}
      `}
      aria-hidden="true"
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
