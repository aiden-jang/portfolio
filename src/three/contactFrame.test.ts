import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { KEYFRAMES } from '../config';
import { contactFrame } from './contactFrame';
import { framingDistanceMultiplier, orbitPosition } from './cameraPose';

function cameraAt(distance: number, aspect: number) {
  const camera = new PerspectiveCamera(35, aspect, 0.1, 200);
  const pose = orbitPosition(0, KEYFRAMES.at(-1)!.elevation, distance, KEYFRAMES.at(-1)!.targetY);
  camera.position.set(pose.x, pose.y, pose.z);
  camera.lookAt(0, KEYFRAMES.at(-1)!.targetY, 0);
  camera.updateMatrixWorld();
  return camera;
}

function screen(point: Vector3, camera: PerspectiveCamera, width: number, height: number) {
  const projected = point.clone().project(camera);
  return { x: ((projected.x + 1) * width) / 2, y: ((1 - projected.y) * height) / 2 };
}

describe('Contact composition', () => {
  for (const [width, height, sectionHeight] of [
    [1440, 900, 900],
    [900, 700, 700],
    [1024, 500, 700],
    [899, 900, 900],
    [390, 844, 844],
    [320, 568, 820],
  ]) {
    it(`matches the approved section framing at ${width} × ${height} while scrolling`, () => {
      const desktop = width >= 900;
      const stageDistance =
        KEYFRAMES.at(-1)!.distance *
        framingDistanceMultiplier(width / sectionHeight) *
        (desktop ? 1 : 1.08);
      const reference = cameraAt(stageDistance, width / sectionHeight);
      reference.setViewOffset(
        width,
        sectionHeight,
        desktop ? -width * 0.22 : 0,
        desktop ? 0 : -sectionHeight * 0.2,
        width,
        sectionHeight,
      );

      for (const sectionTop of [160, 0, -120]) {
        const view = contactFrame({ width, height, sectionHeight, sectionTop, progress: 1 });
        const actual = cameraAt(
          KEYFRAMES.at(-1)!.distance *
            framingDistanceMultiplier(width / height) *
            view.distanceMultiplier,
          width / height,
        );
        actual.setViewOffset(
          view.fullWidth,
          view.fullHeight,
          view.offsetX,
          view.offsetY,
          view.width,
          view.height,
        );

        for (const point of [new Vector3(0, 0.7, 0), new Vector3(-1, 0.3, 2)]) {
          const approved = screen(point, reference, width, sectionHeight);
          const rendered = screen(point, actual, width, height);
          expect(rendered.x).toBeCloseTo(approved.x, 7);
          expect(rendered.y).toBeCloseTo(approved.y + sectionTop, 7);
        }
        const target = screen(new Vector3(0, 0.7, 0), actual, width, height);
        expect(target.x).toBeCloseTo(width * (desktop ? 0.72 : 0.5), 7);
        expect(target.y).toBeCloseTo(sectionHeight * (desktop ? 0.5 : 0.7) + sectionTop, 7);
      }
    });
  }

  it('starts the arrival centered before easing into the final composition', () => {
    for (const width of [390, 1440]) {
      const view = contactFrame({
        width,
        height: 900,
        sectionHeight: 900,
        sectionTop: 300,
        progress: 0,
      });
      expect(view.offsetX).toBeCloseTo(0);
      expect(view.offsetY).toBe(-300);
      expect(view.distanceMultiplier).toBe(1);
    }
  });
});
