import { useRef, useState } from 'react';
import { CARS } from '../config';
import { useAppStore } from '../store';
import { CarBrowser } from './CarBrowser';
import './car-picker.css';

export function CarPicker({ mobile = false }: { mobile?: boolean }) {
  const index = useAppStore((state) => state.carIndex);
  const loading = useAppStore((state) => state.isCarLoading);
  const previous = useAppStore((state) => state.prevCar);
  const next = useAppStore((state) => state.cycleCar);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const car = CARS[index];
  const step = (direction: -1 | 1) => {
    if (!loading) (direction === -1 ? previous : next)();
  };
  return (
    <div
      className={`car-choice ${mobile ? 'car-choice-mobile' : 'car-choice-desktop'}`}
      role="group"
      aria-label="Car selection"
    >
      <button
        type="button"
        className="car-step"
        aria-label="Previous car"
        aria-disabled={loading}
        onClick={() => step(-1)}
      >
        ‹
      </button>
      <button
        ref={trigger}
        type="button"
        className="car-browse-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Browse cars. ${car.name}, ${car.code}`}
        onClick={() => setOpen(true)}
      >
        <span>{car.name}</span>
        <small>
          {car.code} · {loading ? 'Loading…' : 'Browse cars'}
        </small>
      </button>
      <button
        type="button"
        className="car-step"
        aria-label="Next car"
        aria-disabled={loading}
        onClick={() => step(1)}
      >
        ›
      </button>
      <span className="car-choice-status" role="status">
        {loading ? `Loading ${car.name}…` : ''}
      </span>
      {open && <CarBrowser onClose={() => setOpen(false)} returnFocus={trigger.current} />}
    </div>
  );
}
