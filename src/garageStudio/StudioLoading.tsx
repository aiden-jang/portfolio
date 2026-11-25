import { keepPreviousCar } from './matchedSwap';
import { CARS } from '../config';
import { CarLoadMeter } from '../ui/CarLoadMeter';
import { useLineup } from '../lineup/state';
import { useAppStore } from '../store';
import { repaintStudio } from './state';
import './studio-loading.css';

type Props = {
  car: number;
  pair: boolean;
  pairFailed: boolean;
  error: string | null;
  still?: string | null;
  matched: boolean;
  outgoing?: string;
};

export function StudioLoading({ car, pair, pairFailed, error, still, matched, outgoing }: Props) {
  const retry = pair ? useLineup.getState().retry : useAppStore.getState().retryCar;
  const name = CARS[car].name;
  const status = pairFailed
    ? 'Lineup could not load.'
    : error && matched
      ? `Could not load ${name}.`
      : error || (pair ? 'Bringing both cars into Studio…' : `Loading ${name}…`);
  return (
    <div
      className={matched ? 'studio-scene-status studio-matched-status' : 'studio-scene-status'}
      role="status"
      data-load-failed={!!error}
    >
      {still && !error && (
        <picture>
          <source media="(max-width: 767px)" srcSet={`/showroom/matched/390-${still}.webp`} />
          <img src={`/showroom/matched/1440-${still}.webp`} alt="" />
        </picture>
      )}
      <span>
        {status}
        {!error && !pair && <CarLoadMeter index={car} />}
        {outgoing && !still && !error && <small>Holding the {outgoing} in view</small>}
      </span>
      {error && matched && (
        <button type="button" onClick={keepPreviousCar}>
          Keep previous car
        </button>
      )}
      {(error || pairFailed) && (
        <button
          type="button"
          onClick={() => {
            retry();
            repaintStudio();
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
