import { useCallback, useEffect, useRef } from 'react';
import { PMREMGenerator, type WebGLRenderer, type WebGLRenderTarget } from 'three';
import { useAppStore } from '../../store';
import { createStudioEnvironment } from './environment';
import { createEnvironmentBlend } from './environmentBlend';

type Preset = NonNullable<Parameters<typeof createStudioEnvironment>[1]>;

export function useStudioEnvironment(renderer: WebGLRenderer) {
  const maps = useRef(new Map<Preset, WebGLRenderTarget>());
  const blends = useRef(new Map<string, ReturnType<typeof createEnvironmentBlend>>());
  const ready = useAppStore((state) => state.renderedCarIndex !== null && !state.isCarLoading);
  useEffect(() => {
    const cache = maps.current;
    const blendCache = blends.current;
    return () => {
      for (const map of cache.values()) map.dispose();
      cache.clear();
      for (const blend of blendCache.values()) blend.dispose();
      blendCache.clear();
    };
  }, [renderer]);

  const getMap = useCallback(
    (preset: Preset) => {
      const cached = maps.current.get(preset);
      if (cached) return cached;

      const generator = new PMREMGenerator(renderer);
      try {
        const map = createStudioEnvironment(generator, preset);
        maps.current.set(preset, map);
        return map;
      } finally {
        generator.dispose();
      }
    },
    [renderer],
  );

  const mix = useCallback(
    (preset: Preset, level: number) => {
      const studio = getMap(preset);
      const evening = getMap('low-light');
      const slot = preset === 'miata' ? 'miata' : 'room';
      let blend = blends.current.get(slot);
      if (!blend) {
        blend = createEnvironmentBlend(renderer, studio.width, studio.height);
        blends.current.set(slot, blend);
      }
      return blend.mix(studio.texture, evening.texture, level);
    },
    [getMap, renderer],
  );

  useEffect(() => {
    if (!ready || blends.current.has('room')) return;
    let idle = 0;
    const warm = () => {
      if (!blends.current.has('room') && !renderer.getContext().isContextLost()) mix('studio', 0);
    };
    // Give the opening its first painted frames before compiling the evening reflections.
    const timer = window.setTimeout(() => {
      if (window.requestIdleCallback) idle = window.requestIdleCallback(warm, { timeout: 1800 });
      else warm();
    }, 350);
    return () => {
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [mix, ready, renderer]);

  return (preset: Preset, level = 0) => {
    if (level <= 0) return getMap(preset).texture;
    if (level >= 1) return getMap('low-light').texture;
    return mix(preset, level);
  };
}
