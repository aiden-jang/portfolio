import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CARS } from '../config';
import { autoFitToLength, detectBodyMaterial, hideBakedPlanes } from './carHelpers';

type Model = {
  bufferViews: {
    byteOffset?: number;
    byteLength: number;
    byteStride?: number;
    extensions?: {
      EXT_meshopt_compression: {
        byteOffset?: number;
        byteLength: number;
        byteStride: number;
        count: number;
        mode: string;
        filter?: string;
      };
    };
  }[];
  accessors: {
    bufferView: number;
    byteOffset?: number;
    count: number;
    componentType: number;
    normalized?: boolean;
  }[];
  materials: {
    name: string;
    alphaMode?: string;
    pbrMetallicRoughness?: { baseColorFactor?: number[]; baseColorTexture?: unknown };
  }[];
  meshes: {
    primitives: { attributes: { POSITION: number }; indices: number; material: number }[];
  }[];
  nodes: {
    mesh?: number;
    matrix?: number[];
    children?: number[];
    rotation?: number[];
    scale?: number[];
    translation?: number[];
  }[];
  scenes: { nodes: number[] }[];
};

// Load the real mesh bounds, hierarchy, colors and texture presence used by paint discovery.
// Image decoding and other vertex attributes do not participate in material selection.
async function paintFixture(file: string) {
  const bytes = readFileSync(new URL(`../../public/models/${file}`, import.meta.url));
  const jsonLength = bytes.readUInt32LE(12);
  const data: Model = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const binary = bytes.subarray(28 + jsonLength);
  await MeshoptDecoder.ready;
  const materials = data.materials.map((source) => {
    const material = new THREE.MeshStandardMaterial();
    material.name = source.name;
    const factor = source.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1];
    material.color.setRGB(factor[0], factor[1], factor[2]);
    material.opacity = factor[3];
    material.transparent = source.alphaMode === 'BLEND';
    if (source.pbrMetallicRoughness?.baseColorTexture) material.map = new THREE.Texture();
    return material;
  });
  const objects = data.nodes.map((node) => {
    const group = new THREE.Group();
    if (node.matrix) group.applyMatrix4(new THREE.Matrix4().fromArray(node.matrix));
    if (node.translation) group.position.fromArray(node.translation);
    if (node.rotation) group.quaternion.fromArray(node.rotation);
    if (node.scale) group.scale.fromArray(node.scale);
    if (node.mesh === undefined) return group;
    for (const primitive of data.meshes[node.mesh].primitives) {
      const accessor = data.accessors[primitive.attributes.POSITION];
      const view = data.bufferViews[accessor.bufferView];
      const compressed = view.extensions?.EXT_meshopt_compression;
      let decoded: Uint8Array;
      if (compressed) {
        decoded = new Uint8Array(compressed.count * compressed.byteStride);
        const offset = compressed.byteOffset ?? 0;
        MeshoptDecoder.decodeGltfBuffer(
          decoded,
          compressed.count,
          compressed.byteStride,
          binary.subarray(offset, offset + compressed.byteLength),
          compressed.mode,
          compressed.filter,
        );
      } else
        decoded = binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
      const values = new Float32Array(accessor.count * 3);
      const reader = new DataView(decoded.buffer, decoded.byteOffset, decoded.byteLength);
      const stride = view.byteStride ?? compressed?.byteStride ?? 12;
      const signed = accessor.componentType === 5122;
      const quantized = signed || accessor.componentType === 5123;
      if (!quantized && accessor.componentType !== 5126)
        throw new Error('Unsupported position type');
      for (let i = 0; i < accessor.count; i++)
        for (let axis = 0; axis < 3; axis++) {
          const offset = (accessor.byteOffset ?? 0) + i * stride + axis * (quantized ? 2 : 4);
          const value = quantized
            ? signed
              ? reader.getInt16(offset, true)
              : reader.getUint16(offset, true)
            : reader.getFloat32(offset, true);
          values[i * 3 + axis] =
            quantized && accessor.normalized
              ? Math.max(value / (signed ? 32767 : 65535), -1)
              : value;
        }
      const geometry = new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.BufferAttribute(values, 3),
      );
      geometry.setIndex(
        new THREE.BufferAttribute(new Uint32Array(data.accessors[primitive.indices].count), 1),
      );
      group.add(new THREE.Mesh(geometry, materials[primitive.material]));
    }
    return group;
  });
  data.nodes.forEach((node, index) =>
    node.children?.forEach((child) => objects[index].add(objects[child])),
  );
  const model = new THREE.Group();
  data.scenes[0].nodes.forEach((node) => model.add(objects[node]));
  return { model, materials };
}

it.each([
  ['porsche-917k-lm-red.glb', 'body'],
  ['mazda-mx5-na.glb', 'Material.002'],
  ['toyota-gr-supra.glb', 'carpaint'],
  ['porsche-992-911-gt3.glb', 'Porsche_911GT3_2022Paint_Material'],
  ['lamborghini-aventador.glb', 'RED_PAINT'],
  ['bmw-g82-m4-adro.glb', 'untitledBMW_M4CompetitionG82TNR3_2021PaintTNR_Material_008'],
])('paints %s body panels without recoloring wheels or trim', async (file, materialName) => {
  const spec = CARS.find((car) => car.file === file)!;
  const { model, materials } = await paintFixture(spec.file);
  autoFitToLength(model);
  hideBakedPlanes(model);
  const before = materials.map((material) => material.color.clone());
  const selected = detectBodyMaterial(model, spec.paintMaterial);
  expect(selected?.name).toBe(materialName);
  selected!.color!.set('#365d7b');
  for (const [index, material] of materials.entries()) {
    if (material === selected) expect(material.color.getHexString()).toBe('365d7b');
    else expect(material.color).toEqual(before[index]);
  }
});

it('ships opaque Red Bull tires and outer carbon panels instead of the transparent original export', () => {
  const bytes = readFileSync(new URL('../../public/models/red-bull-rb16b.glb', import.meta.url));
  const length = bytes.readUInt32LE(12);
  const data: Model = JSON.parse(bytes.subarray(20, 20 + length).toString());
  const solids = data.materials.filter(
    ({ name }) =>
      /^Material_\d+$/.test(name) || name === 'redbull_carbon1' || name === 'redbull_paint',
  );
  expect(solids.length).toBeGreaterThan(5);
  for (const material of solids) expect(material.alphaMode ?? 'OPAQUE').toBe('OPAQUE');
});
