import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Primitive = { attributes: Record<string, number>; indices?: number };
type Model = {
  accessors: { count: number; componentType: number }[];
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

  it('preserves floating-point surfaces on the NSX and RX-7', () => {
    for (const file of ['honda-na1-nsx', 'mazda-fd-rx7']) {
      const model = readModel(file);
      for (const primitive of model.meshes.flatMap((mesh) => mesh.primitives)) {
        for (const semantic of ['POSITION', 'NORMAL', 'TEXCOORD_0']) {
          const accessor = primitive.attributes[semantic];
          if (accessor !== undefined) {
            expect(model.accessors[accessor].componentType, `${file}: ${semantic}`).toBe(5126);
          }
        }
      }
    }
  });
});
