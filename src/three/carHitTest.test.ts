import { afterEach, expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera } from 'three';
import { hitsCar } from './carHitTest';

const geometry = new BoxGeometry();
const material = new MeshBasicMaterial();
afterEach(() => {
  geometry.dispose();
  material.dispose();
});

it('responds to the model silhouette, not empty intro space or a missing model', () => {
  const model = new Group();
  model.add(new Mesh(geometry, material));
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 5;
  const bounds = { left: 10, top: 20, width: 500, height: 500 };
  expect(hitsCar(model, camera, bounds, 260, 270)).toBe(true);
  expect(hitsCar(model, camera, bounds, 15, 25)).toBe(false);
  expect(hitsCar(model, camera, bounds, 0, 0)).toBe(false);
  expect(hitsCar(null, camera, bounds, 260, 270)).toBe(false);
  expect(hitsCar(model, camera, { ...bounds, width: 0 }, 260, 270)).toBe(false);
});

it('ignores hidden meshes and hidden ancestors', () => {
  const model = new Group();
  const part = new Mesh(geometry, material);
  model.add(part);
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 5;
  const bounds = { left: 0, top: 0, width: 500, height: 500 };
  part.visible = false;
  expect(hitsCar(model, camera, bounds, 250, 250)).toBe(false);
  part.visible = true;
  model.visible = false;
  expect(hitsCar(model, camera, bounds, 250, 250)).toBe(false);
});
