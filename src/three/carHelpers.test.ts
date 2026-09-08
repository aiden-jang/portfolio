import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { autoFitToLength, detectBodyMaterial, disposeModel, hideBakedPlanes } from './carHelpers';

const TARGET_LENGTH = 4.5;

function box(
  size: [number, number, number],
  material: THREE.Material,
  position: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  return mesh;
}

function paint(color: number, name = ''): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ color });
  mat.name = name;
  return mat;
}

describe('autoFitToLength', () => {
  it('normalizes length and pins the wheels to the floor', () => {
    const model = new THREE.Group();
    model.add(box([1.8, 1.2, 9], paint(0xff0000), [3, 7, -2]));

    autoFitToLength(model);
    model.updateMatrixWorld(true);
    const fitted = new THREE.Box3().setFromObject(model);

    expect(fitted.max.z - fitted.min.z).toBeCloseTo(TARGET_LENGTH, 6);
    expect(fitted.min.y).toBeCloseTo(0, 6);
    expect(fitted.getCenter(new THREE.Vector3()).x).toBeCloseTo(0, 6);
  });

  it('turns a model whose length runs along X to face down Z', () => {
    const model = new THREE.Group();
    model.add(box([9, 1.2, 1.8], paint(0xff0000)));

    autoFitToLength(model);
    model.updateMatrixWorld(true);
    const fitted = new THREE.Box3().setFromObject(model);

    expect(fitted.max.z - fitted.min.z).toBeCloseTo(TARGET_LENGTH, 6);
    expect(fitted.max.x - fitted.min.x).toBeLessThan(TARGET_LENGTH);
  });

  it('reports the size it measured before scaling', () => {
    const model = new THREE.Group();
    model.add(box([1.8, 1.2, 9], paint(0xff0000)));

    const { scale, orientedSize } = autoFitToLength(model);

    expect(orientedSize.z).toBeCloseTo(9, 6);
    expect(scale).toBeCloseTo(TARGET_LENGTH / 9, 6);
  });
});

describe('disposeModel', () => {
  it('disposes the textures a material references, not just the material', () => {
    const disposed: string[] = [];
    const material = paint(0xff0000);
    for (const slot of ['map', 'normalMap', 'roughnessMap'] as const) {
      const texture = new THREE.Texture();
      texture.addEventListener('dispose', () => disposed.push(slot));
      material[slot] = texture;
    }
    const mesh = box([1, 1, 1], material);

    disposeModel(mesh);

    expect(disposed.sort()).toEqual(['map', 'normalMap', 'roughnessMap']);
  });

  it('reaches materials on every mesh in the tree, including arrays', () => {
    const disposed: THREE.Texture[] = [];
    const withTexture = () => {
      const mat = paint(0x00ff00);
      mat.map = new THREE.Texture();
      mat.map.addEventListener('dispose', () => disposed.push(mat.map!));
      return mat;
    };
    const root = new THREE.Group();
    const nested = new THREE.Group();
    nested.add(box([1, 1, 1], withTexture()));
    root.add(nested);
    const multi = box([1, 1, 1], withTexture());
    multi.material = [multi.material as THREE.Material, withTexture()];
    root.add(multi);

    disposeModel(root);

    expect(disposed).toHaveLength(3);
  });
});

describe('detectBodyMaterial', () => {
  it('picks the material on the largest, most saturated mesh', () => {
    const bodyMat = paint(0xff6b1c);
    const trimMat = paint(0x111111);
    const model = new THREE.Group();
    model.add(box([1.8, 1.2, 4], bodyMat));
    model.add(box([0.2, 0.2, 0.2], trimMat, [1, 0.5, 1]));

    expect(detectBodyMaterial(model)).toBe(bodyMat);
  });

  it('does not hand a tiny "Body_Paint" trim the win over the real body', () => {
    const bodyMat = paint(0xff6b1c, 'CarShell');
    const decoyMat = paint(0xff6b1c, 'Body_Paint');
    const model = new THREE.Group();
    model.add(box([1.8, 1.2, 4], bodyMat));
    model.add(box([0.05, 0.05, 0.05], decoyMat, [1, 0.5, 1]));

    expect(detectBodyMaterial(model)).toBe(bodyMat);
  });

  it('prefers a name match once it is a serious share of the top score', () => {
    const namedMat = paint(0xff6b1c, 'Body');
    const biggerMat = paint(0xff6b1c);
    const model = new THREE.Group();
    model.add(box([1.7, 1.1, 3.6], namedMat));
    model.add(box([1.8, 1.2, 4], biggerMat, [2.5, 0, 0]));

    expect(detectBodyMaterial(model)).toBe(namedMat);
  });

  it('passes over a textured material for solid paint of the same size', () => {
    const texturedMat = paint(0xff6b1c);
    texturedMat.map = new THREE.Texture();
    const solidMat = paint(0xff6b1c);
    const model = new THREE.Group();
    model.add(box([1.8, 1.2, 4], texturedMat));
    model.add(box([1.8, 1.2, 4], solidMat, [2.5, 0, 0]));

    expect(detectBodyMaterial(model)).toBe(solidMat);
  });

  it('skips glass and other near-transparent materials', () => {
    const glassMat = paint(0x88ccff);
    glassMat.transparent = true;
    glassMat.opacity = 0.2;
    const bodyMat = paint(0xff6b1c);
    const model = new THREE.Group();
    model.add(box([1.8, 1.4, 4.2], glassMat));
    model.add(box([1.8, 1.2, 4], bodyMat, [2.5, 0, 0]));

    expect(detectBodyMaterial(model)).toBe(bodyMat);
  });

  it('returns null when nothing in the model qualifies', () => {
    expect(detectBodyMaterial(new THREE.Group())).toBeNull();
  });
});

describe('hideBakedPlanes', () => {
  it('hides a flat shadow plane sitting on the ground but keeps the car', () => {
    const plane = box([4, 0.01, 4], paint(0x000000));
    const body = box([1.8, 1.2, 4], paint(0xff6b1c), [0, 0.6, 0]);
    const model = new THREE.Group();
    model.add(plane, body);

    hideBakedPlanes(model);

    expect(plane.visible).toBe(false);
    expect(body.visible).toBe(true);
  });
});
