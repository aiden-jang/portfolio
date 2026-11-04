import { afterEach, expect, it, vi } from 'vitest';
import { loadCarModel } from './loadCarModel';

afterEach(() => vi.unstubAllGlobals());

it('passes the original model bytes and resource path to the same decoder', async () => {
  const bytes = new Uint8Array([103, 108, 84, 70, 2, 0, 0, 0]).buffer;
  const result = { scene: 'unchanged model' };
  const parseAsync = vi.fn().mockResolvedValue(result);
  const controller = new AbortController();
  const fetcher = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes });
  vi.stubGlobal('fetch', fetcher);
  expect(
    await loadCarModel({ parseAsync }, '/models/ferrari-f120-f40.glb', controller.signal),
  ).toBe(result);
  expect(fetcher).toHaveBeenCalledWith('/models/ferrari-f120-f40.glb', {
    signal: controller.signal,
  });
  expect(parseAsync).toHaveBeenCalledWith(bytes, '/models/');
});

it('stops an interrupted download without decoding or replacing the current car', async () => {
  const controller = new AbortController();
  const parseAsync = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url, { signal }: RequestInit) =>
        new Promise((_resolve, reject) => {
          signal!.addEventListener(
            'abort',
            () => reject(new DOMException('Cancelled', 'AbortError')),
            { once: true },
          );
        }),
    ),
  );
  const pending = loadCarModel({ parseAsync }, '/models/ferrari-f120-f40.glb', controller.signal);
  controller.abort();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(parseAsync).not.toHaveBeenCalled();
});

it('does not decode a stale response body or a failed download', async () => {
  const controller = new AbortController();
  const parseAsync = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => {
        controller.abort();
        return new ArrayBuffer(0);
      },
    }),
  );
  await expect(
    loadCarModel({ parseAsync }, '/models/ferrari-f120-f40.glb', controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
  await expect(
    loadCarModel({ parseAsync }, '/models/ferrari-f120-f40.glb', new AbortController().signal),
  ).rejects.toThrow('503');
  expect(parseAsync).not.toHaveBeenCalled();
});
