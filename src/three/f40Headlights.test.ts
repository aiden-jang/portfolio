import { Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { expect, it, vi } from 'vitest';
import { modelFixture } from '../test/modelFixture';
import { createF40Headlights } from './f40Headlights';

it('hinges both F40 housings in place and restores the stock geometry outside the showroom', async () => {
  const { model } = await modelFixture('ferrari-f120-f40.glb', true);
  const parent = model.children[0];
  const hood = parent.children.find(
    (node) => node instanceof Mesh && node.material.name === 'Metallic',
  ) as Mesh;
  const original = hood.geometry;
  const controller = createF40Headlights(model)!;
  expect(controller).not.toBeNull();
  expect(hood.geometry).toBe(original);
  expect(parent.children.filter((object) => object instanceof Group)).toHaveLength(0);

  controller.setActive(true);
  const pivots = parent.children.filter((object) => object instanceof Group);
  expect(pivots).toHaveLength(2);
  expect(hood.geometry).not.toBe(original);
  expect(pivots.every((pivot) => pivot.visible)).toBe(true);
  const sample = () =>
    pivots.map((pivot) => {
      const lid = pivot.children.find(
        (node) => node instanceof Mesh && node.material.name === 'Metallic',
      ) as Mesh;
      const vertex = lid.geometry.index!.getX(1);
      return lid.localToWorld(
        new Vector3().fromBufferAttribute(lid.geometry.getAttribute('position'), vertex),
      );
    });
  const lid = pivots[0].children.find(
    (node) => node instanceof Mesh && node.material.name === 'Metallic',
  ) as Mesh;
  const openPoints = sample();
  const clock = vi.spyOn(performance, 'now').mockReturnValue(1000);
  try {
    controller.setRaised(false);
    clock.mockReturnValue(1360);
    controller.update(0.36, 1);
    const midway = sample();
    clock.mockReturnValue(1720);
    controller.update(0.36, 1);
    const closed = sample();
    for (const [side, pivot] of pivots.entries()) {
      const hinge = pivot.getWorldPosition(new Vector3());
      expect(midway[side].y).toBeLessThan(openPoints[side].y);
      expect(midway[side].y).toBeGreaterThan(closed[side].y);
      for (const point of [midway[side], closed[side]]) {
        expect(point.x).toBeCloseTo(openPoints[side].x, 7);
        expect(point.distanceTo(hinge)).toBeCloseTo(openPoints[side].distanceTo(hinge), 7);
      }
    }
    const hoodEdge = hood.localToWorld(new Vector3(804, 2016, 14660));
    const lidPositions = lid.geometry.getAttribute('position');
    const edgeDistances = Array.from({ length: lidPositions.count }, (_, index) =>
      lid.localToWorld(new Vector3().fromBufferAttribute(lidPositions, index)).distanceTo(hoodEdge),
    );
    expect(Math.min(...edgeDistances)).toBeLessThan(0.006);
    expect(Math.max(...edgeDistances)).toBeLessThan(0.6);
    expect(controller.beam).toBe(0);

    controller.setRaised(true);
    clock.mockReturnValue(2080);
    controller.update(0.36, 1);
    expect(controller.beam).toBe(0);
    controller.setRaised(true, true);
    controller.update(0, 1);
    expect(controller.beam).toBe(1);
    const bulbs = pivots.flatMap((pivot) =>
      pivot.children.flatMap((node) =>
        node instanceof Mesh &&
        node.material instanceof MeshStandardMaterial &&
        node.material.name === 'material_14'
          ? [node.material]
          : [],
      ),
    );
    expect(bulbs).toHaveLength(2);
    expect(bulbs.every((bulb) => bulb.emissiveIntensity > 0)).toBe(true);
    controller.update(0, 0);
    expect(bulbs.every((bulb) => bulb.emissiveIntensity === 0)).toBe(true);
  } finally {
    clock.mockRestore();
    controller.setActive(false);
    expect(hood.geometry).toBe(original);
    expect(pivots.every((pivot) => !pivot.visible)).toBe(true);
    controller.dispose();
  }
});
