// @vitest-environment jsdom
import { act, createElement, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useDialogFocus } from './useDialogFocus';

let host: HTMLDivElement;
let trigger: HTMLButtonElement;
let root: Root;

function Dialog({ open }: { open: boolean }) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useDialogFocus(open, dialog, close);
  return open
    ? createElement(
        'div',
        { ref: dialog, role: 'dialog' },
        createElement('button', { ref: close }, 'Close'),
        createElement('div', { tabIndex: 0, role: 'region' }, 'Scrollable content'),
      )
    : null;
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  trigger = document.createElement('button');
  document.body.append(trigger, host);
  trigger.focus();
  root = createRoot(host);
});

afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
  trigger.remove();
  vi.restoreAllMocks();
});

it('focuses the dialog immediately and restores its opening button', async () => {
  await act(() => root.render(createElement(Dialog, { open: true })));
  expect(document.activeElement).toBe(host.querySelector('button'));
  await act(() => root.render(createElement(Dialog, { open: false })));
  expect(document.activeElement).toBe(trigger);
});

it('traps focus through scrollable regions and recovers from outside focus', async () => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
    { width: 100, height: 100 },
  ] as unknown as DOMRectList);
  await act(() => root.render(createElement(Dialog, { open: true })));
  const close = host.querySelector('button')!;
  const region = host.querySelector<HTMLElement>('[role="region"]')!;
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
  expect(document.activeElement).toBe(region);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
  expect(document.activeElement).toBe(close);
  trigger.focus();
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
  expect(document.activeElement).toBe(close);
});
