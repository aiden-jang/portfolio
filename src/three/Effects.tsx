import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useRef } from 'react';
import { THEMES } from '../config';
import { smoothTowards } from '../math';
import { useAppStore } from '../store';

const TRANSITION_RATE = 2.5;
const BLOOM_RADIUS = 0.6;

/** UnrealBloom via @react-three/postprocessing. Strength and threshold are
 *  eased toward the active theme each frame. */
export function Effects() {
  const bloomRef = useRef<any>(null);
  const currentStrength = useRef(THEMES.dusk.bloomStrength);
  const currentThreshold = useRef(THEMES.dusk.bloomThreshold);

  useFrame((_state, dt) => {
    const target = THEMES[useAppStore.getState().themeName];
    const k = Math.min(1, dt * TRANSITION_RATE);
    currentStrength.current = smoothTowards(currentStrength.current, target.bloomStrength, k);
    currentThreshold.current = smoothTowards(currentThreshold.current, target.bloomThreshold, k);
    if (bloomRef.current) {
      bloomRef.current.intensity = currentStrength.current;
      bloomRef.current.luminanceThreshold = currentThreshold.current;
    }
  });

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef}
        intensity={THEMES.dusk.bloomStrength}
        luminanceThreshold={THEMES.dusk.bloomThreshold}
        luminanceSmoothing={BLOOM_RADIUS}
        mipmapBlur
      />
    </EffectComposer>
  );
}
