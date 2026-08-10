import { type ReactNode } from 'react';
import { CARS } from '../config';
import { useAppStore } from '../store';

/** Flat car cycler for the desktop control dock (the dock bar provides the
 *  pill/backdrop). Click cycles to the next car; the name has a fixed min-width
 *  so the bar doesn't jump as names change. */
export function CarSwitcher() {
  const carIndex = useAppStore((s) => s.carIndex);
  const cycleCar = useAppStore((s) => s.cycleCar);
  const isCarLoading = useAppStore((s) => s.isCarLoading);
  const car = CARS[carIndex];

  return (
    <button
      id="car-switcher"
      type="button"
      aria-label={`${car?.name ?? 'Current car'}, ${carIndex + 1} of ${CARS.length}. Next car`}
      title={`${car?.name ?? 'Current car'} · ${carIndex + 1} of ${CARS.length}`}
      onClick={cycleCar}
      disabled={isCarLoading}
      aria-busy={isCarLoading}
      className="
        group inline-flex items-center gap-2 cursor-pointer rounded-full px-3 py-1.5
        font-[var(--font-mono)] text-[0.72rem] tracking-[0.18em] uppercase
        text-[var(--color-fg)] transition-colors
        hover:text-[var(--color-neon)]
        [&.loading]:opacity-50 [&.loading]:pointer-events-none
      "
    >
      <span className="min-w-[7rem] text-center truncate">
        {isCarLoading ? 'Loading…' : (car?.name ?? '—')}
      </span>
      <span className="text-[var(--color-muted)] text-[1.05em] leading-none group-hover:text-[var(--color-neon)]">
        ›
      </span>
    </button>
  );
}

/** Mobile car control: explicit prev/next arrows flanking the current car
 *  name. Replaces the horizontal swipe gesture (which fought vertical scroll
 *  and the camera-orbit drag) with a discoverable, tappable affordance. */
export function MobileCarSwitcher() {
  const carIndex = useAppStore((s) => s.carIndex);
  const cycleCar = useAppStore((s) => s.cycleCar);
  const prevCar = useAppStore((s) => s.prevCar);
  const isCarLoading = useAppStore((s) => s.isCarLoading);
  const car = CARS[carIndex];

  return (
    <div
      role="group"
      aria-label={`${car?.name ?? 'Current car'}, ${carIndex + 1} of ${CARS.length}`}
      className="
        pointer-events-auto inline-flex items-center
        bg-white/[0.04] border border-[var(--color-line)] rounded-full
        font-[var(--font-mono)] text-[0.72rem] tracking-[0.16em] uppercase
        text-[var(--color-fg)]
      "
    >
      <ArrowButton
        label={`Previous car. ${car?.name ?? 'Current car'}, ${carIndex + 1} of ${CARS.length}`}
        onClick={prevCar}
        disabled={isCarLoading}
      >
        ‹
      </ArrowButton>
      <span aria-live="polite" className="min-w-[6rem] px-1 text-center truncate">
        {isCarLoading ? 'Loading…' : (car?.name ?? '—')}
      </span>
      <ArrowButton
        label={`Next car. ${car?.name ?? 'Current car'}, ${carIndex + 1} of ${CARS.length}`}
        onClick={cycleCar}
        disabled={isCarLoading}
      >
        ›
      </ArrowButton>
    </div>
  );
}

function ArrowButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="
        min-w-[44px] min-h-[44px] flex items-center justify-center
        text-[1.3em] leading-none text-[var(--color-muted)]
        rounded-full cursor-pointer transition-colors
        active:text-[var(--color-neon)] disabled:opacity-40 disabled:cursor-wait
      "
    >
      {children}
    </button>
  );
}
