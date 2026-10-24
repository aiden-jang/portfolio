// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Sections } from './Sections';
import { runMorph } from './morph';
import { WORK_ITEMS } from '../data/workItems';
import type { WorkDetail } from '../types';

vi.mock('./morph', () => ({ runMorph: vi.fn((update: () => void) => update()) }));
vi.mock('./sections/Intro', () => ({ IntroSection: () => null }));
vi.mock('./sections/Experience', () => ({ ExperienceSection: () => null }));
vi.mock('./sections/About', () => ({ AboutSection: () => null }));
vi.mock('./sections/Contact', () => ({ ContactSection: () => null }));
vi.mock('./sections/Work', () => ({
  WorkSection: ({ onOpen }: { onOpen: (item: WorkDetail, el: HTMLElement) => void }) =>
    createElement(
      'button',
      {
        onClick: (event) =>
          onOpen(
            WORK_ITEMS.find((item) => item.shortName === 'bloomnote')!,
            event.currentTarget,
          ),
      },
      'Open story',
    ),
}));
vi.mock('./WorkModal', () => ({
  WorkModal: ({ item }: { item: WorkDetail | null }) =>
    item ? createElement('div', { role: 'dialog' }, item.title) : null,
}));

it('morphs a history close once even when popstate and hashchange report the same route', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const originalUrl = location.href;
  history.replaceState(null, '', '#sec-work');
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(() => root.render(createElement(Sections)));
    await act(() => host.querySelector('button')!.click());
    expect(host.querySelector('[role="dialog"]')).not.toBeNull();
    vi.mocked(runMorph).mockClear();
    history.replaceState(null, '', '#sec-work');
    await act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(runMorph).toHaveBeenCalledOnce();
    expect(vi.mocked(runMorph).mock.calls[0][2]).toBe(false);
  } finally {
    await act(() => root.unmount());
    host.remove();
    history.replaceState(null, '', originalUrl);
    vi.clearAllMocks();
  }
});
