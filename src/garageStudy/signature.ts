import { useAppStore } from '../store';
import { activeOrbit, selectPose } from '../garageStudio/state';
import { useGarageStudy, type StudyCamera } from './state';

const shots = [
  [2.48, 0.035, 1, 'deck'],
  [1.57, 0, 1, 'profile'],
  [2.24, 0.03, 0.91],
  [0.96, 0, 1, 'wheel'],
  [0.55, 0, 0.94],
  [0.95, 0.04, 1],
  [1.18, 0.03, 0.95],
  [2.31, 0.045, 0.91],
  [1.79, 0, 1],
  [0.48, 0, 0.86],
  [0.5, 0.12, 0.93],
  [2.49, 0.05, 0.93],
  [2.38, 0.035, 0.94],
  [1.21, 0.005, 0.91],
  [2.66, 0.075, 0.95],
  [2.72, 0.045, 0.98],
  [2.9, 0.07, 0.95],
  [2.31, 0.025, 0.97],
  [2.46, 0.1, 0.98],
  [1.43, 0.015, 1.03],
  [0.7, 0.04, 0.9],
  [1.16, 0.015, 0.92],
] satisfies readonly (readonly [yaw: number, pitch: number, zoom: number, camera?: StudyCamera])[];

export function showSignature(car: number) {
  const shot = shots[car];
  if (!shot) return;
  const [yaw, pitch, zoom, camera = 'orbit'] = shot;
  useGarageStudy.setState({ camera, playing: false, look: car === 15 ? 'blackout' : 'studio' });
  if (car === 10) useAppStore.setState({ headlightsRaised: true });
  selectPose(yaw);
  Object.assign(activeOrbit(), { pitch, zoom });
}
