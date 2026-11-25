import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { PMREMGenerator, type Texture, type WebGLRenderer } from 'three';
import { createStudioEnvironment } from './environment';
import { createEnvironmentBlend } from './environmentBlend';
import { loadBakedAfterHours } from './bakedEnvironment';

type Preset = NonNullable<Parameters<typeof createStudioEnvironment>[1]>;
type Environment = { texture: Texture; width: number; height: number; dispose: () => void };

export function useStudioEnvironment(renderer: WebGLRenderer) {
  const invalidate = useThree((state) => state.invalidate);
  const maps = useRef(new Map<Preset, Environment>());
  const blends = useRef(new Map<string, ReturnType<typeof createEnvironmentBlend>>());
  const pending = useRef(true);
  useEffect(() => {
    const cache = maps.current;
    const blendCache = blends.current;
    const controller = new AbortController();
    pending.current = true;
    const timeout = window.setTimeout(() => {
      controller.abort();
      pending.current = false;
      invalidate();
    }, 4000);
    void loadBakedAfterHours(controller.signal)
      .then((map) => {
        if (controller.signal.aborted || renderer.getContext().isContextLost()) {
          map.dispose();
          return;
        }
        try {
          renderer.initTexture(map.texture);
          cache.set('low-light', map);
        } catch (error) {
          map.dispose();
          throw error;
        }
      })
      .catch(() => {
        // An unavailable baked texture falls back to the existing Studio renderer.
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (controller.signal.aborted) return;
        pending.current = false;
        invalidate();
      });
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
      for (const map of cache.values()) map.dispose();
      cache.clear();
      for (const blend of blendCache.values()) blend.dispose();
      blendCache.clear();
    };
  }, [invalidate, renderer]);

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

  function getEnvironment(preset: Preset, level = 0) {
    if (level >= 1) return getMap('low-light').texture;
    const studio = getMap(preset);
    const slot = preset === 'miata' ? 'miata' : 'room';
    const warmable = preset === 'studio' || preset === 'optics' || preset === 'miata';
    let blend = blends.current.get(slot);
    if (level <= 0 && (blend || !warmable || !maps.current.has('low-light'))) return studio.texture;
    const evening = getMap('low-light');
    if (!blend) {
      blend = createEnvironmentBlend(renderer, studio.width, studio.height);
      blends.current.set(slot, blend);
      if (level <= 0) invalidate();
    }
    const texture = blend.mix(studio.texture, evening.texture, level);
    return level <= 0 ? studio.texture : texture;
  }

  return {
    getEnvironment,
    canFade: () =>
      !pending.current && (!maps.current.has('low-light') || blends.current.has('room')),
  };
}
