import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Progress = (percent: number) => void;

async function modelBytes(response: Response, progress?: Progress) {
  if (!progress) return response.arrayBuffer();
  const length = Number(response.headers.get('content-length'));
  const encoding = response.headers.get('content-encoding');
  if (!response.body || length <= 0 || (encoding && encoding !== 'identity')) {
    return response.arrayBuffer();
  }
  let received = 0;
  const stream = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength;
        progress(Math.min(99, Math.floor((100 * received) / length)));
        controller.enqueue(chunk);
      },
    }),
  );
  return new Response(stream).arrayBuffer();
}

/** Cancel superseded downloads before spending work on mesh and texture decoding. */
export async function loadCarModel(
  loader: Pick<GLTFLoader, 'parseAsync' | 'manager'>,
  url: string,
  signal: AbortSignal,
  progress?: Progress,
) {
  loader.manager.itemStart(url);
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Model download failed (${response.status})`);
    const bytes = await modelBytes(response, progress);
    signal.throwIfAborted();
    progress?.(100);
    return await loader.parseAsync(bytes, url.slice(0, url.lastIndexOf('/') + 1));
  } catch (error) {
    if (!signal.aborted) loader.manager.itemError(url);
    throw error;
  } finally {
    loader.manager.itemEnd(url);
  }
}
