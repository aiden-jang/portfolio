import { CARS } from '../config';
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
};

export function StudioLoading({ car, pair, pairFailed, error, still, matched }: Props) {
  const retry = pair ? useLineup.getState().retry : useAppStore.getState().retryCar;
  const status = pairFailed
    ? 'Lineup could not load.'
    : error || (pair ? 'Bringing both cars into Studio…' : `Loading ${CARS[car].name}…`);
  return (
    <div
      className={matched ? 'studio-scene-status studio-matched-status' : 'studio-scene-status'}
      role="status"
    >
      {still && (
        <picture>
          <source media="(max-width: 767px)" srcSet={`/showroom/matched/390-${still}.webp`} />
          <img src={`/showroom/matched/1440-${still}.webp`} alt="" />
        </picture>
      )}
      <span>{status}</span>
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
