import { readFileSync } from 'node:fs';
import { modelFixture as paintFixture, type Model } from '../test/modelFixture';
import { expect, it } from 'vitest';
import * as THREE from 'three';
import { CARS } from '../config';
import { autoFitToLength, detectBodyMaterial, hideBakedPlanes } from './carHelpers';
import { prepareModelFinish } from './modelFinishes';

it.each([
  ['porsche-917k-lm-red.glb', 'body'],
  ['mazda-mx5-na.glb', 'Material.002'],
  ['toyota-gr-supra.glb', 'carpaint'],
  ['porsche-992-911-gt3.glb', 'Porsche_911GT3_2022Paint_Material'],
  ['lamborghini-aventador.glb', 'RED_PAINT'],
  ['bmw-g82-m4-adro.glb', 'untitledBMW_M4CompetitionG82TNR3_2021PaintTNR_Material_008'],
  ['nissan-r35-aimgain.glb', 'nNissan_GTRTNR4_2017PaintTNR_Material_002'],
  ['lamborghini-countach-5000qv.glb', 'Meshpart19Mtl'],
])('paints %s body panels without recoloring wheels or trim', async (file, materialName) => {
  const spec = CARS.find((car) => car.file === file)!;
  const { model, materials } = await paintFixture(spec.file);
  autoFitToLength(model);
  if (!spec.preserveFlatMeshes) hideBakedPlanes(model);
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

it.each([
  ['ferrari-f120-f40.glb', 'Metallic'],
  ['mercedes-benz-w198-300-sl.glb', 'main_color'],
  ['datsun-s30-280z.glb', '280z_CarPaint'],
  ['bmw-e30-m3.glb', 'BMW_E30_M3_PAINT'],
  ['toyota-a80-supra.glb', 'TOYOTA_SUPRA_CAR_PAINT'],
  ['mazda-mx5-na.glb', 'Material.002'],
  ['porsche-930-911-rwb.glb', 'M_Body'],
  ['bmw-g82-m4-adro.glb', 'untitledBMW_M4CompetitionG82TNR3_2021PaintTNR_Material_008'],
])('adds gloss only to the real %s paint surface', async (file, materialName) => {
  const spec = CARS.find((car) => car.file === file)!;
  const { model, materials } = await paintFixture(file);
  autoFitToLength(model);
  hideBakedPlanes(model);
  const body = detectBodyMaterial(model, spec.paintMaterial) as THREE.MeshStandardMaterial;
  expect(body.name).toBe(materialName);
  const before = materials.map((material) => material.toJSON());
  const color = body.color.clone();
  const metalness = body.metalness;
  const roughness = body.roughness;
  const coatRoughness =
    body instanceof THREE.MeshPhysicalMaterial && body.clearcoat > 0
      ? Math.min(body.clearcoatRoughness, 0.06)
      : 0.06;
  prepareModelFinish(model, file);
  const finish = detectBodyMaterial(model, spec.paintMaterial) as THREE.MeshPhysicalMaterial;
  expect(finish.name).toBe(materialName);
  expect(finish).toBeInstanceOf(THREE.MeshPhysicalMaterial);
  expect(finish.roughness).toBeLessThanOrEqual(Math.min(roughness, 0.24));
  expect(finish.clearcoat).toBe(1);
  expect(finish.clearcoatRoughness).toBe(coatRoughness);
  expect(finish.color).toEqual(color);
  expect(finish.map).toBe(body.map);
  expect(finish.metalness).toBe(metalness);
  for (const [index, material] of materials.entries()) {
    if (material !== body) expect(material.toJSON()).toEqual(before[index]);
  }
  prepareModelFinish(model, file);
  expect(detectBodyMaterial(model, spec.paintMaterial)).toBe(finish);
});

it('separates Countach clear-coated paint from opaque rubber and wheel finishes', async () => {
  const file = 'lamborghini-countach-5000qv.glb';
  const { model, materials } = await paintFixture(file);
  const before = materials.map((material) => material.toJSON());
  const paint = materials.find((material) => material.name === 'Meshpart19Mtl')!;
  const tire = materials.find((material) => material.name === 'Meshpart2Mtl')!;
  const color = paint.color.clone();
  const tireMap = tire.map;
  prepareModelFinish(model, file);
  const finish = detectBodyMaterial(model, 'Meshpart19Mtl') as THREE.MeshPhysicalMaterial;
  expect(finish).toBeInstanceOf(THREE.MeshPhysicalMaterial);
  expect(finish.roughness).toBeLessThan(0.25);
  expect(finish.metalness).toBe(0);
  expect(finish.clearcoat).toBe(1);
  expect(finish.clearcoatRoughness).toBeLessThan(0.08);
  expect(finish.color).toEqual(color);
  expect(tire.transparent).toBe(false);
  expect(tire.opacity).toBe(1);
  expect(tire.metalness).toBe(0);
  expect(tire.roughness).toBeGreaterThanOrEqual(0.8);
  expect((tire as THREE.MeshPhysicalMaterial).clearcoat).toBe(0);
  expect(tire.map).toBe(tireMap);
  for (const [index, material] of materials.entries()) {
    if (material !== paint && material !== tire) expect(material.toJSON()).toEqual(before[index]);
  }
  prepareModelFinish(model, file);
  expect(detectBodyMaterial(model, 'Meshpart19Mtl')).toBe(finish);
});
