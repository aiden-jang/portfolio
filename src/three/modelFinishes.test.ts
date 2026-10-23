import { Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Texture } from 'three';
import { expect, it, vi } from 'vitest';
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

it('gives shared Aventador paint a physical clearcoat while retaining its authored surface', () => {
  const model = new Group();
  const paint = new MeshStandardMaterial({
    color: '#7b9e35',
    roughness: 0.492,
    metalness: 0.254,
    map: new Texture(),
    normalMap: new Texture(),
  });
  paint.name = 'RED_PAINT';
  const wheel = new MeshStandardMaterial({ roughness: 0.7 });
  const single = new Mesh(undefined, paint);
  const multi = new Mesh(undefined, [paint, wheel]);
  model.add(single, multi);
  const dispose = vi.spyOn(paint, 'dispose');
  const textureDispose = vi.spyOn(paint.map!, 'dispose');
  prepareModelFinish(model, 'lamborghini-aventador.glb');
  const finish = single.material as MeshPhysicalMaterial;
  expect(finish).toBeInstanceOf(MeshPhysicalMaterial);
  expect(finish.defines).toHaveProperty('PHYSICAL');
  expect(finish.roughness).toBeLessThan(0.3);
  expect(finish.clearcoat).toBe(1);
  expect(finish.clearcoatRoughness).toBeLessThan(0.1);
  expect(finish.color).toEqual(paint.color);
  expect(finish.metalness).toBe(paint.metalness);
  expect(finish.name).toBe('RED_PAINT');
  expect(finish.map).toBe(paint.map);
  expect(finish.normalMap).toBe(paint.normalMap);
  expect(multi.material).toEqual([finish, wheel]);
  expect(wheel.roughness).toBe(0.7);
  expect(dispose).toHaveBeenCalledOnce();
  expect(textureDispose).not.toHaveBeenCalled();
});

it('keeps physical paint reusable and limits the coat to this car and body material', () => {
  const model = new Group();
  const paint = new MeshPhysicalMaterial({ roughness: 0.492 });
  paint.name = 'RED_PAINT';
  const trim = new MeshPhysicalMaterial({ roughness: 0.65 });
  trim.name = 'PAINT_BLACK';
  const mesh = new Mesh(undefined, [paint, trim]);
  model.add(mesh);
  prepareModelFinish(model, 'other.glb');
  expect(paint.clearcoat).toBe(0);
  prepareModelFinish(model, 'lamborghini-aventador.glb');
  prepareModelFinish(model, 'lamborghini-aventador.glb');
  expect(mesh.material).toEqual([paint, trim]);
  expect(paint.clearcoat).toBe(1);
  expect(trim.clearcoat).toBe(0);
  expect(trim.roughness).toBe(0.65);
});
