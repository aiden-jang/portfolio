import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { THEMES } from '../config';
import { smoothColorHex, smoothTowards } from '../math';
import { useAppStore } from '../store';

const TRANSITION_RATE = 2.5;

/** Ambient + hemisphere + 3-point key/fill/rim. Eased toward the active
 *  theme each frame so toggles fade smoothly instead of snapping. */
export function Lights() {
  const ambient = useRef<THREE.AmbientLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const key = useRef<THREE.DirectionalLight>(null!);
  const fill = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);

  // Current (interpolated) snapshot, mutated in place by useFrame.
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
    key.current.intensity = c.key.intensity;

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
