import type { RefObject } from 'react';
import { ControlIcon } from '../ui/ControlIcon';

type Props = {
  title: string;
  car: string;
  leadWithCar: boolean;
  exit: RefObject<HTMLButtonElement>;
  onExit: () => void;
};

export function StudioHeading({ title, car, leadWithCar, exit, onExit }: Props) {
  const linkedShot = new URLSearchParams(window.location.search).get('garage') === 'studio';
  return (
    <>
      <header className="garage-studio-header">
        <span>AJ / Studio</span>
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
      </div>
    </>
  );
}
