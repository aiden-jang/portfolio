import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Box3, MathUtils, PerspectiveCamera, Vector3, type Object3D } from 'three';
import { useAppStore } from '../store';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { KEYFRAMES, CARS } from '../config';
import { activeOrbit, photoRatio, useGarageStudio } from './state';

const pairBounds = new Box3(new Vector3(-2.75, 0, -4.18), new Vector3(2.53, 1.14, 3.57));
const fallback = new Box3(new Vector3(-1, 0, -2.25), new Vector3(1, 1.2, 2.25));
const modelBoxes = new WeakMap<Object3D, Box3>();
const parts = new WeakMap<Object3D, Box3>();
const center = new Vector3();

export function StudioRig() {
  const frame = useRef({
    ready: false,
    yaw: 0,
    lift: 0,
    radius: 10,
    fov: 36,
    target: new Vector3(),
  });
  useFrame(({ camera, size }, dt) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const state = useGarageStudio.getState();
    const { chapter, proposed, photo } = state;
    const mobile = size.width < 768;
    const aspect = size.width / Math.max(1, size.height);
    const app = useAppStore.getState();
    const model = app.refs.carModel;
    const id = app.carIndex;
    const pair = chapter === 'lineup';
    const orbit = activeOrbit(state);
    const { yaw, pitch, zoom } = orbit;
    const detail = chapter === 'detail';
    const f1 = id === 15 || id === 16;
    const detailPart = detail && proposed;
    const bounds = pair ? pairBounds : localBounds(model);
    const focusBounds = detailPart ? detailBounds(model, id, bounds) : bounds;
    const at = focusBounds.getCenter(center);
    const groundLift = f1 ? (mobile ? 0.78 : 0.7) : mobile ? 0.69 : 0.62;
    const current = frame.current;
    const short = MathUtils.clamp((520 - size.height) / 190, 0, 1);
    const narrow = MathUtils.clamp((390 - size.width) / 70, 0, 1);
    const verticalBias = detailPart
      ? f1
        ? 0.16
        : 0.085
      : chapter === 'walk' && proposed
        ? 0.012
        : 0.19;
    const elevation = pair
      ? proposed
        ? 1.49
        : mobile
          ? 0.39
          : 0.24
      : MathUtils.clamp(verticalBias + pitch, 0.005, 0.6);
    const fov = pair
      ? proposed
        ? mobile
          ? 69
          : 52
        : mobile
          ? 49
          : 34
      : detailPart
        ? mobile
          ? 37
          : 32
        : chapter === 'walk' && proposed
          ? mobile
            ? 43
            : 34
          : mobile
            ? 34
            : 32;
    if (!pair && !detailPart)
      at.setX(0)
        .setZ(0)
        .setY(chapter === 'walk' && proposed ? groundLift / 2 + 0.08 : KEYFRAMES[0].targetY);
    if (pair) at.set(0, 0.28, -0.22);
    if (short > 0) at.y -= short * 0.26;
    const crop = photo ? photoRatio(photo) : aspect;
    const base = pair
      ? proposed
        ? 7.5
        : 10.6
      : detailPart
        ? f1
          ? mobile
            ? 3.34
            : 3.05
          : mobile
            ? 3.85
            : 3.55
        : chapter === 'walk' && proposed
          ? mobile
            ? 7.75
            : 6.55
          : mobile
            ? 8.92
            : 8.05;
    const aim = pair && proposed ? yaw + (mobile ? 0.47 : 1.03) : yaw;
    const overhead = pair && proposed;
    if (overhead && !photo && !mobile) {
      const dockClearance = 0.42 * (1 - short);
      at.x += Math.sin(aim) * dockClearance;
      at.z += Math.cos(aim) * dockClearance;
    }
    const fit = fitDistance(
      focusBounds,
      at,
      aim,
      elevation,
      fov,
      aspect,
      crop,
      overhead ? 0.82 : 0.91,
    );
    const clearance =
      overhead && !photo ? 1 + narrow * 0.16 + short * 0.41 + (mobile ? 0 : 0.28 * (1 - short)) : 1;
    const radius = Math.max(base * zoom * (1 + short * 0.18), fit) * clearance;
    const realLift =
      chapter === 'walk' && proposed
        ? groundLift + Math.max(0, pitch) * 2.3
        : at.y + radius * Math.sin(elevation);
    const targetLift = realLift - at.y;
    const k = !current.ready || prefersReducedMotion() ? 1 : 1 - Math.exp(-Math.min(dt, 0.06) * 11);
    current.ready = true;
    current.yaw += Math.atan2(Math.sin(aim - current.yaw), Math.cos(aim - current.yaw)) * k;
    orbit.shownYaw = current.yaw - (pair && proposed ? (mobile ? 0.47 : 1.03) : 0);
    current.lift = MathUtils.lerp(current.lift, targetLift, k);
    current.radius = MathUtils.lerp(current.radius, radius, k);
    current.fov = MathUtils.lerp(current.fov, fov, k);
    current.target.lerp(at, k);

    const horizontal = Math.sqrt(Math.max(0.12, current.radius ** 2 - current.lift ** 2));
    camera.position.set(
      current.target.x + Math.sin(current.yaw) * horizontal,
      current.target.y + current.lift,
      current.target.z + Math.cos(current.yaw) * horizontal,
    );
    if (Math.abs(camera.fov - current.fov) > 0.001) {
      camera.fov = current.fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(current.target);
  }, 0.5);
  return null;
}

function localBounds(model: Object3D | null) {
  if (!model) return fallback;
  if (!modelBoxes.has(model)) modelBoxes.set(model, new Box3().setFromObject(model, true));
  return modelBoxes.get(model) ?? fallback;
}

function detailBounds(model: Object3D | null, id: number, bounds: Box3) {
  if (id === 10)
    return new Box3(
      new Vector3(-0.89, 0.24, bounds.max.z - 0.8),
      new Vector3(0.89, 0.92, bounds.max.z + 0.1),
    );
  if (model && !parts.has(model)) {
    const wing = CARS[id].drs?.node;
    const node = wing ? model.getObjectByName(wing) : null;
    const measured = node ? new Box3().setFromObject(node, true) : null;
    if (measured && !measured.isEmpty()) {
      measured.expandByVector(new Vector3(0.23, 0.22, 0.24));
      parts.set(model, measured);
    }
  }
  return (
    (model && parts.get(model)) ||
    new Box3(new Vector3(-0.8, 0.58, bounds.min.z), new Vector3(0.8, 1.22, bounds.min.z + 0.65))
  );
}

function fitDistance(
  bounds: Box3,
  target: Vector3,
  yaw: number,
  pitch: number,
  fov: number,
  aspect: number,
  crop: number,
  margin: number,
) {
  const t = Math.tan(MathUtils.degToRad(fov / 2));
  const h = t * Math.min(aspect, crop) * margin;
  const v = t * Math.min(1, aspect / crop) * margin;
  const sx = Math.sin(yaw),
    cx = Math.cos(yaw),
    sy = Math.sin(pitch),
    cy = Math.cos(pitch);
  let result = 0;
  for (const x of [bounds.min.x - target.x, bounds.max.x - target.x]) {
    for (const y of [bounds.min.y - target.y, bounds.max.y - target.y]) {
      for (const z of [bounds.min.z - target.z, bounds.max.z - target.z]) {
        const along = x * sx + z * cx;
        const forward = along * cy + y * sy;
        const across = x * cx - z * sx;
        const up = y * cy - along * sy;
        result = Math.max(result, forward + Math.abs(across) / h, forward + Math.abs(up) / v);
      }
    }
  }
  return result;
}
