import { CARS } from '../config';
import { useAppStore } from '../store';
import { ControlIcon } from './ControlIcon';

export function CarDetailButton() {
  const car = CARS[useAppStore((state) => state.carIndex)];
  const open = useAppStore((state) => state.drsOpen);
  const available = useAppStore((state) => state.hasDRS);
  const loading = useAppStore((state) => state.isCarLoading);
  const error = useAppStore((state) => state.carLoadError);
  const toggle = useAppStore((state) => state.toggleDRS);
  if (!car.drs) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || !!error || !available}
      aria-label="DRS rear wing"
      aria-pressed={open}
      title={`${open ? 'Close' : 'Open'} rear-wing flap`}
      className="scene-control-button"
    >
      <ControlIcon name="wing" />
      <span>DRS</span>
    </button>
  );
}
