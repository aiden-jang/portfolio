import { MathUtils, type Vector3 } from 'three';
import { useGarageExhibit } from './state';

export function frameMechanical(
  chapter: string,
  yaw: number,
  pitch: number,
  aspect: number,
  mobile: boolean,
  short: number,
  target: Vector3,
) {
  const { exhibit, shot, aligned } = useGarageExhibit.getState();
  if (exhibit === 'porsche' && chapter === 'lineup' && aligned) {
    const radius = 6.65;
    target.set(0, 0.04, 0.02);
    return {
      radius,
      angle: 1.495 + MathUtils.clamp(pitch, -0.24, 0.045),
      fov: MathUtils.radToDeg(
        2 * Math.atan((Math.max(mobile ? 4 : 5.45, 3.48 / aspect) + short) / radius),
      ),
    };
  }
  if (exhibit === 'lamps' && chapter === 'detail') {
    target.set(0, 0.23, 1.23);
    return { radius: mobile ? 9.8 : 8.25, angle: 0.33 + pitch, fov: mobile ? 55 : 41 };
  }
  if (exhibit === 'clarity' && chapter === 'walk' && shot > 0) {
    target.set(0.86, 0.36, 1.16);
    return {
      radius: mobile ? 2.16 : 2.25,
      angle: 0.12 + Math.max(-0.09, pitch),
      fov: mobile ? 53 : 41,
    };
  }
  if (exhibit === 'wings' && chapter === 'lineup') {
    target.set(0, 0.55, -0.65);
    const fov = mobile ? 54 : 34;
    const halfWidth = 3.1 * Math.abs(Math.cos(yaw)) + 2.65 * Math.abs(Math.sin(yaw));
    const distance = halfWidth / (Math.tan(MathUtils.degToRad(fov / 2)) * aspect) + 2.1;
    return { radius: Math.max(6.8, distance), angle: 0.11 + Math.max(-0.07, pitch), fov };
  }
}
