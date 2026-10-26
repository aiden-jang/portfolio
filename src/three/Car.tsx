import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CARS, PREFETCH_MODEL_INDICES, THEMES } from '../config';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { smoothTowards } from '../math';
import { useCarDetails } from './useCarDetails';
import { createPopupHeadlights } from './popupHeadlights';
import { prepareModelFinish } from './modelFinishes';
import { canPrefetchModels } from './modelPrefetch';
import { smoothColorHex } from './colorMath';
import { useAppStore } from '../store';
import {
  autoFitToLength,
  prepareModelGlass,
  buildLamps,
  detectBodyMaterial,
  disposeModel,
  hideBakedPlanes,
  makeRadialGlowTexture,
} from './carHelpers';

const TRANSITION_RATE = 2.5;
const EXPOSURE_RATE = 2.5;

export function Car() {
  const { scene, invalidate } = useThree();
  const carIndex = useAppStore((s) => s.carIndex);
  const retryVersion = useAppStore((s) => s.carRetryVersion);
  const armIntro = useAppStore((s) => s.armIntro);

  const headlightsRaised = useAppStore((s) => s.headlightsRaised);
  const headlights = useRef<ReturnType<typeof createPopupHeadlights>>(null);

  useEffect(() => {
    headlights.current?.setRaised(headlightsRaised, prefersReducedMotion());
    invalidate();
  }, [headlightsRaised, invalidate]);

  const { attach: attachDetails, release: releaseDetails, update: updateDetails } = useCarDetails();
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
      map: makeRadialGlowTexture(invalidate),
      color: 0xffffff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [invalidate]);
  const underglow = useMemo(() => {
    const g = new THREE.CircleGeometry(1, 96);
    g.scale(2.3, 3.1, 1);
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

  const currentUnderglow = useRef(THEMES.dusk.underglow);

  useEffect(() => {
    const spec = CARS[carIndex];
    if (!spec) return;
    const refs = useAppStore.getState().refs;
    const setHasBodyMaterial = useAppStore.getState().setHasBodyMaterial;
    const setCarLoading = useAppStore.getState().setCarLoading;
    setHasBodyMaterial(false);
    useAppStore.setState({ hasPopupHeadlights: false });
    setCarLoading(true);
    useAppStore.getState().setCarLoadError(null);
    let cancelled = false;
    let prefetchTimer = 0;
    let readyFrame = 0;

    loader.load(
      `/models/${spec.file}`,
      (gltf) => {
        if (cancelled) {
          disposeModel(gltf.scene);
          return;
        }

        releaseDetails();
        headlights.current?.dispose();
        headlights.current = null;
        if (modelRef.current) {
          group.remove(modelRef.current);
          disposeModel(modelRef.current);
          modelRef.current = null;
        }
        for (const l of refs.lamps) group.remove(l.light);
        refs.lamps = [];

        const model = gltf.scene;
        const { scale, orientedSize } = autoFitToLength(model, spec.orientationYaw);
        if (!spec.preserveFlatMeshes) hideBakedPlanes(model);
        prepareModelGlass(model);
        prepareModelFinish(model, spec.file);
        headlights.current = createPopupHeadlights(model, gltf.animations, spec.popupHeadlights);
        headlights.current?.setRaised(useAppStore.getState().headlightsRaised, true);
        useAppStore.setState({ hasPopupHeadlights: !!headlights.current });
        group.add(model);
        modelRef.current = model;
        refs.carModel = model;
        displayedIndex.current = carIndex;

        refs.lamps =
          spec.roadLights === false
            ? []
            : buildLamps(group, orientedSize, scale, !headlights.current);
        attachDetails(model, spec);
        refs.bodyMaterial = detectBodyMaterial(model, spec.paintMaterial);
        refs.bodyOriginalColor = refs.bodyMaterial?.color?.clone() ?? null;
        setHasBodyMaterial(!!refs.bodyMaterial);
        // Has to run after material discovery, or a shared link's paint reverts on the swap.
        useAppStore.getState().applyBodyColor(useAppStore.getState().activeBodyColor);
        // The decoded model is not ready to see until the renderer has painted it.
        invalidate();
        readyFrame = requestAnimationFrame(() => {
          readyFrame = requestAnimationFrame(() => {
            if (!cancelled) setCarLoading(false);
          });
        });

        if (!refs.introArmed) armIntro();

        // Plain `fetch`, not GLTFLoader: this only needs to warm the HTTP cache, and parsing
        // plus meshopt-decoding spare cars would compete with the one on screen.
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
            for (const i of PREFETCH_MODEL_INDICES) {
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
      cancelAnimationFrame(readyFrame);
      setCarLoading(false);
    };
  }, [carIndex, retryVersion, loader, group, armIntro, invalidate, attachDetails, releaseDetails]);

  useEffect(() => {
    scene.add(group);
    return () => {
      scene.remove(group);
      releaseDetails();
      headlights.current?.dispose();
      if (modelRef.current) disposeModel(modelRef.current);
      useAppStore.getState().refs.carModel = null;
      underglow.geometry.dispose();
      underglowMat.map?.dispose();
      underglowMat.dispose();
    };
  }, [scene, group, underglow, underglowMat, releaseDetails]);

  useFrame((state, dt) => {
    headlights.current?.setRaised(useAppStore.getState().headlightsRaised, prefersReducedMotion());
    headlights.current?.update(dt);
    const refs = useAppStore.getState().refs;
    const target = THEMES[useAppStore.getState().themeName];
    const k = Math.min(1, dt * TRANSITION_RATE);

    currentUnderglow.current = smoothColorHex(currentUnderglow.current, target.underglow, k);
    underglowMat.color.setHex(currentUnderglow.current);

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
    refs.lightPulseT = Math.max(0, refs.lightPulseT - dt * 2);
    const pulse = reduced ? 0 : refs.lightPulseT;
    underglowMat.opacity = 0.1 + breath * 0.04;

    for (const l of refs.lamps) {
      const boost = 1 + pulse * 0.8;
      l.light.intensity = l.baseIntensity * boost;
    }
    updateDetails(dt);
  });

  return null;
}
