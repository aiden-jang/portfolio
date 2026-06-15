import { useProgress } from '@react-three/drei';

const MESSAGE = 'Warming up the engine';

/** 2px neon progress bar pinned to the top of the viewport, plus a small
 *  status line beneath it ("Warming up the engine · 73%"). Reads from
 *  Three.js's default LoadingManager via drei's `useProgress`, so any GLB
 *  fetched by any `GLTFLoader` (including car swaps) is tracked. */
export function LoadingBar() {
  const { progress, active } = useProgress();
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
        {MESSAGE}
        <span className="text-[var(--color-fg)] tabular-nums"> · {pct}%</span>
      </div>
    </div>
  );
}
