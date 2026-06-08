import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { KEYFRAMES } from '../config';
import { clamp, lerp, lerpAngle } from '../math';
import { useAppStore } from '../store';
import type { Keyframe } from '../types';

const INTRO_DURATION = 2.0;
const INTRO_WIDE_DIST_MUL = 2.6;
const INTRO_WIDE_ELEVATION = 0.65;

const MIN_CAM_Y = 0.25;
const MAX_ELEVATION = 1.2;
const MIN_ELEVATION_FREE = -0.4;
const MAX_ELEVATION_FREE = 0.9;
const DRAG_YAW_SENSITIVITY = 0.01;
const DRAG_PITCH_SENSITIVITY = 0.006;
const DRAG_DECAY_RATE = 1.5;
const DRAG_DECAY_FRACTION = 0.6;
const IDLE_SPIN_RATE = 0.18;
const SCROLL_PAUSE_DURATION = 0.2;
const TAP_THRESHOLD_PX = 3;
const REV_DECAY_RATE = 1.8;
const REV_RUMBLE_FREQ_HZ = 90 / (2 * Math.PI);
const REV_SHAKE_AMP = 0.12;

const NON_DRAGGABLE_SELECTOR = 'a, button, .panel, #nav, #theme-toggle';

type RigState = {
  dragAzimuth: number;
  dragElevation: number;
  isDown: boolean;
  dragMoved: boolean;
  lastX: number;
  lastY: number;
  idleSpin: number;
  scrollActiveTimer: number;
  introT: number;
};

type Props = {
  getScrollT: () => number;
};

/** Composes scroll-driven keyframe interpolation, pointer drag, idle auto-spin,
 *  the cinematic intro tween, the floor clamp, and the rev shake into a single
 *  per-frame camera update. Pointer events route through `window` so overlay
 *  stacking doesn't matter; clicks on UI elements are ignored. */
export function CameraRig({ getScrollT }: Props) {
  const { camera } = useThree();
  const triggerRev = useAppStore((s) => s.triggerRev);

  const state = useRef<RigState>({
    dragAzimuth: 0,
    dragElevation: 0,
    isDown: false,
    dragMoved: false,
    lastX: 0,
    lastY: 0,
    idleSpin: 0,
    scrollActiveTimer: 0,
    introT: 0,
  });
  const baseKf = useRef<Keyframe>({ ...KEYFRAMES[0] });

  useEffect(() => {
    const isNonDraggable = (target: EventTarget | null) =>
      !!(target as HTMLElement | null)?.closest?.(NON_DRAGGABLE_SELECTOR);

    const onPointerDown = (e: PointerEvent) => {
      if (isNonDraggable(e.target)) return;
      const s = state.current;
      s.isDown = true;
      s.dragMoved = false;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      const s = state.current;
      if (!s.isDown) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > TAP_THRESHOLD_PX) s.dragMoved = true;
      s.dragAzimuth += dx * DRAG_YAW_SENSITIVITY;
      s.dragElevation = clamp(
        s.dragElevation - dy * DRAG_PITCH_SENSITIVITY,
        MIN_ELEVATION_FREE,
        MAX_ELEVATION_FREE,
      );
    };
    const onPointerUp = () => {
      const s = state.current;
      if (!s.isDown) return;
      if (!s.dragMoved) triggerRev();
      s.idleSpin += s.dragAzimuth;
      s.dragAzimuth = 0;
      s.isDown = false;
    };
    const onPointerCancel = () => {
      state.current.isDown = false;
    };
    const onScroll = () => {
      state.current.scrollActiveTimer = SCROLL_PAUSE_DURATION;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('scroll', onScroll);
    };
  }, [triggerRev]);

  useFrame((three, dt) => {
    const s = state.current;
    const refs = useAppStore.getState().refs;

    // Idle spin advances only when scroll has settled AND not dragging.
    s.scrollActiveTimer = Math.max(0, s.scrollActiveTimer - dt);
    if (s.scrollActiveTimer === 0 && !s.isDown) s.idleSpin += dt * IDLE_SPIN_RATE;
    if (!s.isDown) {
      const k = Math.min(1, dt * DRAG_DECAY_RATE);
      s.dragAzimuth *= 1 - k * DRAG_DECAY_FRACTION;
      s.dragElevation *= 1 - k * DRAG_DECAY_FRACTION;
    }

    // Base keyframe interpolation by scroll position.
    const tScroll = getScrollT() * (KEYFRAMES.length - 1);
    const i = Math.floor(tScroll);
    const f = tScroll - i;
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
    const kf = baseKf.current;
    kf.azimuth = lerpAngle(a.azimuth, b.azimuth, f);
    kf.elevation = lerp(a.elevation, b.elevation, f);
    kf.distance = lerp(a.distance, b.distance, f);
    kf.targetY = lerp(a.targetY, b.targetY, f);

    const az = kf.azimuth + s.dragAzimuth + s.idleSpin;
    const dist = kf.distance;
    const tgtY = kf.targetY;

    // Floor clamp: ensure camera y stays above MIN_CAM_Y.
    const minSinEl = clamp((MIN_CAM_Y - tgtY) / dist, -1, 1);
    const minEl = Math.asin(minSinEl);
    const el = clamp(kf.elevation + s.dragElevation, minEl, MAX_ELEVATION);
    if (s.isDown) s.dragElevation = el - kf.elevation;

    let x = Math.sin(az) * Math.cos(el) * dist;
    let y = Math.sin(el) * dist + tgtY;
    let z = Math.cos(az) * Math.cos(el) * dist;

    // Cinematic intro tween.
    if (refs.introArmed && s.introT < 1) {
      s.introT = Math.min(1, s.introT + dt / INTRO_DURATION);
      const t = 1 - Math.pow(1 - s.introT, 3);
      const wideDist = dist * INTRO_WIDE_DIST_MUL;
      const cosWE = Math.cos(INTRO_WIDE_ELEVATION);
      const wx = Math.sin(az) * cosWE * wideDist;
      const wy = Math.sin(INTRO_WIDE_ELEVATION) * wideDist + tgtY;
      const wz = Math.cos(az) * cosWE * wideDist;
      x = wx + (x - wx) * t;
      y = wy + (y - wy) * t;
      z = wz + (z - wz) * t;
    }

    camera.position.set(x, y, z);
    camera.lookAt(0, tgtY, 0);

    // Rev envelope: shake the camera + bleed rev intensity.
    if (refs.revT > 0) {
      refs.revT = Math.max(0, refs.revT - dt * REV_DECAY_RATE);
      const time = three.clock.elapsedTime;
      const rumble =
        (Math.sin(time * REV_RUMBLE_FREQ_HZ * 2 * Math.PI) * 0.6 +
          (Math.random() - 0.5) * 0.4) *
        refs.revT *
        REV_SHAKE_AMP;
      camera.position.x += rumble;
      camera.position.y += Math.abs(rumble) * 0.4;
    }
  });

  return null;
}
