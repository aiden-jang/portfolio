import { useFrame, useThree } from '@react-three/fiber';
import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  ToneMappingEffect,
  ToneMappingMode,
} from 'postprocessing';
import { memo, useLayoutEffect, useRef } from 'react';
import { HalfFloatType, NoToneMapping } from 'three';
import type { EventDispatcher } from 'three';
import { THEMES } from '../config';
import { SCENE_ACTIVITY_EVENT } from './useSceneActivity';
import { smoothTowards } from '../math';
import { useAppStore } from '../store';

const TRANSITION_RATE = 2.5;
const BLOOM_RADIUS = 0.6;

// Reuse the existing renderer; a second context probe can block startup on slower devices.
export const Effects = memo(function Effects() {
  const { gl, scene, camera, size, invalidate } = useThree();
  const pipeline = useRef<{ composer: EffectComposer; bloom: BloomEffect } | null>(null);
  const currentStrength = useRef(THEMES.dusk.bloomStrength);
  const currentThreshold = useRef(THEMES.dusk.bloomThreshold);

  useLayoutEffect(() => {
    const toneMapping = gl.toneMapping;
    const autoClear = gl.autoClear;
    const composer = new EffectComposer(gl, { multisampling: 0, frameBufferType: HalfFloatType });
    const bloom = new BloomEffect({
      blendFunction: BlendFunction.ADD,
      intensity: currentStrength.current,
      luminanceThreshold: currentThreshold.current,
      luminanceSmoothing: BLOOM_RADIUS,
      mipmapBlur: true,
    });
    const tone = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    const smaa = new SMAAEffect();
    const loaded = () => invalidate();
    // SMAA emits load for its lookup textures, but its published event map omits it.
    const smaaEvents = smaa as unknown as EventDispatcher<{ load: object }>;
    smaaEvents.addEventListener('load', loaded);
    gl.toneMapping = NoToneMapping;
    composer.addPass(new RenderPass(scene, camera));
    // Preserve HDR bloom and tone mapping before the separate SMAA edge pass.
    composer.addPass(new EffectPass(camera, bloom, tone));
    composer.addPass(new EffectPass(camera, smaa));
    pipeline.current = { composer, bloom };
    window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT));
    return () => {
      pipeline.current = null;
      smaaEvents.removeEventListener('load', loaded);
      composer.dispose();
      gl.toneMapping = toneMapping;
      gl.autoClear = autoClear;
    };
  }, [gl, scene, camera, invalidate]);

  useLayoutEffect(() => {
    pipeline.current?.composer.setSize(size.width, size.height);
    invalidate();
  }, [size.width, size.height, gl, scene, camera, invalidate]);

  useFrame((_state, dt) => {
    const graph = pipeline.current;
    if (!graph) return;
    const target = THEMES[useAppStore.getState().themeName];
    const k = Math.min(1, dt * TRANSITION_RATE);
    currentStrength.current = smoothTowards(currentStrength.current, target.bloomStrength, k);
    currentThreshold.current = smoothTowards(currentThreshold.current, target.bloomThreshold, k);
    graph.bloom.intensity = currentStrength.current;
    graph.bloom.luminanceMaterial.threshold = currentThreshold.current;
    const autoClear = gl.autoClear;
    gl.autoClear = true;
    try {
      graph.composer.render(dt);
    } finally {
      gl.autoClear = autoClear;
    }
  }, 1);

  return null;
});
