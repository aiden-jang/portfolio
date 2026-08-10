import { CARS } from '../config';
import { useAppStore } from '../store';

/** Copies a small permalink to the visitor's current garage setup. The link
 * restores car, paint, and lighting on load, so the 3D scene becomes a tiny
 * shareable artifact instead of a one-session interaction. */
export function SceneShareButton() {
  const carIndex = useAppStore((state) => state.carIndex);
  const activeBodyColor = useAppStore((state) => state.activeBodyColor);
  const themeName = useAppStore((state) => state.themeName);

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('car', String(carIndex));
    url.searchParams.set('paint', activeBodyColor);
    url.searchParams.set('light', themeName);
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // Clipboard permission is not guaranteed in embedded/private browsers.
      // The rest of the garage controls remain fully usable without it.
    }
  };

  const car = CARS[carIndex];
  return (
    <button
      type="button"
      onClick={() => void share()}
      aria-label={`Copy a link to this ${car?.name ?? 'car'} setup`}
      title="Copy this garage setup"
      className="group inline-grid h-8 w-8 place-items-center rounded-full text-[var(--color-muted)] transition-transform duration-200 hover:scale-110 hover:text-[var(--color-neon)]"
    >
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M8 12a4 4 0 0 1 4-4h4a4 4 0 1 1 0 8h-4a4 4 0 0 1-4-4Z" />
        <path d="M16 12a4 4 0 0 1-4 4H8a4 4 0 1 1 0-8h4a4 4 0 0 1 4 4Z" />
      </svg>
    </button>
  );
}
