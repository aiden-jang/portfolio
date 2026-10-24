// @vitest-environment jsdom
import { act, createElement, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useMagnetic } from './useMagnetic';

it('stops an active pointer offset when reduced motion changes and resumes when allowed', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  let reduced = false;
  const preference = new EventTarget();
  Object.defineProperty(preference, 'matches', { get: () => reduced });
  vi.stubGlobal('matchMedia', (query: string) =>
    query.includes('hover') ? { matches: false } : preference,
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  function Control() {
    const ref = useRef<HTMLButtonElement>(null);
    useMagnetic(ref);
    return createElement('button', { ref }, 'Contact');
  }
  try {
    await act(() => root.render(createElement(Control)));
    const control = host.querySelector('button')!;
    vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 40));
    const move = () =>
      control.dispatchEvent(new MouseEvent('mousemove', { clientX: 90, clientY: 30 }));
    move();
    expect(control.style.transform).not.toBe('');
    reduced = true;
    preference.dispatchEvent(new Event('change'));
    expect(control.style.transform).toBe('');
    move();
    expect(control.style.transform).toBe('');
    reduced = false;
    preference.dispatchEvent(new Event('change'));
    move();
    expect(control.style.transform).not.toBe('');
  } finally {
    await act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
});
