import type { RefObject } from 'react';
import { ControlIcon } from '../ui/ControlIcon';
import { useAppStore } from '../store';
import { useGarageStudy } from '../garageStudy/state';
import { useGarageStudio } from './state';
import { isGarageAfterHours } from './lighting';

type Props = {
  title: string;
  car: string;
  incoming?: string;
  leadWithCar: boolean;
  exit: RefObject<HTMLButtonElement>;
  onExit: () => void;
};

export function StudioHeading({ title, car, incoming, leadWithCar, exit, onExit }: Props) {
  const theme = useAppStore((state) => state.themeName);
  const look = useGarageStudy((state) => state.look);
  const afterHours = useGarageStudio((state) => isGarageAfterHours(theme, state, look));
  const linkedShot = new URLSearchParams(window.location.search).get('garage') === 'studio';
  return (
    <>
      <header className="garage-studio-header">
        <span>{afterHours ? 'AJ / After Hours' : 'AJ / Studio'}</span>
        <button ref={exit} type="button" className="studio-return" onClick={onExit}>
          <ControlIcon name="arrow" /> {linkedShot ? 'Back to portfolio' : 'Back to Garage'}
        </button>
      </header>
      <div className="garage-studio-title">
        <h2 className="studio-original-title">{leadWithCar ? car : title}</h2>
        {!leadWithCar && <p className="studio-original-title">{car}</p>}
        <h2 className="studio-compact-title">
          {leadWithCar ? car.replaceAll('-', '\u2011') : title}
        </h2>
        {!leadWithCar && <p className="studio-compact-title">{car}</p>}
        <p className="studio-swap-name" role="status">
          {incoming ? `Loading ${incoming}…` : null}
        </p>
      </div>
    </>
  );
}
