import { afterEach, expect, it, vi } from 'vitest';
import { LoadingManager } from 'three';
import { loadCarModel } from './loadCarModel';

afterEach(() => vi.unstubAllGlobals());

it('tracks download and decoding while preserving the original model bytes and resource path', async () => {
  const bytes = new Uint8Array([103, 108, 84, 70, 2, 0, 0, 0]).buffer;
  const result = { scene: 'unchanged model' };
  const events: string[] = [];
  const manager = new LoadingManager();
  manager.onStart = () => events.push('start');
  manager.onLoad = () => events.push('finish');
  let decoded!: (value: unknown) => void;
  const parsing = new Promise((resolve) => {
    decoded = resolve;
  });
  const parseAsync = vi.fn().mockReturnValue(parsing);
  const controller = new AbortController();
  const fetcher = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes });
  vi.stubGlobal('fetch', fetcher);
  const pending = loadCarModel(
    { parseAsync, manager },
    '/models/ferrari-f120-f40.glb',
    controller.signal,
  );
  await vi.waitFor(() => expect(parseAsync).toHaveBeenCalledOnce());
  expect(events).toEqual(['start']);
  decoded(result);
  expect(await pending).toBe(result);
  expect(events).toEqual(['start', 'finish']);
  expect(fetcher).toHaveBeenCalledWith('/models/ferrari-f120-f40.glb', {
    signal: controller.signal,
  });
  expect(parseAsync).toHaveBeenCalledWith(bytes, '/models/');
});

it('stops an interrupted download without decoding or replacing the current car', async () => {
  const controller = new AbortController();
  const parseAsync = vi.fn();
  const manager = new LoadingManager();
  const finished = vi.fn();
  const failed = vi.fn();
  manager.onLoad = finished;
  manager.onError = failed;
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
  const pending = loadCarModel(
    { parseAsync, manager },
    '/models/ferrari-f120-f40.glb',
    controller.signal,
  );
  controller.abort();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(parseAsync).not.toHaveBeenCalled();
  expect(finished).toHaveBeenCalledOnce();
  expect(failed).not.toHaveBeenCalled();
});

it('does not decode a stale response body or a failed download', async () => {
  const controller = new AbortController();
  const parseAsync = vi.fn();
  const manager = new LoadingManager();
  const finished = vi.fn();
  const failed = vi.fn();
  manager.onLoad = finished;
  manager.onError = failed;
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
    loadCarModel({ parseAsync, manager }, '/models/ferrari-f120-f40.glb', controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
  await expect(
    loadCarModel(
      { parseAsync, manager },
      '/models/ferrari-f120-f40.glb',
      new AbortController().signal,
    ),
  ).rejects.toThrow('503');
  expect(parseAsync).not.toHaveBeenCalled();
  expect(finished).toHaveBeenCalledTimes(2);
  expect(failed).toHaveBeenCalledOnce();
});
