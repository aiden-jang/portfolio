import {
  CubeUVReflectionMapping,
  DataTexture,
  HalfFloatType,
  LinearFilter,
  LinearSRGBColorSpace,
  RGBAFormat,
} from 'three';

// The PMREM atlas generated from the low-light Studio preset at a 256px cube size.
const width = 768;
const height = 1024;

export async function loadBakedAfterHours(signal: AbortSignal) {
  const response = await fetch('/showroom/after-hours.rgba16.gz', { signal });
  if (!response.ok || !response.body) throw new Error('After Hours reflections unavailable');
  const contents = response.body.pipeThrough(new DecompressionStream('gzip'));
  const bytes = await new Response(contents).arrayBuffer();
  signal.throwIfAborted();
  if (bytes.byteLength !== width * height * 8) throw new Error('Invalid reflection texture');
  const texture = new DataTexture(new Uint16Array(bytes), width, height, RGBAFormat, HalfFloatType);
  texture.mapping = CubeUVReflectionMapping;
  texture.colorSpace = LinearSRGBColorSpace;
  texture.magFilter = texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return { texture, width, height, dispose: () => texture.dispose() };
}
