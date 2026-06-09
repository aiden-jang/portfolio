import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CARS, THEMES } from '../config';
import { smoothColorHex, smoothTowards } from '../math';
import { useAppStore } from '../store';
import {
  autoFitToLength,
  buildLamps,
  detectBodyMaterial,
  disposeModel,
  hideBakedPlanes,
  makeRadialGlowTexture,
} from './carHelpers';

const TRANSITION_RATE = 2.5;
const EXPOSURE_RATE = 2.5;

/** Loads the currently-selected GLB into a group, auto-fits it, attaches
 *  lamps + underglow, and animates the breathing pulse + rev surge. */
export function Car() {
  const { scene } = useThree();
  const carIndex = useAppStore((s) => s.carIndex);
  const armIntro = useAppStore((s) => s.armIntro);

  const group = useMemo(() => new THREE.Group(), []);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const loader = useMemo(() => {
    const l = new GLTFLoader();
    // Compressed GLBs use EXT_meshopt_compression. Hook up the decoder once.
    l.setMeshoptDecoder(MeshoptDecoder);
    return l;
  }, []);

  // Underglow disc (color animates via theme, opacity via breathing + rev).
  const underglowMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: makeRadialGlowTexture(),
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);
  const underglow = useMemo(() => {
    const g = new THREE.CircleGeometry(1, 96);
    g.scale(3.5, 4.5, 1);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, underglowMat);
    m.position.y = 0.015;
    return m;
  }, [underglowMat]);
  useEffect(() => {
    group.add(underglow);
    return () => {
      group.remove(underglow);
    };
  }, [group, underglow]);

  // Theme-driven underglow color (smooth).
  const currentUnderglow = useRef(THEMES.dusk.underglow);

  // (Re)load whenever carIndex changes.
  useEffect(() => {
    const spec = CARS[carIndex];
    if (!spec) return;
    const refs = useAppStore.getState().refs;
    refs.exposureCurrent = refs.exposureCurrent; // no-op, leaves easing in tick
    let cancelled = false;

    loader.load(
      `/models/${spec.file}`,
      (gltf) => {
        if (cancelled) return;

        // Tear down previous car.
        if (modelRef.current) {
          group.remove(modelRef.current);
          disposeModel(modelRef.current);
          modelRef.current = null;
        }
        for (const l of refs.lamps) group.remove(l.light);
        refs.lamps = [];

        const model = gltf.scene;
        const { scale, orientedSize } = autoFitToLength(model);
        hideBakedPlanes(model);
        group.add(model);
        modelRef.current = model;

        refs.lamps = buildLamps(group, orientedSize, scale);
        refs.bodyMaterial = detectBodyMaterial(model);
        refs.bodyOriginalColor = refs.bodyMaterial?.color?.clone() ?? null;

        if (!refs.introArmed) armIntro();

        // Prefetch the adjacent cars so a ←/→ swipe feels instant. Uses
        // `fetch` (not GLTFLoader) so it only warms the HTTP cache without
        // parsing or running the meshopt decoder. Fired after the current
        // load completes to keep the active swap unblocked.
        const adjacent = [
          (carIndex + 1) % CARS.length,
          (carIndex - 1 + CARS.length) % CARS.length,
        ];
        for (const i of adjacent) {
          const a = CARS[i];
          if (a && a.file !== spec.file) {
            // Browser cache is enough; we don't need the result.
            fetch(`/models/${a.file}`, { priority: 'low' } as RequestInit).catch(() => {});
          }
        }
      },
      undefined,
      (err) => {
        if (cancelled) return;
        console.error(`Failed to load /models/${spec.file}`, err);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [carIndex, loader, group, armIntro]);

  // Mount the group into the scene.
  useEffect(() => {
    scene.add(group);
    return () => {
      scene.remove(group);
      if (modelRef.current) disposeModel(modelRef.current);
    };
  }, [scene, group]);

  useFrame((state, dt) => {
    const refs = useAppStore.getState().refs;
    const target = THEMES[useAppStore.getState().themeName];
    const k = Math.min(1, dt * TRANSITION_RATE);

    // Underglow tint follows the theme.
    currentUnderglow.current = smoothColorHex(currentUnderglow.current, target.underglow, k);
    underglowMat.color.setHex(currentUnderglow.current);

    // Per-car exposure easing (read by Floor for final tone-mapping).
    const targetExposure = CARS[useAppStore.getState().carIndex]?.exposure ?? 1;
    refs.exposureCurrent = smoothTowards(refs.exposureCurrent, targetExposure, Math.min(1, dt * EXPOSURE_RATE));

    // Breathing pulse + rev-driven surge on underglow opacity.
    const time = state.clock.elapsedTime;
    const breath = 0.5 + Math.sin(time * 0.7) * 0.5;
    underglowMat.opacity = 0.42 + breath * 0.16 + refs.revT * 0.7;

    // Rev surges rear lamps.
    for (const l of refs.lamps) {
      const boost = !l.isHeadlight ? 1 + refs.revT * 6 : 1;
      l.light.intensity = l.baseIntensity * boost;
    }
  });

  return null;
}
