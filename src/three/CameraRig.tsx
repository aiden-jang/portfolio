import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { KEYFRAMES } from '../config';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { clamp } from '../math';
import { useOrbitGesture, type RigState } from './useOrbitGesture';
import {
  blendIntro,
  easeOutCubic,
  floorElevation,
  framingDistanceMultiplier,
  FRAME_BASE_ASPECT,
  interpolateKeyframe,
  MAX_ELEVATION,
  orbitPosition,
} from './cameraPose';
import { useAppStore } from '../store';
import type { Keyframe } from '../types';

const INTRO_DURATION = 2.0;

const DRAG_DECAY_RATE = 1.5;
const DRAG_DECAY_FRACTION = 0.6;
const IDLE_SPIN_RATE = 0.18;
const REV_DECAY_RATE = 1.8;
const REV_RUMBLE_FREQ_HZ = 90 / (2 * Math.PI);
const REV_SHAKE_AMP = 0.12;

const SECTION_PUNCH_DURATION = 0.55; // seconds
// Left at 0 on purpose. Section changes fire continuously as you scroll, so the punch read as a
// shake rather than a reaction.
const SECTION_PUNCH_FOV_DELTA = 0; // degrees added at peak

// `?clean` freezes the camera for OG screenshots. It needs its own azimuth because KEYFRAMES[0]
// sits near the nose, and the shot wants more flank.
const isCleanMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');
const CLEAN_AZIMUTH = 0.65;

type Props = {
  getScrollT: () => number;
};

export function CameraRig({ getScrollT }: Props) {
  const { camera } = useThree();
  const cameraResetVersion = useAppStore((s) => s.cameraResetVersion);

  const state = useRef<RigState>({
    dragAzimuth: 0,
    dragElevation: 0,
    isDown: false,
    isTouch: false,
    dragMoved: false,
    orbitHold: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    idleSpin: 0,
    scrollActiveTimer: 0,
    introT: 0,
  });
  const baseKf = useRef<Keyframe>({ ...KEYFRAMES[0] });
  const baseFov = useRef(camera instanceof THREE.PerspectiveCamera ? camera.fov : 35);
  const sectionPunchTimer = useRef(0);
  const lastSection = useRef<number | null>(null);

  useOrbitGesture(state);

  useEffect(() => {
    const s = state.current;
    s.dragAzimuth = 0;
    s.dragElevation = 0;
    s.idleSpin = 0;
    s.dragMoved = false;
    document.body.classList.remove('orbiting');
  }, [cameraResetVersion]);

  useEffect(() => {
    const unsub = useAppStore.subscribe((s) => {
      if (lastSection.current === null) {
        lastSection.current = s.sectionIndex;
        return;
      }
      if (s.sectionIndex !== lastSection.current) {
        lastSection.current = s.sectionIndex;
        sectionPunchTimer.current = SECTION_PUNCH_DURATION;
      }
    });
    return unsub;
  }, []);

  useFrame((three, dt) => {
    const s = state.current;
    const refs = useAppStore.getState().refs;
    const reduced = prefersReducedMotion();

    s.scrollActiveTimer = Math.max(0, s.scrollActiveTimer - dt);
    if (s.scrollActiveTimer === 0 && !s.isDown && !isCleanMode && !reduced) {
      s.idleSpin += dt * IDLE_SPIN_RATE;
    }
    if (!s.isDown) {
      const k = Math.min(1, dt * DRAG_DECAY_RATE);
      s.dragAzimuth *= 1 - k * DRAG_DECAY_FRACTION;
      s.dragElevation *= 1 - k * DRAG_DECAY_FRACTION;
    }

    const kf = baseKf.current;
    interpolateKeyframe(KEYFRAMES, getScrollT(), kf);

    const az = isCleanMode ? CLEAN_AZIMUTH : kf.azimuth + s.dragAzimuth + s.idleSpin;
    const aspect = three.size.height > 0 ? three.size.width / three.size.height : FRAME_BASE_ASPECT;
    const dist = kf.distance * framingDistanceMultiplier(aspect);
    const tgtY = kf.targetY;

    const el = clamp(kf.elevation + s.dragElevation, floorElevation(dist, tgtY), MAX_ELEVATION);
    if (s.isDown) s.dragElevation = el - kf.elevation;

    let pose = orbitPosition(az, el, dist, tgtY);

    if (refs.introArmed && s.introT < 1 && !isCleanMode && !reduced) {
      s.introT = Math.min(1, s.introT + dt / INTRO_DURATION);
      pose = blendIntro(pose, az, dist, tgtY, easeOutCubic(s.introT));
    }

    camera.position.set(pose.x, pose.y, pose.z);
    camera.lookAt(0, tgtY, 0);

    if (camera instanceof THREE.PerspectiveCamera) {
      if (sectionPunchTimer.current > 0) {
        sectionPunchTimer.current = Math.max(0, sectionPunchTimer.current - dt);
      }
      if (sectionPunchTimer.current > 0 && !reduced) {
        const elapsed = 1 - sectionPunchTimer.current / SECTION_PUNCH_DURATION;
        const punch = Math.sin(elapsed * Math.PI); // 0 → 1 → 0
        camera.fov = baseFov.current + punch * SECTION_PUNCH_FOV_DELTA;
        camera.updateProjectionMatrix();
      } else if (camera.fov !== baseFov.current) {
        camera.fov = baseFov.current;
        camera.updateProjectionMatrix();
      }
    }

    // Two blocks: the counter has to decay under reduced motion too, it just skips the shake.
    if (refs.revT > 0) {
      refs.revT = Math.max(0, refs.revT - dt * REV_DECAY_RATE);
    }
    if (refs.revT > 0 && !reduced) {
      const time = three.clock.elapsedTime;
      const rumble =
        (Math.sin(time * REV_RUMBLE_FREQ_HZ * 2 * Math.PI) * 0.6 + (Math.random() - 0.5) * 0.4) *
        refs.revT *
        REV_SHAKE_AMP;
      camera.position.x += rumble;
      camera.position.y += Math.abs(rumble) * 0.4;
    }
  });

  return null;
}
