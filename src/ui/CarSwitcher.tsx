import { CarPicker } from './CarPicker';
import { type ReactNode } from 'react';
import { CARS } from '../config';
import { useAppStore } from '../store';

export function CarSwitcher() {
  return <CarPicker />;
}

// Arrows rather than a swipe: on touch a horizontal swipe competes with both the page scroll
// and the camera-orbit drag.
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
      <CarPicker mobile />
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
