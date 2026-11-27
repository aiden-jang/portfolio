import { DEFAULT_CAR_INDEX, CARS } from '../config';
import { useAppStore } from '../store';
import { useGarageStudy } from '../garageStudy/state';
import { useGarageStudio } from './state';
import { isGarageAfterHours } from './lighting';

export function GarageArrivalPoster({ car }: { car: number }) {
  const { themeName, activeBodyColor } = useAppStore();
  const studio = useGarageStudio();
  const look = useGarageStudy((s) => s.look);
  const orbit = studio.orbit;
  const opening =
    car === DEFAULT_CAR_INDEX &&
    activeBodyColor === 'original' &&
    studio.chapter === 'walk' &&
    Math.abs(orbit.yaw - 0.65) < 0.02 &&
    Math.abs(orbit.pitch) < 0.02 &&
    Math.abs(orbit.zoom - 1) < 0.02;
  const light = isGarageAfterHours(themeName, studio, look) ? 'night' : 'studio';
  const path = '/showroom/garage-entry/' + light + '-';
  return opening ? (
    <picture className="garage-arrival-poster" aria-hidden="true">
      <source media="(max-width:767px) and (max-height:699px)" srcSet={path + 'short.webp'} />
      <source media="(max-width:767px)" srcSet={path + 'phone.webp'} />
      <img src={path + 'desktop.webp'} alt="" fetchPriority="high" />
    </picture>
  ) : (
    <div className="garage-arrival-poster garage-arrival-thumbnail" aria-hidden="true">
      <img src={'/cars/' + CARS[car].file.replace(/\.glb$/, '.jpg')} alt="" />
    </div>
  );
}
