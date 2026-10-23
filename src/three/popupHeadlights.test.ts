import { readFileSync } from 'node:fs';
import { AnimationClip, Group, QuaternionKeyframeTrack } from 'three';
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
  const clip = new AnimationClip('Scene', -1, [
    new QuaternionKeyframeTrack(
      'headlights.quaternion',
      values(sampler.input, 1),
      values(sampler.output, 4),
    ),
  ]);
  return { root, pivot, clip, settings: CARS.find((car) => car.popupHeadlights)!.popupHeadlights };
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
