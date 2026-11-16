import { CARS } from '../config';
import { useAppStore } from '../store';
import { ControlIcon } from './ControlIcon';

export function HeadlightButton() {
  const carIndex = useAppStore((state) => state.carIndex);
  const raised = useAppStore((state) => state.headlightsRaised);
  const loading = useAppStore((state) => state.isCarLoading);
  const available = useAppStore((state) => state.hasPopupHeadlights);
  const toggle = useAppStore((state) => state.toggleHeadlights);
  if (!CARS[carIndex].popupHeadlights) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || !available}
      aria-label="Pop-up headlights"
      aria-pressed={raised}
      title={raised ? 'Lower headlights' : 'Raise headlights'}
      className="scene-control-button"
    >
      <ControlIcon name="headlights" />
      <span>Lights</span>
    </button>
  );
}
