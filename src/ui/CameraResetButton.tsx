import { useAppStore } from '../store';
import { resetShowroomCamera } from '../three/openingPlayback';
import { ControlIcon } from './ControlIcon';

export function CameraResetButton() {
  const loading = useAppStore((state) => state.isCarLoading);
  const failed = useAppStore((state) => !!state.carLoadError);
  return (
    <button
      type="button"
      className="scene-control-button camera-reset-button"
      onClick={resetShowroomCamera}
      aria-label="Reset view"
      disabled={loading || failed}
    >
      <ControlIcon name="reset" />
      <span className="camera-reset-label" aria-hidden="true">
        Reset view
      </span>
    </button>
  );
}
