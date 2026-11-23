import { useEffect, useRef } from 'react';
import { PMREMGenerator, type WebGLRenderer, type WebGLRenderTarget } from 'three';
import { createStudioEnvironment } from './environment';

type Preset = NonNullable<Parameters<typeof createStudioEnvironment>[1]>;

export function useStudioEnvironment(renderer: WebGLRenderer) {
  const maps = useRef(new Map<Preset, WebGLRenderTarget>());
  useEffect(() => {
    const cache = maps.current;
    return () => {
      for (const map of cache.values()) map.dispose();
      cache.clear();
    };
  }, [renderer]);

  return (preset: Preset) => {
    const cached = maps.current.get(preset);
    if (cached) return cached.texture;

    const generator = new PMREMGenerator(renderer);
    try {
      const map = createStudioEnvironment(generator, preset);
      maps.current.set(preset, map);
      return map.texture;
    } finally {
      generator.dispose();
    }
  };
}
