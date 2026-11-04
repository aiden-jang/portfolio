import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Cancel superseded downloads before spending work on mesh and texture decoding. */
export async function loadCarModel(
  loader: Pick<GLTFLoader, 'parseAsync' | 'manager'>,
  url: string,
  signal: AbortSignal,
) {
  loader.manager.itemStart(url);
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Model download failed (${response.status})`);
    const bytes = await response.arrayBuffer();
    signal.throwIfAborted();
    return await loader.parseAsync(bytes, url.slice(0, url.lastIndexOf('/') + 1));
  } catch (error) {
    if (!signal.aborted) loader.manager.itemError(url);
    throw error;
  } finally {
    loader.manager.itemEnd(url);
  }
}
