import { afterEach, expect, it, vi } from 'vitest';
import { gzipSync } from 'node:zlib';
import { loadGeography } from './scene';
afterEach(() => vi.unstubAllGlobals());
it('accepts geography already decoded by the HTTP server', async () => {
  const data = new Uint8Array([1, 2, 3, 4]);
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(data, { headers: { 'content-encoding': 'gzip' } })),
  );
  expect(new Uint8Array(await loadGeography(new AbortController().signal))).toEqual(data);
});
it('decodes geography when a host serves the stored gzip bytes', async () => {
  const data = new Uint8Array([1, 2, 3, 4]);
  const compressed = gzipSync(data);
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(compressed)),
  );
  expect(new Uint8Array(await loadGeography(new AbortController().signal))).toEqual(data);
});
it('rejects a failed geography request so the screenshot fallback can recover', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('Unavailable', { status: 503 })),
  );
  await expect(loadGeography(new AbortController().signal)).rejects.toThrow(
    'Globe geography unavailable',
  );
});
