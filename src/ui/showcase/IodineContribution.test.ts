// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { IodineContribution } from './IodineContribution';
import example from '../../data/iodineExample.json';
let host: HTMLDivElement, root: Root, mounted: boolean;
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  mounted = true;
});
afterEach(async () => {
  if (mounted) await act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('restores the recorded file and lets the visitor replay the edit', async () => {
  await act(() => root.render(createElement(IodineContribution)));
  expect(host.querySelector('code')!.textContent).toBe(example.after);
  const undo = host.querySelector<HTMLButtonElement>('.cinema-undo')!;
  await act(() => undo.click());
  expect(host.querySelector('code')!.textContent).toBe(example.restored);
  await act(() => undo.click());
  expect(host.querySelector('code')!.textContent).toBe(example.after);
});
it('completes a recorded replay without losing focus and cancels its pending timer on unmount', async () => {
  await act(() => root.render(createElement(IodineContribution)));
  const play = host.querySelector<HTMLButtonElement>('.cinema-code-actions button:last-child')!;
  play.focus();
  await act(() => play.click());
  expect(play.getAttribute('aria-disabled')).toBe('true');
  await act(() => vi.advanceTimersByTime(2399));
  expect(host.querySelector('code')!.textContent).toBe(example.after);
  await act(() => vi.advanceTimersByTime(1));
  expect(host.querySelector('code')!.textContent).toBe(example.restored);
  expect(document.activeElement).toBe(play);
  expect(play.getAttribute('aria-disabled')).toBe('false');
  await act(() => play.click());
  await act(() => root.unmount());
  mounted = false;
  expect(vi.getTimerCount()).toBe(0);
});
