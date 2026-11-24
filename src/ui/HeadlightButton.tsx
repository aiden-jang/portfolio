import { CARS, F40_INDEX } from '../config';
import { useAppStore } from '../store';
import { ControlIcon } from './ControlIcon';

export function HeadlightButton({
  studio = false,
  waiting = false,
  onChange,
}: {
  studio?: boolean;
  waiting?: boolean;
  onChange?: () => void;
} = {}) {
  const carIndex = useAppStore((state) => state.carIndex);
  const raised = useAppStore((state) => state.headlightsRaised);
  const loading = useAppStore((state) => state.isCarLoading);
  const available = useAppStore((state) => state.hasPopupHeadlights);
  const toggle = useAppStore((state) => state.toggleHeadlights);
  const isF40 = carIndex === F40_INDEX;
  if (!isF40 && !CARS[carIndex].popupHeadlights) return null;
  const action = raised ? 'Lower headlights' : 'Raise headlights';
  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        onChange?.();
      }}
      disabled={loading || waiting || !available}
      aria-label={isF40 ? action : 'Pop-up headlights'}
      aria-pressed={raised}
      title={action}
      className={
        studio
          ? undefined
          : isF40
            ? 'scene-control-button intro-headlight-button'
            : 'scene-control-button'
      }
    >
      <ControlIcon name="headlights" />
      <span>{isF40 ? action : 'Lights'}</span>
    </button>
  );
}
