import { Group, Mesh, MeshPhysicalMaterial, Texture } from 'three';
import { expect, it } from 'vitest';
import { prepareModelFinish } from './modelFinishes';

function fixture() {
  const model = new Group();
  const body = new MeshPhysicalMaterial({ metalness: 1, roughness: 0.53, map: new Texture() });
  body.name = 'mat_220';
  const window = new MeshPhysicalMaterial({ color: 'green', metalness: 0.79, transparent: true });
  window.name = 'Window';
  const rim = new MeshPhysicalMaterial({ metalness: 0.93 });
  rim.name = 'mat_75';
  model.add(new Mesh(undefined, [body, window, rim]));
  return { model, body, window, rim };
}

it('corrects the 296 printed body and glazing without changing decals or wheel metal', () => {
  const { model, body, window, rim } = fixture();
  const map = body.map;
  const color = body.color.clone();
  prepareModelFinish(model, 'ferrari-296-gt3.glb');
  expect(body.metalness).toBe(0);
  expect(body.clearcoat).toBe(0.2);
  expect(body.polygonOffset).toBe(true);
  expect(body.polygonOffsetFactor).toBeLessThan(0);
  expect(body.map).toBe(map);
  expect(body.color).toEqual(color);
  expect(window.metalness).toBe(0);
  expect(window.color.getHexString()).toBe('a9b0b7');
  expect(window.opacity).toBeLessThan(0.5);
  expect(window.depthWrite).toBe(false);
  expect(rim.metalness).toBe(0.93);
});

it('leaves matching material names in other cars untouched', () => {
  const { model, body, window } = fixture();
  prepareModelFinish(model, 'ferrari-f120-f40.glb');
  expect(body.metalness).toBe(1);
  expect(window.color.getHexString()).toBe('008000');
  expect(window.metalness).toBe(0.79);
});
