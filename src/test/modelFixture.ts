import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export type Model = {
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
    pbrMetallicRoughness?: {
      baseColorFactor?: number[];
      baseColorTexture?: unknown;
      metallicFactor?: number;
      roughnessFactor?: number;
    };
    extensions?: {
      KHR_materials_clearcoat?: { clearcoatFactor?: number; clearcoatRoughnessFactor?: number };
    };
  }[];
  meshes: {
    primitives: { attributes: { POSITION: number }; indices: number; material: number }[];
  }[];
  nodes: {
    name?: string;
    mesh?: number;
    matrix?: number[];
    children?: number[];
    rotation?: number[];
    scale?: number[];
    translation?: number[];
  }[];
  scenes: { nodes: number[] }[];
};

// Decode actual positions, triangle indices and hierarchy for material and moving-part checks.
// Texture presence is retained without image decoding.
export async function modelFixture(file: string) {
  const bytes = readFileSync(new URL(`../../public/models/${file}`, import.meta.url));
  const jsonLength = bytes.readUInt32LE(12);
  const data: Model = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const binary = bytes.subarray(28 + jsonLength);
  await MeshoptDecoder.ready;
  const views = new Map<number, Uint8Array>();
  function values(index: number, width: number) {
    const accessor = data.accessors[index];
    const view = data.bufferViews[accessor.bufferView];
    let decoded = views.get(accessor.bufferView);
    const compressed = view.extensions?.EXT_meshopt_compression;
    if (!decoded) {
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
      views.set(accessor.bufferView, decoded);
    }
    const reader = new DataView(decoded.buffer, decoded.byteOffset, decoded.byteLength);
    const type = accessor.componentType;
    if (![5122, 5123, 5125, 5126].includes(type))
      throw new Error('Unsupported fixture component type');
    const bytes = type === 5126 || type === 5125 ? 4 : 2;
    const stride = view.byteStride ?? compressed?.byteStride ?? width * bytes;
    const result =
      width === 1
        ? type === 5125
          ? new Uint32Array(accessor.count)
          : new Uint16Array(accessor.count)
        : new Float32Array(accessor.count * width);
    for (let i = 0; i < result.length; i++) {
      const offset =
        (accessor.byteOffset ?? 0) + Math.floor(i / width) * stride + (i % width) * bytes;
      const value =
        type === 5126
          ? reader.getFloat32(offset, true)
          : type === 5125
            ? reader.getUint32(offset, true)
            : type === 5122
              ? reader.getInt16(offset, true)
              : reader.getUint16(offset, true);
      result[i] = accessor.normalized
        ? Math.max(value / (type === 5122 ? 32767 : 65535), -1)
        : value;
    }
    return result;
  }
  const materials = data.materials.map((source) => {
    const coat = source.extensions?.KHR_materials_clearcoat;
    const material = coat ? new THREE.MeshPhysicalMaterial() : new THREE.MeshStandardMaterial();
    material.metalness = source.pbrMetallicRoughness?.metallicFactor ?? 1;
    material.roughness = source.pbrMetallicRoughness?.roughnessFactor ?? 1;
    if (material instanceof THREE.MeshPhysicalMaterial) {
      material.clearcoat = coat?.clearcoatFactor ?? 0;
      material.clearcoatRoughness = coat?.clearcoatRoughnessFactor ?? 0;
    }
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
    group.name = THREE.PropertyBinding.sanitizeNodeName(node.name ?? '');
    if (node.matrix) group.applyMatrix4(new THREE.Matrix4().fromArray(node.matrix));
    if (node.translation) group.position.fromArray(node.translation);
    if (node.rotation) group.quaternion.fromArray(node.rotation);
    if (node.scale) group.scale.fromArray(node.scale);
    if (node.mesh === undefined) return group;
    for (const primitive of data.meshes[node.mesh].primitives) {
      const geometry = new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute(values(primitive.attributes.POSITION, 3), 3),
      );
      geometry.setIndex(new THREE.BufferAttribute(values(primitive.indices, 1), 1));
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
