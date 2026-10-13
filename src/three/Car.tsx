import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CARS, THEMES } from '../config';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { smoothTowards } from '../math';
import { canPrefetchModels } from './modelPrefetch';
import { smoothColorHex } from './colorMath';
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

export function Car() {
  const { scene } = useThree();
  const carIndex = useAppStore((s) => s.carIndex);
  const retryVersion = useAppStore((s) => s.carRetryVersion);
  const armIntro = useAppStore((s) => s.armIntro);

  const group = useMemo(() => new THREE.Group(), []);
  const displayedIndex = useRef(carIndex);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const loader = useMemo(() => {
    const l = new GLTFLoader();
    // Every GLB is meshopt-compressed, so the decoder has to be attached before any load.
    l.setMeshoptDecoder(MeshoptDecoder);
    return l;
  }, []);

  const underglowMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: makeRadialGlowTexture(),
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
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
    const setHasBodyMaterial = useAppStore.getState().setHasBodyMaterial;
    const setCarLoading = useAppStore.getState().setCarLoading;
    setHasBodyMaterial(false);
    setCarLoading(true);
    useAppStore.getState().setCarLoadError(null);
    let cancelled = false;
    let prefetchTimer = 0;

    loader.load(
      `/models/${spec.file}`,
      (gltf) => {
        if (cancelled) {
          disposeModel(gltf.scene);
          return;
        }

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
        displayedIndex.current = carIndex;

        refs.lamps = buildLamps(group, orientedSize, scale);
        refs.bodyMaterial = detectBodyMaterial(model);
        refs.bodyOriginalColor = refs.bodyMaterial?.color?.clone() ?? null;
        setHasBodyMaterial(!!refs.bodyMaterial);
        // Has to run after material discovery, or a shared link's paint reverts on the swap.
        useAppStore.getState().applyBodyColor(useAppStore.getState().activeBodyColor);
        setCarLoading(false);

        if (!refs.introArmed) armIntro();

        // Plain `fetch`, not GLTFLoader: this only needs to warm the HTTP cache, and parsing
        // plus meshopt-decoding two spare cars would compete with the one on screen.
        if (
          canPrefetchModels(
            (
              navigator as Navigator & {
                connection?: { saveData?: boolean; effectiveType?: string };
              }
            ).connection,
          )
        ) {
          prefetchTimer = window.setTimeout(() => {
            const adjacent = [
              (carIndex + 1) % CARS.length,
              (carIndex - 1 + CARS.length) % CARS.length,
            ];
            for (const i of adjacent) {
              const a = CARS[i];
              if (a && a.file !== spec.file) {
                fetch(`/models/${a.file}`, { priority: 'low' } as RequestInit).catch(() => {});
              }
            }
          }, 1500);
        }
      },
      undefined,
      (err) => {
        if (cancelled) return;
        setCarLoading(false);
        setHasBodyMaterial(!!refs.bodyMaterial);
        useAppStore
          .getState()
          .setCarLoadError(`Couldn’t load ${spec.name}. You can keep browsing or try again.`);
        console.error(`Failed to load /models/${spec.file}`, err);
      },
    );

    return () => {
      cancelled = true;
      window.clearTimeout(prefetchTimer);
    };
  }, [carIndex, retryVersion, loader, group, armIntro]);

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

    currentUnderglow.current = smoothColorHex(currentUnderglow.current, target.underglow, k);
    underglowMat.color.setHex(currentUnderglow.current);

    // Floor reads this for its final tone-mapping.
    const targetExposure = CARS[displayedIndex.current]?.exposure ?? 1;
    refs.exposureCurrent = smoothTowards(
      refs.exposureCurrent,
      targetExposure,
      Math.min(1, dt * EXPOSURE_RATE),
    );

    // Purely decorative motion, so reduced motion pins both to a steady state.
    const reduced = prefersReducedMotion();
    const time = state.clock.elapsedTime;
    const breath = reduced ? 0.5 : 0.5 + Math.sin(time * 0.7) * 0.5;
    const rev = reduced ? 0 : refs.revT;
    underglowMat.opacity = 0.22 + breath * 0.1 + rev * 0.45;

    for (const l of refs.lamps) {
      const boost = !l.isHeadlight ? 1 + rev * 6 : 1;
      l.light.intensity = l.baseIntensity * boost;
    }
  });

  return null;
}
