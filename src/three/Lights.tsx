import { computeSunPosition } from './studio/sunPosition';
import { applyStudioAccent, updateDetailAccent } from './studio/detailAccent';
import { inStudioDusk, useGarageExhibit } from '../garageExhibits/state';
import { useGarageStudy } from '../garageStudy/state';
import { motionState } from './studioEntrance';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CARS, THEMES } from '../config';
import { smoothTowards } from '../math';
import { smoothColorHex } from './colorMath';
import { useAppStore } from '../store';
import { activeOrbit, inBlackout, useGarageStudio } from '../garageStudio/state';
import { useLineup } from '../lineup/state';
import { F40_PAINT, openingStudioWeight } from './openingStudio';
import { isOpeningStudio } from '../lighting';
import { createStudioEnvironment } from './studio/environment';

const TRANSITION_RATE = 2.5;

// Never fully dark, or the car loses all specular shape once the sun is down.
const NIGHT_KEY_FLOOR = 0.2;

export function Lights() {
  const { gl, scene } = useThree();
  const studioMap = useRef<THREE.WebGLRenderTarget | null>(null);
  const duskMap = useRef<THREE.WebGLRenderTarget | null>(null);
  const duskMix = useRef(0);
  const opticsMap = useRef<THREE.WebGLRenderTarget | null>(null);
  const blackoutMap = useRef<THREE.WebGLRenderTarget | null>(null);
  const dim = useRef(0);
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
      duskMap.current?.dispose();
      duskMap.current = null;
      opticsMap.current?.dispose();
      opticsMap.current = null;
      blackoutMap.current?.dispose();
      blackoutMap.current = null;
    };
  }, [gl, scene]);
  const ambient = useRef<THREE.AmbientLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const key = useRef<THREE.DirectionalLight>(null!);
  const fill = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);
  const cabin = useRef<THREE.PointLight>(null!);
  const detailAccent = useRef<THREE.PointLight>(null!);
  const studioWeight = useRef(openingStudioWeight());

  // Mutated in place each frame, so it deliberately holds no React state.
  const current = useRef<typeof THEMES.dusk>(JSON.parse(JSON.stringify(THEMES.dusk)));

  useFrame((_state, dt) => {
    const state = useAppStore.getState();
    const lineup = useLineup.getState().active;
    const preview = useGarageStudio.getState();
    const dark = inBlackout();
    const exhibit = useGarageExhibit.getState();
    const dusk = inStudioDusk(preview);
    duskMix.current += (Number(dusk) - duskMix.current) * Math.min(dt * 11, 1);
    if (dusk && !duskMap.current) {
      const generator = new THREE.PMREMGenerator(gl);
      duskMap.current = createStudioEnvironment(generator, false, false, true);
      generator.dispose();
    }
    const cabinTarget =
      preview.active &&
      preview.chapter === 'walk' &&
      state.carIndex === 10 &&
      exhibit.exhibit === 'cockpit' &&
      exhibit.after
        ? 2.3
        : 0;
    cabin.current.intensity = smoothTowards(
      cabin.current.intensity,
      cabinTarget,
      Math.min(1, dt * 8),
    );
    cabin.current.visible = cabin.current.intensity > 0.002;
    updateDetailAccent(
      detailAccent.current,
      preview.active && !dark && !dusk,
      exhibit.exhibit,
      exhibit.shot,
      state.headlightsRaised,
      state.carIndex === 8 && preview.chapter === 'walk'
        ? THREE.MathUtils.smoothstep(-Math.cos(activeOrbit(preview).yaw), 0.28, 0.86)
        : 0,
      dt,
    );
    const studio = lineup || preview.active || isOpeningStudio(state);
    if (dark && !blackoutMap.current) {
      const generator = new THREE.PMREMGenerator(gl);
      blackoutMap.current = createStudioEnvironment(generator, true);
      generator.dispose();
    }
    dim.current = THREE.MathUtils.lerp(dim.current, Number(dark), Math.min(1, dt * 12));
    const amount = dim.current;
    if (studio && !studioMap.current) {
      const generator = new THREE.PMREMGenerator(gl);
      studioMap.current = createStudioEnvironment(generator);
      generator.dispose();
    }
    const optics =
      preview.active &&
      !dark &&
      (!preview.study || preview.study === 'finished') &&
      useGarageStudy.getState().refined;
    if (optics && !opticsMap.current) {
      const generator = new THREE.PMREMGenerator(gl);
      opticsMap.current = createStudioEnvironment(generator, false, true);
      generator.dispose();
    }
    scene.environment = studio
      ? ((dusk
          ? duskMap.current?.texture
          : dark
            ? blackoutMap.current?.texture
            : optics
              ? opticsMap.current?.texture
              : studioMap.current?.texture) ?? null)
      : defaultMap.current;
    const lighting = studio ? 'studio' : state.themeName === 'studio' ? 'dusk' : state.themeName;
    const target = THEMES[lighting];
    const progress = lineup || preview.active ? 1 : motionState.progress;
    const sculpted = ['mercedes-benz-w198-300-sl.glb', 'red-bull-rb16b.glb'].includes(
      CARS[state.carIndex].file,
    );
    const duskSeparation = sculpted && lighting === 'dusk';
    const weight = (studioWeight.current = smoothTowards(
      studioWeight.current,
      lineup || preview.active ? 1 : openingStudioWeight(),
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
    ambient.current.intensity = c.ambient.intensity * (1 - 0.56 * amount);

    c.hemi.sky = smoothColorHex(c.hemi.sky, target.hemi.sky, k);
    c.hemi.ground = smoothColorHex(c.hemi.ground, target.hemi.ground, k);
    c.hemi.intensity = smoothTowards(c.hemi.intensity, target.hemi.intensity, k);
    hemi.current.color.setHex(c.hemi.sky);
    hemi.current.groundColor.setHex(c.hemi.ground);
    hemi.current.intensity = c.hemi.intensity * (1 - 0.48 * amount);

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
    applyStudioAccent(
      preview.active && !lineup && state.carIndex === 14 && !dark && !dusk,
      duskMix.current,
      key.current,
      fill.current,
      rim.current,
      ambient.current,
      hemi.current,
    );
    const spec = CARS[state.carIndex];
    const darkPaint = state.activeBodyColor === '#3f464e' || /(?:gtr|gt-r|e30)/.test(spec.file);
    const brightLivery = /(?:corvette|gt3-rs|296-gt3)/.test(spec.file);
    if (
      studio &&
      preview.active &&
      preview.chapter === 'walk' &&
      /(?:911-turbo|e30-m3|a80-supra)/.test(spec.file)
    ) {
      fill.current.intensity += 0.12;
      rim.current.position.set(-4.6, 2.35, 5.6);
      rim.current.intensity += 0.19;
    }
    fill.current.intensity *= 1 - (darkPaint ? 0.53 : 0.78) * amount;
    key.current.intensity *= 1 - 0.65 * amount;
    rim.current.intensity *= 1 - (brightLivery ? 0.69 : 0.52) * amount;
    if (
      preview.active &&
      preview.chapter === 'detail' &&
      preview.proposed &&
      state.carIndex !== 10
    ) {
      rim.current.position.set(-2.1, 2.0, -5.65);
      rim.current.intensity *= 0.86;
    }
  });

  const init = current.current;
  return (
    <>
      <pointLight
        ref={cabin}
        visible={false}
        color="#ffe3c4"
        intensity={0}
        distance={3.05}
        decay={2}
        position={[0.25, 1.72, -0.12]}
      />
      <pointLight
        ref={detailAccent}
        visible={false}
        color="#fff0de"
        intensity={0}
        distance={2.8}
        decay={2}
      />
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
