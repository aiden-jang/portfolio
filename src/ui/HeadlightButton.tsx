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
  if (carIndex !== F40_INDEX && !CARS[carIndex].popupHeadlights) return null;
  const action = raised ? 'Lower headlights' : 'Raise headlights';
  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        onChange?.();
      }}
      disabled={loading || waiting || !available}
      aria-label="Pop-up headlights"
      aria-pressed={raised}
      title={action}
      className={studio ? undefined : 'scene-control-button'}
    >
      <ControlIcon name="headlights" />
      <span>Lights</span>
    </button>
  );
}
