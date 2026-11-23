import { useAppStore } from '../store';
import { useOpeningPlayback } from '../three/openingPlayback';
import { ControlIcon } from './ControlIcon';
import './opening-loop-control.css';

export function OpeningLoopControl() {
  const section = useAppStore((state) => state.sectionIndex);
  const playback = useOpeningPlayback((state) => state.playback);
  if (playback === 'off' || section !== 0) return null;
  const paused = playback === 'paused';
  const label = paused ? 'Resume opening camera' : 'Pause opening camera';
  return (
    <button
      className="opening-loop-control"
      type="button"
      aria-label={label}
      title={label}
      onClick={useOpeningPlayback.getState().toggle}
    >
      <ControlIcon name={paused ? 'play' : 'pause'} />
    </button>
  );
}
