import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Primitive = { attributes: Record<string, number>; indices?: number };
type Model = {
  extensionsRequired: string[];
  extensionsUsed: string[];
  accessors: { count: number; componentType: number }[];
  materials: {
    name: string;
    alphaMode?: string;
    pbrMetallicRoughness: { roughnessFactor?: number; metallicFactor?: number };
    extensions?: { KHR_materials_clearcoat?: { clearcoatFactor?: number } };
  }[];
  meshes: { primitives: Primitive[] }[];
};

function readModel(file: string): Model {
  const bytes = readFileSync(new URL(`../../public/models/${file}.glb`, import.meta.url));
  return JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
}

describe('car fidelity', () => {
  it('retains the full RWB mesh instead of a decimated export', () => {
    const model = readModel('porsche-930-911-rwb');
    const triangles = model.meshes
      .flatMap((mesh) => mesh.primitives)
      .reduce((total, primitive) => {
        const accessor = primitive.indices ?? primitive.attributes.POSITION;
        return total + model.accessors[accessor].count / 3;
      }, 0);
    expect(triangles).toBe(2_970_024);
  });

  it('preserves the full R8, Supra and 930 meshes and floating-point surfaces', () => {
    for (const [file, triangles] of [
      ['audi-r8', 447_204],
      ['toyota-a80-supra', 261_960],
      ['porsche-930-turbo-1975', 61_218],
    ] as const) {
      const model = readModel(file);
      expect(model.extensionsRequired).toContain('EXT_meshopt_compression');
      expect(model.extensionsRequired).toContain('EXT_texture_webp');
      expect(model.extensionsUsed).not.toContain('KHR_materials_pbrSpecularGlossiness');
      const primitives = model.meshes.flatMap((mesh) => mesh.primitives);
      expect(
        primitives.reduce(
          (sum, p) => sum + model.accessors[p.indices ?? p.attributes.POSITION].count / 3,
          0,
        ),
      ).toBe(triangles);
      for (const primitive of primitives) {
        for (const semantic of ['POSITION', 'NORMAL', 'TEXCOORD_0']) {
          const accessor = primitive.attributes[semantic];
          if (accessor !== undefined) {
            expect(model.accessors[accessor].componentType, `${file}: ${semantic}`).toBe(5126);
          }
        }
      }
    }
  });

  it('keeps R8 paint, tires and glazing separate with their authored finishes', () => {
    const { materials } = readModel('audi-r8');
    const rubber = materials.find((material) => material.name === 'tire');
    const paint = materials.find((material) => material.name === 'body');
    const glass = materials.find((material) => material.name === 'glass');
    expect(rubber).toBeDefined();
    expect(rubber!.alphaMode ?? 'OPAQUE').toBe('OPAQUE');
    expect(paint).toBeDefined();
    expect(paint!.pbrMetallicRoughness.roughnessFactor).toBeCloseTo(0.4739062061903426);
    expect(paint!.extensions?.KHR_materials_clearcoat?.clearcoatFactor).toBe(1);
    expect(glass?.alphaMode).toBe('BLEND');
  });
});
