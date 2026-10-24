import { Box3, Mesh, Vector3 } from 'three';
import { expect, it } from 'vitest';
import { CARS } from '../config';
import { modelFixture } from '../test/modelFixture';
import { autoFitToLength } from './carHelpers';
import { createDRS } from './carDetails';

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

it('withholds details when the model lacks their verified joint', async () => {
  const { model } = await modelFixture('ferrari-f120-f40.glb');
  expect(createDRS(model, { node: 'missing', openAngle: -0.5 })).toBeNull();
  expect(createDRS(model, undefined)).toBeNull();
});
