import { useState } from 'react';
import { CARS } from '../config';
import { copyCurrentSceneUrl } from '../sceneLink';
import { useAppStore } from '../store';

/** Copies a small permalink to the visitor's current garage setup. The link
 * restores car, paint, and lighting on load, so the 3D scene becomes a tiny
 * shareable artifact instead of a one-session interaction. */
export function SceneShareButton() {
  const carIndex = useAppStore((state) => state.carIndex);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (await copyCurrentSceneUrl()) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const car = CARS[carIndex];
  return (
    <div className="relative">
      {copied && (
        <span
          role="status"
          className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-full border border-[var(--color-neon)] bg-[#0b0b15] px-2.5 py-1 font-[var(--font-mono)] text-[0.58rem] tracking-[0.13em] uppercase text-[var(--color-neon)] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.85)] animate-[app-fade-in_160ms_ease-out_both]"
        >
          Garage link copied
        </span>
      )}
      <button
        type="button"
        onClick={() => void share()}
        aria-label={
          copied ? 'Garage link copied' : `Copy a link to this ${car?.name ?? 'car'} setup`
        }
        title="Copy this garage setup"
        className={`group inline-grid h-8 w-8 place-items-center rounded-full transition-transform duration-200 hover:scale-110 ${
          copied
            ? 'text-[var(--color-neon)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-neon)]'
        }`}
      >
        {copied ? (
          <span aria-hidden="true" className="text-[0.95rem]">
            ✓
          </span>
        ) : (
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
        )}
      </button>
    </div>
  );
}
