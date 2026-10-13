import { CARS } from '../config';
import { useAppStore } from '../store';
import './car-picker.css';

export function CarPicker({ mobile = false }: { mobile?: boolean }) {
  const index = useAppStore((state) => state.carIndex);
  const choose = useAppStore((state) => state.setCarIndex);
  const loading = useAppStore((state) => state.isCarLoading);
  const car = CARS[index];
  return (
    <div className={`car-picker ${mobile ? 'mobile-car-label' : 'car-picker-desktop'}`}>
      <span aria-hidden="true">{car.name}</span>
      <small aria-hidden="true">
        {car.code}
        {loading ? ' ···' : ' ▾'}
      </small>
      <select
        aria-label="Choose a car"
        value={index}
        disabled={loading}
        onChange={(event) => choose(Number(event.target.value))}
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
