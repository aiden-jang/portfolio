import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { THEMES } from '../config';
import { smoothColorHex, smoothTowards } from '../math';
import { useAppStore } from '../store';

const TRANSITION_RATE = 2.5;

const SUN_RADIUS = 12;
const SUN_Z = 5;
// Never fully dark, or the car loses all specular shape once the sun is down.
const NIGHT_KEY_FLOOR = 0.2;

function computeSunPosition(date: Date) {
  const hours = date.getHours() + date.getMinutes() / 60;
  // Maps the clock onto [-π/2, 3π/2]: 6am is 0 at the east horizon, noon π/2 overhead,
  // 6pm π in the west, midnight -π/2 below.
  const angle = (hours - 6) * (Math.PI / 12);
  const x = Math.cos(angle) * SUN_RADIUS;
  const y = Math.sin(angle) * SUN_RADIUS;
  const daylight = Math.max(0, Math.sin(angle));
  return { x, y, z: SUN_Z, daylight };
}

// Eased toward the active theme every frame, so a toggle fades instead of snapping.
export function Lights() {
  const ambient = useRef<THREE.AmbientLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const key = useRef<THREE.DirectionalLight>(null!);
  const fill = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);

  // Mutated in place each frame, so it deliberately holds no React state.
  const current = useRef<typeof THEMES.dusk>(JSON.parse(JSON.stringify(THEMES.dusk)));

  useFrame((_state, dt) => {
    const target = THEMES[useAppStore.getState().themeName];
    const k = Math.min(1, dt * TRANSITION_RATE);
    const c = current.current;

    c.ambient.color = smoothColorHex(c.ambient.color, target.ambient.color, k);
    c.ambient.intensity = smoothTowards(c.ambient.intensity, target.ambient.intensity, k);
    ambient.current.color.setHex(c.ambient.color);
    ambient.current.intensity = c.ambient.intensity;

    c.hemi.sky = smoothColorHex(c.hemi.sky, target.hemi.sky, k);
    c.hemi.ground = smoothColorHex(c.hemi.ground, target.hemi.ground, k);
    c.hemi.intensity = smoothTowards(c.hemi.intensity, target.hemi.intensity, k);
    hemi.current.color.setHex(c.hemi.sky);
    hemi.current.groundColor.setHex(c.hemi.ground);
    hemi.current.intensity = c.hemi.intensity;

    c.key.color = smoothColorHex(c.key.color, target.key.color, k);
    c.key.intensity = smoothTowards(c.key.intensity, target.key.intensity, k);
    key.current.color.setHex(c.key.color);

    const sun = computeSunPosition(new Date());
    key.current.position.set(sun.x, Math.max(sun.y, 0.5), sun.z);
    const sunFactor = NIGHT_KEY_FLOOR + (1 - NIGHT_KEY_FLOOR) * sun.daylight;
    key.current.intensity = c.key.intensity * sunFactor;

    c.fill.color = smoothColorHex(c.fill.color, target.fill.color, k);
    c.fill.intensity = smoothTowards(c.fill.intensity, target.fill.intensity, k);
    fill.current.color.setHex(c.fill.color);
    fill.current.intensity = c.fill.intensity;

    c.rim.color = smoothColorHex(c.rim.color, target.rim.color, k);
    c.rim.intensity = smoothTowards(c.rim.intensity, target.rim.intensity, k);
    rim.current.color.setHex(c.rim.color);
    rim.current.intensity = c.rim.intensity;
  });

  const init = current.current;
  return (
    <>
      <ambientLight ref={ambient} color={init.ambient.color} intensity={init.ambient.intensity} />
      <hemisphereLight
        ref={hemi}
        color={init.hemi.sky}
        groundColor={init.hemi.ground}
        intensity={init.hemi.intensity}
      />
      <directionalLight
        ref={key}
        position={[4.5, 7, 5]}
        color={init.key.color}
        intensity={init.key.intensity}
      />
      <directionalLight
        ref={fill}
        position={[-5, 4, -2]}
        color={init.fill.color}
        intensity={init.fill.intensity}
      />
      <directionalLight
        ref={rim}
        position={[-3, 4.5, -6]}
        color={init.rim.color}
        intensity={init.rim.intensity}
      />
    </>
  );
}
