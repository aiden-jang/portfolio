import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Cancel superseded downloads before spending work on mesh and texture decoding. */
export async function loadCarModel(
  loader: Pick<GLTFLoader, 'parseAsync'>,
  url: string,
  signal: AbortSignal,
) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Model download failed (${response.status})`);
  const bytes = await response.arrayBuffer();
  signal.throwIfAborted();
  return loader.parseAsync(bytes, url.slice(0, url.lastIndexOf('/') + 1));
}
