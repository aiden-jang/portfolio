import { motionState } from './studioEntrance';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CARS, THEMES } from '../config';
import { smoothTowards } from '../math';
import { smoothColorHex } from './colorMath';
import { useAppStore } from '../store';
import { useLineup } from '../lineup/state';
import { F40_PAINT, openingStudioWeight } from './openingStudio';

import { isOpeningStudio } from '../lighting';
import { createStudioEnvironment } from './studio/environment';

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

export function Lights() {
  const { gl, scene } = useThree();
  const studioMap = useRef<THREE.WebGLRenderTarget | null>(null);
  const defaultMap = useRef<THREE.Texture | null>(null);
  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(gl);
    const environment = generator.fromScene(room, 0.04);
    defaultMap.current = environment.texture;

    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.22;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      environment.dispose();
      studioMap.current?.dispose();
      studioMap.current = null;
    };
  }, [gl, scene]);
  const ambient = useRef<THREE.AmbientLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const key = useRef<THREE.DirectionalLight>(null!);
  const fill = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);
  const studioWeight = useRef(openingStudioWeight());

  // Mutated in place each frame, so it deliberately holds no React state.
  const current = useRef<typeof THEMES.dusk>(JSON.parse(JSON.stringify(THEMES.dusk)));

  useFrame((_state, dt) => {
    const state = useAppStore.getState();
    const lineup = useLineup.getState().active;
    const studio = lineup || isOpeningStudio(state);
    if (studio && !studioMap.current) {
      const generator = new THREE.PMREMGenerator(gl);
      studioMap.current = createStudioEnvironment(generator);
      generator.dispose();
    }
    scene.environment = studio ? (studioMap.current?.texture ?? null) : defaultMap.current;
    const lighting = studio ? 'studio' : state.themeName === 'studio' ? 'dusk' : state.themeName;
    const target = THEMES[lighting];
    const progress = lineup ? 1 : motionState.progress;
    const sculpted = ['mercedes-benz-w198-300-sl.glb', 'red-bull-rb16b.glb'].includes(
      CARS[state.carIndex].file,
    );
    const duskSeparation = sculpted && lighting === 'dusk';
    const weight = (studioWeight.current = smoothTowards(
      studioWeight.current,
      lineup ? 1 : openingStudioWeight(),
      Math.min(1, dt * 5),
    ));
    const paint = state.refs.bodyMaterial;
    if (
      state.carIndex === 0 &&
      paint instanceof THREE.MeshPhysicalMaterial &&
      paint.name === 'Metallic'
    ) {
      paint.roughness = studio ? 0.222 : F40_PAINT.roughness + 0.105 * weight;
      paint.clearcoatRoughness = studio ? 0.105 : F40_PAINT.coatRoughness + 0.095 * weight;
      paint.clearcoat = studio ? 0.91 : F40_PAINT.coat - 0.12 * weight;
    }
    scene.environmentIntensity = smoothTowards(
      scene.environmentIntensity,
      studio ? 0.48 : sculpted ? 0.29 : 0.22 - 0.048 * weight,
      Math.min(1, dt * TRANSITION_RATE),
    );
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
    if (studio) key.current.position.set(4.7, 2.9, 0.8);
    else key.current.position.set(sun.x, Math.max(sun.y, 0.5), sun.z);
    const sunFactor = NIGHT_KEY_FLOOR + (1 - NIGHT_KEY_FLOOR) * sun.daylight;
    key.current.intensity =
      (studio ? 0.13 : c.key.intensity) *
      (studio ? 1 : sunFactor) *
      (1 - 0.25 * weight) *
      (0.45 + 0.55 * (1 - Math.pow(1 - progress, 3)));

    c.fill.color = smoothColorHex(c.fill.color, target.fill.color, k);
    c.fill.intensity = smoothTowards(
      c.fill.intensity,
      duskSeparation ? 0.92 : target.fill.intensity,
      k,
    );
    fill.current.color.setHex(c.fill.color);
    fill.current.intensity = c.fill.intensity * (1 - 0.13 * weight) * (0.7 + 0.3 * progress);

    c.rim.color = smoothColorHex(c.rim.color, target.rim.color, k);
    c.rim.intensity = smoothTowards(
      c.rim.intensity,
      studio ? 0.81 : duskSeparation ? 1.08 : target.rim.intensity,
      k,
    );
    rim.current.color.setHex(c.rim.color);
    if (studio) rim.current.position.set(-4.25, 3.5, 6.8);
    else rim.current.position.set(-3, 4.5, -6);
    rim.current.intensity = c.rim.intensity * (1 - 0.08 * weight) * (0.7 + 0.3 * progress);
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
