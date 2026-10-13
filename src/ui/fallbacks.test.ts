// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { WorkModalLinks } from './WorkModalLinks';
import { ScreenshotImage } from './ScreenshotImage';
import { SceneBoundary } from './SceneBoundary';
import { WorkModal } from './WorkModal';
import { ContactSection } from './sections/Contact';
import { CommandMenu } from './CommandMenu';
import type { WorkDetail } from '../types';

let host: HTMLDivElement;
let root: Root;
it('does not open command controls over another dialog', async () => {
  const blocker = document.createElement('div');
  blocker.setAttribute('role', 'dialog');
  document.body.append(blocker);
  try {
    await act(() => root.render(createElement(CommandMenu, { onSection: () => {} })));
    await act(() =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })),
    );
    expect(document.querySelector('[aria-label="Command menu"]')).toBeNull();
  } finally {
    blocker.remove();
  }
});
it('marks a pending screenshot busy until the image loads', async () => {
  await act(() => root.render(createElement(ScreenshotImage, { src: '/pending.png', alt: 'App' })));
  const image = host.querySelector('img')!;
  expect(image.getAttribute('aria-busy')).toBe('true');
  await act(() => image.dispatchEvent(new Event('load')));
  expect(image.getAttribute('aria-busy')).toBe('false');
});

it('keeps the latest copy feedback when an earlier request finishes afterward', async () => {
  let resolveFirst!: () => void;
  const first = new Promise<void>((resolve) => {
    resolveFirst = resolve;
  });
  const writeText = vi.fn().mockReturnValueOnce(first).mockRejectedValueOnce(new Error('Denied'));
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  await act(() => root.render(createElement(ContactSection)));
  const copy = host.querySelector<HTMLButtonElement>('[aria-label="Copy email address"]')!;
  await act(() => copy.click());
  await act(async () => copy.click());
  await act(async () => resolveFirst());
  expect(host.querySelector('.contact-copy-status')?.textContent).toContain('select the address');
  expect(copy.textContent).toBe('Copy unavailable');
});
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
