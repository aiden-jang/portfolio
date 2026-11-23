import { smoothScrollTo } from '../hooks/scrollNavigation';
import { useAppStore } from '../store';
import { replayOpeningOrbit } from '../three/openingPlayback';
import { ControlIcon } from './ControlIcon';

export function CameraResetButton() {
  const manualView = useAppStore((state) => state.hasManualView);
  return (
    <div className="camera-reset-slot">
      {manualView && (
        <button
          type="button"
          className="scene-control-button camera-reset-button"
          onClick={(event) => {
            event.currentTarget
              .closest('.car-controls-row')
              ?.querySelector<HTMLButtonElement>('.all-controls-trigger')
              ?.focus({ preventScroll: true });
            replayOpeningOrbit();
            if (window.scrollY > 1) smoothScrollTo(0);
          }}
          aria-label="Reset camera view"
          title="Reset view"
        >
          <ControlIcon name="reset" />
        </button>
      )}
    </div>
  );
}
