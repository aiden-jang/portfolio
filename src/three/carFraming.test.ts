import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { expect, it } from 'vitest';
import { CarFraming, fittedCarDistance } from './carFraming';
import { orbitPosition, framingDistanceMultiplier } from './cameraPose';

it('keeps every corner of a long car inside the phone margins after a broadside resize', () => {
  const bounds = new Box3(new Vector3(-1, 0, -3), new Vector3(1, 1.4, 3));
  const azimuth = Math.PI / 2;
  const elevation = 0.22;
  const width = 320,
    height = 844;
  const baseline = 9.5 * framingDistanceMultiplier(width / height);
  const distance = fittedCarDistance(bounds, azimuth, elevation, baseline, 0.7, width, height, 35);
  const camera = new PerspectiveCamera(35, width / height, 0.1, 200);
  const pose = orbitPosition(azimuth, elevation, distance, 0.7);
  camera.position.set(pose.x, pose.y, pose.z);
  camera.lookAt(0, 0.7, 0);
  camera.updateMatrixWorld();
  expect(distance).toBeGreaterThan(baseline);
  expect(Math.atan2(camera.position.x, camera.position.z)).toBeCloseTo(azimuth);
  for (let corner = 0; corner < 8; corner++) {
    const point = new Vector3(
      corner & 1 ? bounds.max.x : bounds.min.x,
      corner & 2 ? bounds.max.y : bounds.min.y,
      corner & 4 ? bounds.max.z : bounds.min.z,
    ).project(camera);
    expect(Math.abs(point.x)).toBeLessThanOrEqual(1 - 48 / width + 0.000001);
    expect(Math.abs(point.y)).toBeLessThan(1);
  }
});

it('keeps the authored distance when the car already fits or the viewport is not ready', () => {
  const bounds = new Box3(new Vector3(-1, 0, -2.5), new Vector3(1, 1, 2.5));
  expect(fittedCarDistance(bounds, 0.65, 0.22, 9.5, 0.7, 1440, 1000, 35)).toBe(9.5);
  expect(fittedCarDistance(bounds, 0.65, 0.22, 9.5, 0.7, 0, 0, 35)).toBe(9.5);
});

it('ignores hidden export geometry so orbiting does not shrink the car to fit an invisible floor', () => {
  const model = new Group();
  const material = new MeshBasicMaterial();
  const car = new Mesh(new BoxGeometry(2, 1, 5), material);
  car.position.y = 0.5;
  const hiddenFloor = new Mesh(new BoxGeometry(1000, 0.01, 1000), material);
  hiddenFloor.visible = false;
  model.add(car, hiddenFloor);
  expect(new CarFraming().fit(model, 0.65, 0.22, 9.5, 0.7, 1440, 1000, 35)).toBe(9.5);
  car.geometry.dispose();
  hiddenFloor.geometry.dispose();
  material.dispose();
});
