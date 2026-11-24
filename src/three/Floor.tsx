import { useContactLight } from './useContactLight';
import { useGarageExhibit } from '../garageExhibits/state';
import { inStudioDusk } from '../garageExhibits/state';
import { inBlackout, useGarageStudio } from '../garageStudio/state';
import { paintFinish } from '../paint';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { CARS, THEMES } from '../config';
import { MIATA_BODY_PAINT, MIATA_MODEL } from '../cars';
import { studioCarFootprint } from './studio/carGrounding';
import { smoothTowards } from '../math';
import { smoothColorHex } from './colorMath';
import { useAppStore } from '../store';
import { applyStudioReflection } from './studioReflection';
import { isAfterHoursScene } from '../garageStudio/lighting';
import { afterHoursLampStyles } from './studio/afterHoursLamps';
import { lampFloorOrigins } from './studio/afterHoursTuning';
import { openingStudioWeight } from './openingStudio';

const FLOOR_RADIUS = 14;
const REFLECTOR_RESOLUTION = 1024;
const TRANSITION_RATE = 2.5;

type Footprint = NonNullable<ReturnType<typeof studioCarFootprint>>;
export type LineupFootprints = readonly [Footprint, Footprint?];

export function Floor({
  studio,
  lineup,
  closing = false,
}: {
  studio: boolean;
  lineup?: LineupFootprints | null;
  closing?: boolean;
}) {
  const { gl, scene } = useThree();
  const mobile = useThree((state) => studio && state.size.width < 768);
  const studioTint = useMemo(() => new THREE.Color(), []);
  const currentBg = useRef(THEMES.dusk.bg);
  const currentFogColor = useRef(THEMES.dusk.fogColor);
  const currentFogNear = useRef(THEMES.dusk.fogNear);
  const currentFogFar = useRef(THEMES.dusk.fogFar);
  const currentReflectorColor = useRef(THEMES.dusk.reflectorColor);
  const currentExposure = useRef(THEMES.dusk.exposure);
  const contactLight = useContactLight();

  // Built by hand because R3F's <reflector> intrinsic wraps a helper with a non-standard
  // constructor signature.
  const reflector = useMemo(() => {
    const r = new Reflector(
      studio ? new THREE.PlaneGeometry(63, 63) : new THREE.CircleGeometry(FLOOR_RADIUS, 96),
      {
        textureWidth: REFLECTOR_RESOLUTION,
        textureHeight: REFLECTOR_RESOLUTION,
        multisample: 0,
        color: new THREE.Color(THEMES.dusk.reflectorColor),
      },
    );
    if (studio) {
      const target = r.getRenderTarget().texture;
      target.generateMipmaps = true;
      target.minFilter = THREE.LinearMipmapLinearFilter;
    }
    applyStudioReflection(r.material as THREE.ShaderMaterial, studio, mobile);
    (r.material as THREE.ShaderMaterial).uniforms.studioFinish.value = openingStudioWeight();
    r.rotation.x = -Math.PI / 2;
    return r;
  }, [studio, mobile]);

  useEffect(() => {
    scene.fog = new THREE.Fog(THEMES.dusk.fogColor, THEMES.dusk.fogNear, THEMES.dusk.fogFar);
    return () => {
      scene.fog = null;
      reflector.dispose();
      reflector.geometry.dispose();
    };
  }, [scene, reflector]);

  useFrame((_state, dt) => {
    const state = useAppStore.getState();
    const { refs, renderFinish } = state;
    const inLineup = lineup !== undefined;
    const preview = useGarageStudio.getState();
    const target = THEMES.studio;
    const k = Math.min(1, dt * TRANSITION_RATE);

    currentExposure.current = smoothTowards(currentExposure.current, target.exposure, k);
    gl.toneMappingExposure = currentExposure.current * (inLineup ? 1 : refs.exposureCurrent);

    currentBg.current = smoothColorHex(currentBg.current, target.bg, k);
    gl.setClearColor(currentBg.current, 1);

    currentFogColor.current = smoothColorHex(currentFogColor.current, target.fogColor, k);
    currentFogNear.current = smoothTowards(currentFogNear.current, target.fogNear, k);
    currentFogFar.current = smoothTowards(currentFogFar.current, target.fogFar, k);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.color.setHex(currentFogColor.current);
      fog.near = currentFogNear.current;
      fog.far = currentFogFar.current;
    }

    currentReflectorColor.current = smoothColorHex(
      currentReflectorColor.current,
      target.reflectorColor,
      k,
    );
    const uniforms = (reflector.material as THREE.ShaderMaterial).uniforms;
    if (studio) {
      uniforms.closingFloor.value = Number(closing);
      uniforms.studioCarMirrorWeight.value =
        !closing &&
        !inLineup &&
        CARS[state.carIndex].file === MIATA_MODEL &&
        refs.bodyMaterial?.name === MIATA_BODY_PAINT
          ? 0.78
          : 1;
      uniforms.closingLight.value = contactLight(closing, dt);
      const settle = Math.min(1, dt * 10);
      const dusk = inStudioDusk(preview);
      uniforms.studioDusk.value += (Number(dusk) - uniforms.studioDusk.value) * settle;
      const afterHours = !closing && !inLineup && isAfterHoursScene(state, preview);
      uniforms.afterHoursGrounding.value +=
        (Number(afterHours) - uniforms.afterHoursGrounding.value) * settle;
      const head = uniforms.afterHoursHeadSpill.value as THREE.Vector3;
      const tail = uniforms.afterHoursTailSpill.value as THREE.Vector2;
      const car = CARS[state.carIndex];
      const lamps = afterHoursLampStyles[car.file];
      const lampActive = afterHours && !!lamps && !state.isCarLoading;
      const headsOn =
        lampActive && !!lamps.head && (!car.popupHeadlights || state.headlightsRaised);
      head.x = smoothTowards(head.x, Number(headsOn) * 2.35, settle);
      tail.x = smoothTowards(tail.x, Number(lampActive) * 1.38, settle);
      if (lamps) {
        head.y = lamps.head?.spacing ?? 0;
        head.z = lamps.head?.warmth ?? 0;
        tail.y = lamps.tail;
        const origin = lampFloorOrigins[car.file];
        (uniforms.afterHoursLampOrigin.value as THREE.Vector2).set(
          origin ? Math.max(1.85, origin[0] + 0.1) : 2.13,
          origin ? origin[1] + 0.06 : 2.04,
        );
      }
      const roomDim = inBlackout() ? 1 : afterHours ? 0.82 : 0;
      uniforms.garageStudioDim.value += (roomDim - uniforms.garageStudioDim.value) * settle;
      const extendedLamp = preview.active && useGarageExhibit.getState().exhibit === 'lamps';
      uniforms.extendedLamp.value = Number(extendedLamp);
      uniforms.garageStudioLamps.value +=
        (Number(
          preview.active &&
            preview.chapter === 'detail' &&
            preview.proposed &&
            state.carIndex === 10 &&
            state.headlightsRaised,
        ) -
          uniforms.garageStudioLamps.value) *
        settle;
      uniforms.garageStudioLow.value = Number(
        preview.active && preview.chapter === 'walk' && preview.proposed,
      );
      uniforms.garageStudioPass.value =
        preview.active && preview.study === 'shadows'
          ? 1
          : preview.active && preview.study === 'reflection'
            ? 2
            : 0;
      const footprint = inLineup ? lineup?.[0] : refs.carModel && studioCarFootprint(refs.carModel);
      const second = lineup?.[1];
      uniforms.studioSecondReady.value = second ? 1 : 0;
      if (second) {
        uniforms.studioSecondChassis.value.copy(second.chassis);
        second.tires.forEach((tire, index) => uniforms.studioSecondTouch.value[index].copy(tire));
      }
      if (footprint) {
        uniforms.studioChassis.value.copy(footprint.chassis);
        footprint.tires.forEach((tire, index) => uniforms.studioWheelTouch.value[index].copy(tire));
      }
      uniforms.studioCarReady.value = footprint ? 1 : 0;
      if (!state.isCarLoading) {
        studioTint.set(
          inLineup
            ? CARS[0].defaultPaint.hex
            : paintFinish(CARS[state.carIndex], state.activeBodyColor).hex,
        );
        uniforms.studioPaint.value.lerp(studioTint, Math.min(1, dt * 12));
      }
    }
    uniforms.studioFinish.value = smoothTowards(
      uniforms.studioFinish.value,
      openingStudioWeight(),
      Math.min(1, dt * 5),
    );
    uniforms.reflectionStrength.value = inLineup
      ? 1
      : renderFinish === 'clay'
        ? 0
        : refs.floorReflection;
    (uniforms.color.value as THREE.Color).setHex(currentReflectorColor.current);
  });

  return <primitive object={reflector} />;
}
