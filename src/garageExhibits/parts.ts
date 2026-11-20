import { Box3, Group, MathUtils, Vector3, type Object3D } from 'three';
import { exhibitWheel } from './geometry';

export function prepareBrakePivot(model: Object3D) {
  const suspension = model.getObjectByName('Wheel-Front_n3d_2');
  const tire = model.getObjectByName('Tire-LF_n3d_14');
  if (!suspension || !tire) return;
  const axle = new Box3().setFromObject(tire, true).getCenter(new Vector3());
  const turn = new Group();
  turn.position.copy(model.worldToLocal(axle.clone()));
  model.add(turn);
  turn.attach(suspension);
  turn.attach(tire);
  return (amount: number, dt: number, reduced: boolean) => {
    const yaw = -0.47 * amount;
    turn.rotation.y = reduced ? yaw : MathUtils.lerp(turn.rotation.y, yaw, Math.min(1, dt * 9));
    exhibitWheel.point = axle;
  };
}
