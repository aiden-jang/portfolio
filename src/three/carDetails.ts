import { Quaternion, Vector3, type Object3D } from 'three';
import type { CarSpec } from '../types';

export function createDRS(model: Object3D, settings: CarSpec['drs']) {
  if (!settings) return null;
  const joint = model.getObjectByName(settings.node);
  if (!joint) return null;
  const resting = joint.quaternion.clone();
  const rotation = new Quaternion();
  const axis = new Vector3(1, 0, 0);
  let position = 0;
  let target = 0;
  const sample = () => {
    const eased = position * position * (3 - 2 * position);
    rotation.setFromAxisAngle(axis, settings.openAngle * eased);
    joint.quaternion.copy(resting).multiply(rotation);
  };
  return {
    setOpen(open: boolean, immediate = false) {
      target = open ? 1 : 0;
      if (immediate) {
        position = target;
        sample();
      }
    },
    update(dt: number) {
      if (position === target) return;
      const step = Math.min(dt, 0.1) / 0.5;
      position += Math.sign(target - position) * Math.min(Math.abs(target - position), step);
      sample();
    },
    dispose() {
      joint.quaternion.copy(resting);
    },
  };
}
