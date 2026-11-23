import { useReducedMotion } from '../hooks/reducedMotion';
import { useAppStore } from '../store';
import { resetShowroomCamera, useOpeningPlayback } from '../three/openingPlayback';
import { ControlIcon } from './ControlIcon';
import './opening-loop-control.css';

export function OpeningLoopControl() {
  const visible = useAppStore((state) => state.sectionIndex === 0 && !state.sceneUnavailable);
  const disabled = useAppStore((state) => state.isCarLoading || !!state.carLoadError);
  const manual = useAppStore((state) => state.hasManualView);
  const playback = useOpeningPlayback((state) => state.playback);
  const reduced = useReducedMotion();
  if (!visible) return null;

  const restarting = reduced || manual || disabled || playback === 'off';
  const paused = playback === 'paused';
  const label = restarting
    ? reduced
      ? 'Restore default view'
      : 'Restart camera'
    : paused
      ? 'Resume opening camera'
      : 'Pause opening camera';

  return (
    <button
      className="opening-loop-control"
      type="button"
      aria-label={label}
      title={label}
      data-idle-reset={reduced && !manual ? '' : undefined}
      disabled={disabled}
      onClick={restarting ? resetShowroomCamera : useOpeningPlayback.getState().toggle}
    >
      <ControlIcon name={restarting ? 'reset' : paused ? 'play' : 'pause'} />
    </button>
  );
}
