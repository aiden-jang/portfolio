import { useAppStore } from '../store';

export function CarLoadNotice() {
  const error = useAppStore((state) => state.carLoadError);
  const retry = useAppStore((state) => state.retryCar);
  if (!error) return null;
  return (
    <div className="car-load-notice" role="alert">
      <p>{error}</p>
      <button type="button" onClick={retry}>
        Retry car
      </button>
    </div>
  );
}
