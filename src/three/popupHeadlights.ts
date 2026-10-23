import {
  AnimationMixer,
  Box3,
  LoopOnce,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  Vector3,
  type AnimationClip,
  type Object3D,
} from 'three';
import type { CarSpec } from '../types';

const BULB_COLOR = 0xfff2d8;

function illuminateLenses(model: Object3D, settings: NonNullable<CarSpec['popupHeadlights']>) {
  const bulbs: { mesh: Mesh; original: Mesh['material']; glowing: MeshStandardMaterial[] }[] = [];
  const lights: PointLight[] = [];
  model.updateMatrixWorld(true);
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    if (materials.some((material) => material.name === settings.bulbMaterial)) {
      const glowing: MeshStandardMaterial[] = [];
      const adapted = materials.map((material) => {
        if (material.name !== settings.bulbMaterial || !(material instanceof MeshStandardMaterial))
          return material;
        const bulb = material.clone();
        bulb.emissive.setHex(BULB_COLOR);
        glowing.push(bulb);
        return bulb;
      });
      bulbs.push({ mesh: object, original: object.material, glowing });
      object.material = Array.isArray(object.material) ? adapted : adapted[0];
    }
    if (!materials.some((material) => material.name === settings.lensMaterial)) return;
    const positions = object.geometry.getAttribute('position');
    const normals = object.geometry.getAttribute('normal');
    if (!positions || !normals) return;
    object.geometry.computeBoundingBox();
    const middle = object.geometry.boundingBox!.getCenter(new Vector3()).x;
    const offset =
      0.08 / Math.max(object.getWorldScale(new Vector3()).length() / Math.sqrt(3), 0.001);
    for (const left of [true, false]) {
      const bounds = new Box3();
      const direction = new Vector3();
      for (let i = 0; i < positions.count; i++) {
        if (positions.getX(i) < middle !== left) continue;
        bounds.expandByPoint(new Vector3().fromBufferAttribute(positions, i));
        direction.add(new Vector3().fromBufferAttribute(normals, i));
      }
      if (bounds.isEmpty()) continue;
      const light = new PointLight(BULB_COLOR, 0, 7, 2);
      bounds.getCenter(light.position).addScaledVector(direction.normalize(), offset);
      object.add(light);
      lights.push(light);
    }
  });
  return {
    setBrightness(amount: number) {
      for (const { glowing } of bulbs)
        for (const material of glowing) material.emissiveIntensity = amount * 4;
      for (const light of lights) light.intensity = amount * 2.2;
    },
    dispose() {
      for (const light of lights) light.removeFromParent();
      for (const { mesh, original, glowing } of bulbs) {
        mesh.material = original;
        for (const material of glowing) material.dispose();
      }
    },
  };
}

// Sample only the opening segment; the source clip also holds, then closes the lights.
export function createPopupHeadlights(
  model: Object3D,
  clips: AnimationClip[],
  settings: CarSpec['popupHeadlights'],
) {
  if (!settings) return null;
  const clip = clips.find(({ name }) => name === settings.clip);
  if (!clip) return null;
  const illumination = illuminateLenses(model, settings);
  const mixer = new AnimationMixer(model);
  const action = mixer.clipAction(clip);
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  let position = 1;
  let target = 1;
  const sample = () => {
    const eased = position * position * (3 - 2 * position);
    mixer.setTime(settings.closedTime + (settings.openTime - settings.closedTime) * eased);
    illumination.setBrightness(MathUtils.smoothstep(eased, 0.4, 1));
  };
  sample();
  return {
    setRaised(raised: boolean, immediate = false) {
      target = raised ? 1 : 0;
      if (immediate && position !== target) {
        position = target;
        sample();
      }
    },
    update(dt: number) {
      if (position === target) return;
      const step = Math.min(dt, 0.1) / 0.7;
      position += Math.sign(target - position) * Math.min(Math.abs(target - position), step);
      sample();
    },
    dispose() {
      illumination.dispose();
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    },
  };
}
