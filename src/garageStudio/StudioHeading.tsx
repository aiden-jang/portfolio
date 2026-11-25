import type { RefObject } from 'react';
import { CARS } from '../config';
import { CarLoadMeter } from '../ui/CarLoadMeter';
import { useSlowCarLoad } from '../ui/useSlowCarLoad';
import { ControlIcon } from '../ui/ControlIcon';
import { StudioShortcuts } from './StudioShortcuts';

type Props = {
  title: string;
  car: string;
  incoming?: number;
  leadWithCar: boolean;
  exit: RefObject<HTMLButtonElement>;
  onExit: () => void;
};

export function StudioHeading({ title, car, incoming, leadWithCar, exit, onExit }: Props) {
  const loading = useSlowCarLoad(incoming !== undefined, incoming);
  return (
    <>
      <header className="garage-studio-header">
        <span>AJ / Garage</span>
        <div className="studio-header-actions">
          <StudioShortcuts />
          <button ref={exit} type="button" className="studio-return" onClick={onExit}>
            <ControlIcon name="arrow" /> Back to portfolio
          </button>
        </div>
      </header>
      <div className="garage-studio-title">
        <h2 className="studio-original-title">{leadWithCar ? car : title}</h2>
        {!leadWithCar && <p className="studio-original-title">{car}</p>}
        <h2 className="studio-compact-title">
          {leadWithCar ? car.replaceAll('-', '\u2011') : title}
        </h2>
        {!leadWithCar && <p className="studio-compact-title">{car}</p>}
        <p className="studio-swap-name" role="status">
          {loading && incoming !== undefined && (
            <>
              <span>Loading {CARS[incoming].name}…</span>
              <CarLoadMeter index={incoming} />
            </>
          )}
        </p>
      </div>
    </>
  );
}
