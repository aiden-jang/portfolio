import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { THEMES } from '../config';
import { smoothTowards } from '../math';
import { smoothColorHex } from './colorMath';
import { useAppStore } from '../store';

const FLOOR_RADIUS = 14;
const REFLECTOR_RESOLUTION = 1024;
const TRANSITION_RATE = 2.5;

export function Floor() {
  const { gl, scene } = useThree();
  const currentBg = useRef(THEMES.dusk.bg);
  const currentFogColor = useRef(THEMES.dusk.fogColor);
  const currentFogNear = useRef(THEMES.dusk.fogNear);
  const currentFogFar = useRef(THEMES.dusk.fogFar);
  const currentReflectorColor = useRef(THEMES.dusk.reflectorColor);
  const currentExposure = useRef(THEMES.dusk.exposure);

  // Built by hand because R3F's <reflector> intrinsic wraps a helper with a non-standard
  // constructor signature.
  const reflector = useMemo(() => {
    const r = new Reflector(new THREE.CircleGeometry(FLOOR_RADIUS, 96), {
      textureWidth: REFLECTOR_RESOLUTION,
      textureHeight: REFLECTOR_RESOLUTION,
      multisample: 0,
      color: new THREE.Color(THEMES.dusk.reflectorColor),
    });
    r.rotation.x = -Math.PI / 2;
    return r;
  }, []);

  useEffect(() => {
    scene.fog = new THREE.Fog(THEMES.dusk.fogColor, THEMES.dusk.fogNear, THEMES.dusk.fogFar);
    return () => {
      scene.fog = null;
      reflector.dispose();
      reflector.geometry.dispose();
    };
  }, [scene, reflector]);

  useFrame((_state, dt) => {
    const target = THEMES[useAppStore.getState().themeName];
    const exposureMul = useAppStore.getState().refs.exposureCurrent;
    const k = Math.min(1, dt * TRANSITION_RATE);

    currentExposure.current = smoothTowards(currentExposure.current, target.exposure, k);
    gl.toneMappingExposure = currentExposure.current * exposureMul;

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
    (uniforms.color.value as THREE.Color).setHex(currentReflectorColor.current);
  });

  return <primitive object={reflector} />;
}
