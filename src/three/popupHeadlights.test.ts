import { readFileSync } from 'node:fs';
import {
  AnimationClip,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PointLight,
  QuaternionKeyframeTrack,
  Vector3,
} from 'three';
import { vi } from 'vitest';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { expect, it } from 'vitest';
import { CARS } from '../config';
import { createPopupHeadlights } from './popupHeadlights';

async function fixture() {
  await MeshoptDecoder.ready;
  const bytes = readFileSync(new URL('../../public/models/mazda-mx5-na.glb', import.meta.url));
  const jsonLength = bytes.readUInt32LE(12);
  const data = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const sampler = data.animations[0].samplers[0];
  function values(index: number, width: number) {
    const accessor = data.accessors[index];
    const view = data.bufferViews[accessor.bufferView];
    const compression = view.extensions.EXT_meshopt_compression;
    const offset = 28 + jsonLength + compression.byteOffset;
    const decoded = new Uint8Array(view.byteLength);
    MeshoptDecoder.decodeGltfBuffer(
      decoded,
      compression.count,
      compression.byteStride,
      bytes.subarray(offset, offset + compression.byteLength),
      compression.mode,
      compression.filter,
    );
    const floats = new DataView(decoded.buffer);
    return Array.from({ length: accessor.count * width }, (_, i) =>
      floats.getFloat32((accessor.byteOffset ?? 0) + i * 4, true),
    );
  }
  const root = new Group();
  const pivot = new Group();
  pivot.name = 'headlights';
  root.add(pivot);
  const fixtureMeshes: Mesh<BufferGeometry, MeshPhysicalMaterial>[] = [];
  for (const materialName of ['Material.008', 'Material.009']) {
    const materialIndex = data.materials.findIndex(
      (material: { name: string }) => material.name === materialName,
    );
    const primitives = data.meshes.flatMap(
      (mesh: { primitives: { material: number; attributes: Record<string, number> }[] }) =>
        mesh.primitives,
    );
    const primitive = primitives.find(
      (primitive: { material: number }) => primitive.material === materialIndex,
    );
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(values(primitive.attributes.POSITION, 3), 3),
    );
    geometry.setAttribute(
      'normal',
      new Float32BufferAttribute(values(primitive.attributes.NORMAL, 3), 3),
    );
    const material = new MeshPhysicalMaterial();
    material.name = materialName;
    const mesh = new Mesh(geometry, material);
    fixtureMeshes.push(mesh);
    pivot.add(mesh);
  }
  const clip = new AnimationClip('Scene', -1, [
    new QuaternionKeyframeTrack(
      'headlights.quaternion',
      values(sampler.input, 1),
      values(sampler.output, 4),
    ),
  ]);
  return {
    root,
    pivot,
    clip,
    fixtureMeshes,
    settings: CARS.find((car) => car.popupHeadlights)!.popupHeadlights,
  };
}

it('uses the authored Miata open pose, reverses mid-travel and holds each endpoint', async () => {
  const { root, pivot, clip, settings } = await fixture();
  const controller = createPopupHeadlights(root, [clip], settings)!;
  const opened = pivot.quaternion.clone();
  controller.setRaised(false);
  for (let i = 0; i < 3; i++) controller.update(0.1);
  const partial = pivot.quaternion.clone();
  expect(opened.angleTo(partial)).toBeGreaterThan(0.01);
  controller.setRaised(true);
  for (let i = 0; i < 10; i++) controller.update(0.1);
  expect(opened.angleTo(pivot.quaternion)).toBeLessThan(0.001);
  controller.setRaised(false);
  for (let i = 0; i < 10; i++) controller.update(0.1);
  const closed = pivot.quaternion.clone();
  expect(opened.angleTo(closed)).toBeGreaterThan(0.7);
  for (let i = 0; i < 60; i++) controller.update(0.1);
  expect(closed.angleTo(pivot.quaternion)).toBeLessThan(0.001);
  controller.dispose();
});

it('sets the requested pose immediately for reduced motion and releases the binding', async () => {
  const { root, pivot, clip, settings } = await fixture();
  const original = pivot.quaternion.clone();
  const controller = createPopupHeadlights(root, [clip], settings)!;
  const open = pivot.quaternion.clone();
  controller.setRaised(false, true);
  expect(open.angleTo(pivot.quaternion)).toBeGreaterThan(0.7);
  controller.setRaised(true, true);
  expect(open.angleTo(pivot.quaternion)).toBeLessThan(0.001);
  controller.dispose();
  expect(original.angleTo(pivot.quaternion)).toBeLessThan(0.001);
});

it('does not expose animation controls when the configured clip is missing', async () => {
  const { root, settings } = await fixture();
  expect(createPopupHeadlights(root, [], settings)).toBeNull();
  expect(createPopupHeadlights(root, [], undefined)).toBeNull();
});

it('lights both actual lens surfaces, follows the hinges and restores owned resources', async () => {
  const { root, pivot, clip, settings, fixtureMeshes } = await fixture();
  const bulb = fixtureMeshes.find(({ material }) => material.name === settings!.bulbMaterial)!;
  const original = bulb.material;
  const controller = createPopupHeadlights(root, [clip], settings)!;
  const glowing = bulb.material;
  const disposed = vi.spyOn(glowing, 'dispose');
  const lights: PointLight[] = [];
  root.traverse((object) => {
    if (object instanceof PointLight) lights.push(object);
  });
  expect(lights).toHaveLength(2);
  expect(glowing).not.toBe(original);
  expect(original.emissiveIntensity).toBe(1);
  expect(original.emissive.getHex()).toBe(0);
  expect(glowing.emissiveIntensity).toBeGreaterThan(1);
  expect(glowing.emissive.r).toBeGreaterThan(glowing.emissive.b);
  expect(lights.every((light) => light.intensity > 0)).toBe(true);
  root.updateMatrixWorld(true);
  const openedPosition = lights[0].getWorldPosition(new Vector3());
  controller.setRaised(false);
  for (let i = 0; i < 3; i++) controller.update(0.1);
  expect(glowing.emissiveIntensity).toBeGreaterThan(0);
  expect(glowing.emissiveIntensity).toBeLessThan(4);
  controller.setRaised(false, true);
  expect(glowing.emissiveIntensity).toBe(0);
  expect(lights.every((light) => light.intensity === 0)).toBe(true);
  expect(lights[0].getWorldPosition(new Vector3()).distanceTo(openedPosition)).toBeGreaterThan(
    0.01,
  );
  controller.setRaised(true, true);
  expect(glowing.emissiveIntensity).toBe(4);
  expect(lights.every((light) => light.intensity > 0)).toBe(true);
  controller.dispose();
  expect(bulb.material).toBe(original);
  expect(disposed).toHaveBeenCalledOnce();
  expect(lights.every((light) => light.parent === null)).toBe(true);
  expect(pivot.children).toHaveLength(2);
});
