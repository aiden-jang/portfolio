import { useAppStore } from '../store';
import { CAR_ZOOM_MAX, CAR_ZOOM_MIN, CAR_ZOOM_STEP } from '../three/carZoom';
import { ControlIcon } from './ControlIcon';

export function CarZoomControls() {
  const zoom = useAppStore((state) => state.cameraZoom);
  const loading = useAppStore((state) => state.isCarLoading);
  const failed = useAppStore((state) => !!state.carLoadError);
  const setZoom = useAppStore((state) => state.setCameraZoom);
  return (
    <div className="car-zoom-controls" role="group" aria-label="Camera controls">
      <button
        type="button"
        className="scene-control-button"
        aria-label="Zoom out"
        title="Zoom out"
        disabled={loading || failed || zoom <= CAR_ZOOM_MIN}
        onClick={() => setZoom(zoom - CAR_ZOOM_STEP)}
      >
        <ControlIcon name="zoomOut" />
      </button>
      <button
        type="button"
        className="scene-control-button"
        aria-label="Zoom in"
        title="Zoom in"
        disabled={loading || failed || zoom >= CAR_ZOOM_MAX}
        onClick={() => setZoom(zoom + CAR_ZOOM_STEP)}
      >
        <ControlIcon name="zoom" />
      </button>
    </div>
  );
}
