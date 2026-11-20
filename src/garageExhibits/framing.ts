import { Box3, MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { exhibitWheel, pairFrame } from './geometry';
import { useGarageExhibit } from './state';

const interior = new Box3(new Vector3(-0.55, 0.71, -0.26), new Vector3(0.55, 1.16, 1));
const brakeBounds = new Box3(new Vector3(0.56, 0.06, 0.8), new Vector3(1.13, 0.7, 1.46));
const axleOffset = new Vector3(-0.015, 0.048, 0);
const markerPosition = new Vector3();

function limitYaw(yaw: number, origin: number, range: number) {
  const delta = yaw - origin;
  return origin + MathUtils.clamp(Math.atan2(Math.sin(delta), Math.cos(delta)), -range, range);
}

export function frameExhibit(
  chapter: string,
  car: number,
  overhead: boolean,
  mobile: boolean,
  narrow: number,
  yaw: number,
  pitch: number,
  target: Vector3,
  fallback: Box3,
) {
  const { exhibit, after, focus, wheelClose } = useGarageExhibit.getState();
  if (exhibit === 'porsche' && chapter === 'lineup' && !overhead) {
    const focused = after ? pairFrame.cars[focus] : undefined;
    const bounds = focused ?? (after && !pairFrame.bounds.isEmpty() ? pairFrame.bounds : fallback);
    bounds.getCenter(target);
    target.y = focused ? 0.58 : 0.51;
    return {
      bounds,
      yaw,
      mode: focused ? 'focus' : 'pair',
      elevation: focused ? 0.105 : mobile ? 0.22 + 0.12 * Math.abs(Math.cos(yaw + 0.49)) : 0.095,
      fov: focused ? (mobile ? 37 : 30) : mobile ? 52 : 38,
      base: focused ? (mobile ? 11.45 + narrow * 2.6 : 8) : mobile ? 12.4 : 11.6,
    } as const;
  }

  if (chapter !== 'walk') return;
  if (exhibit === 'cockpit' && car === 10 && after) {
    target.set(mobile ? 0.15 : 0.035, 0.8, mobile ? 0.34 : 0.26);
    return {
      bounds: interior,
      yaw: limitYaw(yaw, 2.49, 0.48),
      mode: 'cockpit',
      elevation: MathUtils.clamp(0.38 + pitch, 0.27, 0.55),
      fov: mobile ? 66 : 59,
      base: mobile ? 1.84 + narrow * 0.23 : 1.58,
    } as const;
  }
  if (car === 20 && (exhibit === 'brakes' || (exhibit === 'wear' && wheelClose))) {
    target.set(0.815, 0.37, 1.16);
    if (exhibitWheel.point) target.copy(exhibitWheel.point).add(axleOffset);
    return {
      bounds: brakeBounds,
      yaw: limitYaw(yaw, 0.71, 0.61),
      mode: 'wheel',
      elevation: MathUtils.clamp(0.18 + pitch, 0.06, 0.36),
      fov: mobile ? 46 : 35,
      base: mobile ? 2.17 : 2.25,
    } as const;
  }
}

export function exhibitRadius(mode: string | undefined, base: number, fit: number, zoom: number) {
  if (mode === 'cockpit') return base * MathUtils.clamp(zoom, 0.88, 1.1);
  if (mode === 'wheel') return Math.max(base, fit) * MathUtils.clamp(zoom, 0.85, 1.28);
  if (mode === 'focus') return base;
}

export function positionWheelMarker(camera: PerspectiveCamera, width: number, height: number) {
  const { marker, point } = exhibitWheel;
  if (!marker || !point) return;
  markerPosition.copy(point);
  markerPosition.x += 0.11;
  markerPosition.y -= 0.08;
  markerPosition.project(camera);
  const left = (markerPosition.x * 0.5 + 0.5) * width;
  const top = (-markerPosition.y * 0.5 + 0.5) * height;
  marker.style.left = left + 'px';
  marker.style.top = top + 'px';
  marker.style.visibility =
    left > 55 && left < width - (width < 768 ? 52 : 124) && top > 80 && top < height * 0.7
      ? 'visible'
      : 'hidden';
}
