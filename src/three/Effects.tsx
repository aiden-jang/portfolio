import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping, SMAA } from '@react-three/postprocessing';
import { ToneMappingMode, type BloomEffect } from 'postprocessing';
import { memo, useEffect, useRef, type ComponentProps } from 'react';
import { THEMES } from '../config';
import { SCENE_ACTIVITY_EVENT } from './useSceneActivity';
import { smoothTowards } from '../math';
import { useAppStore } from '../store';

const TRANSITION_RATE = 2.5;
const BLOOM_RADIUS = 0.6;

// Keep the pass graph stable across car and paint changes; theme uniforms update per frame.
export const Effects = memo(function Effects() {
  useEffect(() => {
    window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT));
  }, []);
  const bloomRef = useRef<BloomEffect>(null);
  const currentStrength = useRef(THEMES.dusk.bloomStrength);
  const currentThreshold = useRef(THEMES.dusk.bloomThreshold);

  useFrame((_state, dt) => {
    const target = THEMES[useAppStore.getState().themeName];
    const k = Math.min(1, dt * TRANSITION_RATE);
    currentStrength.current = smoothTowards(currentStrength.current, target.bloomStrength, k);
    currentThreshold.current = smoothTowards(currentThreshold.current, target.bloomThreshold, k);
    if (bloomRef.current) {
      bloomRef.current.intensity = currentStrength.current;
      bloomRef.current.luminanceMaterial.threshold = currentThreshold.current;
    }
  });

  return (
    // WebKit needs single-sample targets. Tone-map highlights before smoothing their edges.
    <EffectComposer multisampling={0}>
      <Bloom
        // The library types this ref as the BloomEffect class, not the instance it assigns.
        ref={bloomRef as unknown as ComponentProps<typeof Bloom>['ref']}
        intensity={THEMES.dusk.bloomStrength}
        luminanceThreshold={THEMES.dusk.bloomThreshold}
        luminanceSmoothing={BLOOM_RADIUS}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
});
