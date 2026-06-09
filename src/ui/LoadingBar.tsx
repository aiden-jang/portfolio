import { useProgress } from '@react-three/drei';

/** 2px neon progress bar pinned to the top of the viewport. Reads from
 *  Three.js's default LoadingManager via drei's `useProgress`, so any GLB
 *  fetched by any `GLTFLoader` (including car swaps) is tracked. */
export function LoadingBar() {
  const { progress, active } = useProgress();
  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 h-[2px] pointer-events-none
        transition-opacity duration-300
        ${active ? 'opacity-100' : 'opacity-0'}
      `}
      aria-hidden="true"
    >
      <div
        className="h-full bg-[var(--color-neon)] origin-left transition-transform duration-150 ease-out [box-shadow:0_0_8px_var(--color-neon)]"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
