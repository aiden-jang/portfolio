import { useCarDownload } from '../three/carDownload';
import './car-load-meter.css';

export function CarLoadMeter({ index }: { index: number }) {
  const percent = useCarDownload((state) => (state.index === index ? state.percent : null));
  return (
    <span className="car-load-meter">
      {percent !== null && <span aria-hidden="true">{percent}%</span>}
      <progress aria-label="Car download" max={100} value={percent ?? undefined} />
    </span>
  );
}
