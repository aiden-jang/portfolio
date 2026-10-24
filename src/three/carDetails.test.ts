import { Box3, Mesh, MeshStandardMaterial, PointLight, Vector3 } from 'three';
import { expect, it, vi } from 'vitest';
import { CARS } from '../config';
import { modelFixture } from '../test/modelFixture';
import { autoFitToLength } from './carHelpers';
import { createDRS, createHeadlightFlash } from './carDetails';

it.each(['ferrari-f1-75.glb', 'red-bull-rb16b.glb'])(
  'moves only the %s DRS assembly and restores its exact resting pose',
  async (file) => {
    const { model } = await modelFixture(file);
    autoFitToLength(model);
    const settings = CARS.find((car) => car.file === file)!.drs!;
    const joint = model.getObjectByName(settings.node)!;
    const original = joint.quaternion.clone();
    const hinge = joint.getWorldPosition(new Vector3());
    model.updateMatrixWorld(true);
    const stationary = new Map();
    model.traverse((object) => {
      if (object instanceof Mesh && !joint.getObjectById(object.id))
        stationary.set(object, object.matrixWorld.clone());
    });
    const bounds = new Box3().setFromObject(joint, true);
    expect(bounds.max.z).toBeLessThan(-1);
    const detail = createDRS(model, settings)!;
    expect(detail).not.toBeNull();
    detail.setOpen(true);
    detail.update(0.1);
    expect(original.angleTo(joint.quaternion)).toBeGreaterThan(0.01);
    expect(original.angleTo(joint.quaternion)).toBeLessThan(Math.abs(settings.openAngle));
    detail.setOpen(false);
    for (let i = 0; i < 10; i++) detail.update(0.1);
    expect(original.angleTo(joint.quaternion)).toBeLessThan(1e-7);
    detail.setOpen(true, true);
    expect(original.angleTo(joint.quaternion)).toBeCloseTo(Math.abs(settings.openAngle));
    expect(joint.getWorldPosition(new Vector3()).distanceTo(hinge)).toBeLessThan(1e-7);
    model.updateMatrixWorld(true);
    for (const [object, matrix] of stationary) expect(object.matrixWorld).toEqual(matrix);
    detail.dispose();
    expect(original.angleTo(joint.quaternion)).toBeLessThan(1e-7);
  },
);

it('flashes only the Supra front surfaces, restores brightness and releases cloned resources', async () => {
  const { model } = await modelFixture('toyota-a80-supra.glb');
  autoFitToLength(model);
  let mesh!: Mesh;
  model.traverse((object) => {
    if (object instanceof Mesh && object.material.name === 'TOYOTA_SUPRA_MAIN_LIGHT') mesh = object;
  });
  const geometry = mesh.geometry;
  const material = mesh.material as MeshStandardMaterial;
  const before = material.toJSON();
  const front = { light: new PointLight(0xffffff, 2.2), baseIntensity: 2.2, isHeadlight: true };
  const rear = { light: new PointLight(0xff0000, 2.5), baseIntensity: 2.5, isHeadlight: false };
  const detail = createHeadlightFlash(model, 'TOYOTA_SUPRA_MAIN_LIGHT', [front, rear])!;
  expect(detail).not.toBeNull();
  const adapted = mesh.geometry;
  const glowing = (mesh.material as MeshStandardMaterial[])[1];
  const disposeGeometry = vi.spyOn(adapted, 'dispose');
  const disposeMaterial = vi.spyOn(glowing, 'dispose');
  expect(adapted.index!.count).toBe(geometry.index!.count);
  expect(adapted.getAttribute('position').array).toEqual(geometry.getAttribute('position').array);
  const point = new Vector3();
  for (const group of adapted.groups) {
    for (let i = group.start; i < group.start + group.count; i++) {
      const index = adapted.index!.getX(i);
      point
        .fromBufferAttribute(adapted.getAttribute('position'), index)
        .applyMatrix4(mesh.matrixWorld);
      expect(point.z > 0).toBe(group.materialIndex === 1);
    }
  }
  expect(detail.trigger()).toBe(true);
  expect(detail.trigger()).toBe(false);
  expect(detail.update(0.1)).toBe(true);
  expect(glowing.emissiveIntensity).toBeGreaterThan(0);
  expect(front.light.intensity).toBeGreaterThan(front.baseIntensity);
  expect(rear.light.intensity).toBe(rear.baseIntensity);
  for (let i = 0; i < 10; i++) detail.update(0.1);
  expect(glowing.emissiveIntensity).toBe(0);
  expect(front.light.intensity).toBe(front.baseIntensity);
  expect(material.toJSON()).toEqual(before);
  expect(detail.trigger(true)).toBe(true);
  const steady = glowing.emissiveIntensity;
  detail.update(0.1);
  expect(glowing.emissiveIntensity).toBe(steady);
  expect(detail.update(2)).toBe(false);
  expect(glowing.emissiveIntensity).toBe(0);
  expect(front.light.intensity).toBe(front.baseIntensity);
  expect(detail.trigger(true)).toBe(true);
  detail.dispose();
  expect(mesh.geometry).toBe(geometry);
  expect(mesh.material).toBe(material);
  expect(front.light.intensity).toBe(front.baseIntensity);
  expect(disposeGeometry).toHaveBeenCalledOnce();
  expect(disposeMaterial).toHaveBeenCalledOnce();
});

it('withholds details when the model lacks their verified joint or light surfaces', async () => {
  const { model } = await modelFixture('ferrari-f120-f40.glb');
  expect(createDRS(model, { node: 'missing', openAngle: -0.5 })).toBeNull();
  expect(createDRS(model, undefined)).toBeNull();
  expect(createHeadlightFlash(model, 'TOYOTA_SUPRA_MAIN_LIGHT')).toBeNull();
  expect(createHeadlightFlash(model)).toBeNull();
});
