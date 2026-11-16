// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ScreenshotImage } from './ScreenshotImage';

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

it('settles a cached failed image instead of leaving a permanently busy broken element', async () => {
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0);
  const onUnavailable = vi.fn();
  await act(() =>
    root.render(
      createElement(ScreenshotImage, { src: '/failed.jpg', alt: 'Project', onUnavailable }),
    ),
  );
  expect(host.querySelector('img')).toBeNull();
  expect(host.querySelector('[role="status"]')?.textContent).toContain('Screenshot unavailable');
  expect(host.querySelector('[aria-busy="true"]')).toBeNull();
  expect(onUnavailable).toHaveBeenCalledOnce();
});

it('can replace a failed source with a working screenshot without carrying over failure or loading state', async () => {
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false);
  await act(() =>
    root.render(createElement(ScreenshotImage, { src: '/failed.jpg', alt: 'Project' })),
  );
  await act(() => host.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(host.querySelector('[role="status"]')).not.toBeNull();
  const onReady = vi.fn();
  await act(() =>
    root.render(createElement(ScreenshotImage, { src: '/working.jpg', alt: 'Project', onReady })),
  );
  expect(host.querySelector('img')?.getAttribute('src')).toBe('/working.jpg');
  await act(() => host.querySelector('img')!.dispatchEvent(new Event('load')));
  expect(host.querySelector('[aria-busy="true"]')).toBeNull();
  expect(host.querySelector('[role="status"]')).toBeNull();
  expect(onReady).toHaveBeenCalledOnce();
});

it('recognizes an already decoded image without flashing the loading state', async () => {
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1600);
  await act(() =>
    root.render(createElement(ScreenshotImage, { src: '/working.jpg', alt: 'Project' })),
  );
  expect(host.querySelector('img')?.getAttribute('aria-busy')).toBe('false');
});
