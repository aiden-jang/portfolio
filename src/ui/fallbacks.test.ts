// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { WorkModalLinks } from './WorkModalLinks';
import { ScreenshotImage } from './ScreenshotImage';
import { SceneBoundary } from './SceneBoundary';
import { WorkModal } from './WorkModal';
import type { WorkDetail } from '../types';

let host: HTMLDivElement;
let root: Root;
it('removes closed story controls from keyboard navigation', async () => {
  const noop = () => {};
  await act(() =>
    root.render(
      createElement(WorkModal, {
        item: null,
        onClose: noop,
        onPrevious: noop,
        onNext: noop,
        position: null,
      }),
    ),
  );
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
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

it('provides a selectable story link when sharing and clipboard are unavailable', async () => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  const item = { title: 'Story', shortName: 'example', summary: 'A story' } as WorkDetail;
  await act(() => root.render(createElement(WorkModalLinks, { item })));
  await act(async () => host.querySelector('button')!.click());
  expect(host.querySelector('[role="status"]')?.textContent).toContain('Copy');
  expect(host.querySelector('input')?.value).toBe(window.location.href);
});

it('replaces a failed image with useful readable content', async () => {
  await act(() => root.render(createElement(ScreenshotImage, { src: '/missing.png', alt: 'App' })));
  await act(() => host.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(host.querySelector('img')).toBeNull();
  expect(host.querySelector('[role="status"]')?.textContent).toContain('project story');
});

it('keeps the portfolio readable when the scene fails', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  function BrokenScene(): null {
    throw new Error('WebGL unavailable');
  }
  await act(() =>
    root.render(
      createElement(
        'main',
        null,
        'Selected work',
        createElement(SceneBoundary, null, createElement(BrokenScene)),
      ),
    ),
  );
  expect(host.textContent).toContain('Selected work');
  expect(host.querySelector('[role="status"]')?.textContent).toContain('couldn’t start');
});
