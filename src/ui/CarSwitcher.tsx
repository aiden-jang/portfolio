import { useRef } from 'react';
import { useMagnetic } from '../hooks/useMagnetic';
import { CARS } from '../config';
import { useAppStore } from '../store';

/** Header chip that cycles through CARS on click. Shows the current car's
 *  display name + chassis code with a thin divider between them. */
export function CarSwitcher() {
  const carIndex = useAppStore((s) => s.carIndex);
  const cycleCar = useAppStore((s) => s.cycleCar);
  const car = CARS[carIndex];
  const ref = useRef<HTMLButtonElement>(null);
  useMagnetic(ref, 0.15);

  return (
    <button
      ref={ref}
      id="car-switcher"
      type="button"
      aria-label="Next car"
      onClick={cycleCar}
      className="
        bg-white/[0.04] border border-[var(--color-line)] rounded-full
        px-3.5 py-[0.45rem] inline-flex items-center gap-2 cursor-pointer
        font-[var(--font-mono)] text-[0.74rem] tracking-[0.18em] uppercase
        text-[var(--color-fg)] transition-[color,border-color,transform] duration-200
        will-change-transform
        hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]
        [&.loading]:opacity-50 [&.loading]:pointer-events-none
        min-w-[17rem] justify-between
      "
    >
      <span className="truncate">{car?.name ?? '—'}</span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-[var(--color-muted)] tracking-[0.22em] pl-2 ml-1 border-l border-[var(--color-line)] text-[0.92em] inline-block w-[3.2rem] text-center">
          {car?.code ?? ''}
        </span>
        <span className="text-[var(--color-muted)] text-[1.05em] leading-none">›</span>
      </span>
    </button>
  );
}
