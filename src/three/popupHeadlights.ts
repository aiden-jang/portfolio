import { AnimationMixer, LoopOnce, type AnimationClip, type Object3D } from 'three';
import type { CarSpec } from '../types';

// Sample only the opening segment; the source clip also holds, then closes the lights.
export function createPopupHeadlights(
  model: Object3D,
  clips: AnimationClip[],
  settings: CarSpec['popupHeadlights'],
) {
  if (!settings) return null;
  const clip = clips.find(({ name }) => name === settings.clip);
  if (!clip) return null;
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
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    },
  };
}
