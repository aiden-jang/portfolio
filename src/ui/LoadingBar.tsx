import { useRef } from 'react';
import { CARS } from '../config';
import { useAppStore } from '../store';
import { useGarageStudio } from '../garageStudio/state';
import { CarLoadMeter } from './CarLoadMeter';
import { useSlowCarLoad } from './useSlowCarLoad';
import './loading-bar.css';
import { useLoadingPlacement } from './useLoadingPlacement';

export function LoadingBar() {
  const carIndex = useAppStore((state) => state.carIndex);
  const section = useAppStore((state) => state.sectionIndex);
  const loading = useAppStore((state) => state.isCarLoading && !state.carLoadError);
  const garage = useGarageStudio((state) => state.active);
  const visible = useSlowCarLoad(loading && !garage && section === 0, carIndex);
  const bar = useRef<HTMLDivElement>(null);
  useLoadingPlacement(bar, visible, section);
  const car = CARS[carIndex];
  return (
    <div
      ref={bar}
      className={`car-loading-progress transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      role="status"
      aria-hidden={!visible}
      aria-label={visible ? `Loading ${car.name}` : undefined}
    >
      <div className="car-loading-copy">
        <span>Bringing in {car.name}</span>
        {visible && <CarLoadMeter index={carIndex} />}
      </div>
    </div>
  );
}
