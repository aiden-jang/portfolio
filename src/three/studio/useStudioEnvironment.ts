import { useEffect, useRef } from 'react';
import { PMREMGenerator, type WebGLRenderer, type WebGLRenderTarget } from 'three';
import { createStudioEnvironment } from './environment';
import { createEnvironmentBlend } from './environmentBlend';

type Preset = NonNullable<Parameters<typeof createStudioEnvironment>[1]>;

export function useStudioEnvironment(renderer: WebGLRenderer) {
  const maps = useRef(new Map<Preset, WebGLRenderTarget>());
  const blends = useRef(new Map<string, ReturnType<typeof createEnvironmentBlend>>());
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

  function getMap(preset: Preset) {
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
  }

  return (preset: Preset, level = 0) => {
    if (level <= 0) return getMap(preset).texture;
    if (level >= 1) return getMap('low-light').texture;
    const studio = getMap(preset);
    const evening = getMap('low-light');
    const slot = preset === 'miata' ? 'miata' : 'room';
    let blend = blends.current.get(slot);
    if (!blend) {
      blend = createEnvironmentBlend(renderer, studio.width, studio.height);
      blends.current.set(slot, blend);
    }
    return blend.mix(studio.texture, evening.texture, level);
  };
}
