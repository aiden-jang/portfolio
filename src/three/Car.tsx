import { exhibitWheel } from '../garageExhibits/geometry';
import { useGarageExhibit } from '../garageExhibits/state';
import { prepareBrakePivot } from '../garageExhibits/parts';
import { prepareRaceWear } from '../garageExhibits/wear';
import { useGarageStudy } from '../garageStudy/state';
import { tuneStudyMaterials } from '../garageStudy/materials';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CARS, F40_INDEX, THEMES } from '../config';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { smoothTowards } from '../math';
import { useCarDetails } from './useCarDetails';
import { createPopupHeadlights } from './popupHeadlights';
import { prepareModelFinish } from './modelFinishes';
import { scheduleCompanionPrefetch } from './modelPrefetch';
import { useShowroomModel } from './useShowroomModel';
import { loadCarModel } from './loadCarModel';
import { smoothColorHex } from './colorMath';
import { useAppStore } from '../store';
import { useGarageStudio } from '../garageStudio/state';
import { useLineup } from '../lineup/state';
import { useRenderFinish } from './useRenderFinish';
import { useMiataPaintReflection } from './studio/useMiataPaintReflection';
import {
  autoFitToLength,
  prepareModelGlass,
  buildLamps,
  detectBodyMaterial,
  disposeModel,
  hideBakedPlanes,
  makeRadialGlowTexture,
} from './carHelpers';

import { isOpeningLowLight, isOpeningStudio } from '../lighting';
import { prepareAfterHoursSurfaces } from './studio/afterHoursSurfaces';
import { motionState } from './studioEntrance';
import { getStudioProjection } from './studio/projection';
import { tuneStudioFerrari } from './studio/ferrariMaterials';

const TRANSITION_RATE = 2.5;
const EXPOSURE_RATE = 2.5;

export function Car() {
  const { scene, invalidate } = useThree();
  const { carIndex, modelFile } = useShowroomModel();
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
  const studioFinish = useRef<ReturnType<typeof tuneStudioFerrari> | null>(null);
  const afterHoursSurfaces = useRef<ReturnType<typeof prepareAfterHoursSurfaces>>(null);
  const reviewFinish = useRef<ReturnType<typeof tuneStudyMaterials>>();
  const brake = useRef<ReturnType<typeof prepareBrakePivot>>();
  const wear = useRef<ReturnType<typeof prepareRaceWear>>();
  const wearAmount = useRef(0);
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
  useRenderFinish(group, underglow);
  useMiataPaintReflection();
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
    const requestedWing = useAppStore.getState().drsOpen;
    setCarLoading(true);
    if (spec.drs && requestedWing) useAppStore.setState({ drsOpen: true });
    useAppStore.getState().setCarLoadError(null);
    let cancelled = false;
    const controller = new AbortController();
    let prefetchTimer = 0;
    let readyFrame = 0;

    void loadCarModel(loader, `/models/${modelFile}`, controller.signal).then(
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
        reviewFinish.current = tuneStudyMaterials(model, spec.file);
        exhibitWheel.point = null;
        brake.current = carIndex === 20 ? prepareBrakePivot(model) : undefined;
        wear.current = carIndex === 20 ? prepareRaceWear(model) : undefined;
        wearAmount.current = 0;
        studioFinish.current = carIndex === 0 ? tuneStudioFerrari(model) : null;
        studioFinish.current?.(isOpeningStudio(useAppStore.getState()));
        afterHoursSurfaces.current = prepareAfterHoursSurfaces(model, spec.file);
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
        const app = useAppStore.getState();
        refs.bodyMaterial =
          app.carIndex === carIndex ? detectBodyMaterial(model, spec.paintMaterial) : null;
        refs.bodyOriginalColor = refs.bodyMaterial?.color?.clone() ?? null;
        setHasBodyMaterial(!!refs.bodyMaterial);
        // Has to run after material discovery, or a shared link's paint reverts on the swap.
        if (refs.bodyMaterial) app.applyBodyColor(app.activeBodyColor);
        // The decoded model is not ready to see until the renderer has painted it.
        invalidate();
        readyFrame = requestAnimationFrame(() => {
          readyFrame = requestAnimationFrame(() => {
            if (!cancelled) setCarLoading(false, carIndex);
          });
        });

        if (!refs.introArmed) armIntro();

        prefetchTimer = scheduleCompanionPrefetch(spec.file, controller.signal);
      },
      (err) => {
        if (cancelled) return;
        setCarLoading(false);
        setHasBodyMaterial(!!refs.bodyMaterial);
        useAppStore
          .getState()
          .setCarLoadError(`Couldn’t load ${spec.name}. You can keep browsing or try again.`);
        console.error(`Failed to load /models/${modelFile}`, err);
      },
    );

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(prefetchTimer);
      cancelAnimationFrame(readyFrame);
      setCarLoading(false);
    };
  }, [
    carIndex,
    modelFile,
    retryVersion,
    loader,
    group,
    armIntro,
    invalidate,
    attachDetails,
    releaseDetails,
  ]);

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
    const app = useAppStore.getState();
    const review = useGarageStudio.getState();
    group.visible =
      !useLineup.getState().active &&
      (!app.isContactVisible || review.active || displayedIndex.current === F40_INDEX);
    const exhibit = useGarageExhibit.getState();
    const onStage = review.active && review.chapter === 'walk' && displayedIndex.current === 20;
    const reduced = prefersReducedMotion();
    brake.current?.(
      onStage && exhibit.exhibit === 'brakes' ? Number(exhibit.after) : 0,
      dt,
      reduced,
    );
    const worn = Number(onStage && exhibit.exhibit === 'wear' && exhibit.after);
    wearAmount.current = reduced
      ? worn
      : THREE.MathUtils.lerp(wearAmount.current, worn, Math.min(dt * 8, 1));
    wear.current?.(wearAmount.current);
    const refinements =
      review.active &&
      (!review.study || review.study === 'finished') &&
      useGarageStudy.getState().refined;
    reviewFinish.current?.(refinements);
    const studio = review.active || isOpeningStudio(app);
    const lampLevel =
      afterHoursSurfaces.current?.(!review.active && isOpeningLowLight(app), dt) ?? 0;
    studioFinish.current?.(
      studio,
      studio ? getStudioProjection(state.size.width < 768) : undefined,
      refinements,
      app.isContactVisible && !review.active && group.visible,
      studio && !review.active && group.visible && !reduced ? motionState.openingOrbitProgress : 0,
    );
    headlights.current?.setRaised(useAppStore.getState().headlightsRaised, prefersReducedMotion());
    headlights.current?.update(dt);
    const { refs } = app;
    const target = THEMES.studio;
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
    const time = state.clock.elapsedTime;
    const breath = reduced ? 0.5 : 0.5 + Math.sin(time * 0.7) * 0.5;
    refs.lightPulseT = Math.max(0, refs.lightPulseT - dt * 2);
    const pulse = reduced ? 0 : refs.lightPulseT;
    underglowMat.opacity = studio ? 0.012 : 0.1 + breath * 0.04;

    for (const l of refs.lamps) {
      const boost = 1 + pulse * 0.8;
      const studioScale = l.isHeadlight
        ? 0.035 * (1 - lampLevel * 0.24)
        : 0.14 * (1 - lampLevel * 0.74);
      l.light.intensity = l.baseIntensity * boost * (studio ? studioScale : 1);
    }
    updateDetails(dt);
  });

  return null;
}
