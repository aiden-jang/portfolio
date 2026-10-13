import { CARS } from '../config';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import './car-picker.css';

export function CarPicker({ mobile = false }: { mobile?: boolean }) {
  const index = useAppStore((state) => state.carIndex);
  const choose = useAppStore((state) => state.setCarIndex);
  const loading = useAppStore((state) => state.isCarLoading);
  const car = CARS[index];
  const picker = useRef<HTMLSelectElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (loading || !restoreFocus.current) return;
    restoreFocus.current = false;
    if (document.activeElement === document.body && document.body.dataset.carView === 'visible')
      picker.current?.focus({ preventScroll: true });
  }, [loading]);
  return (
    <div className={`car-picker ${mobile ? 'mobile-car-label' : 'car-picker-desktop'}`}>
      <span aria-hidden="true">{car.name}</span>
      <small aria-hidden="true">
        {car.code}
        {loading ? ' ···' : mobile ? ' ▾' : ' · Change ▾'}
      </small>
      <select
        ref={picker}
        aria-label="Choose a car"
        title="Choose a car model"
        value={index}
        disabled={loading}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (next !== index) {
            restoreFocus.current = document.activeElement === event.currentTarget;
            choose(next);
          }
        }}
      >
        {CARS.map((item, i) => (
          <option key={item.code} value={i}>
            {item.name} · {item.code}
          </option>
        ))}
      </select>
    </div>
  );
}
