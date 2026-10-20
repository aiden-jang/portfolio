// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScenePaused } from './useScenePaused';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let host: HTMLDivElement;
function Probe() {
  return createElement('output', null, String(useScenePaused()));
}
async function change(update: () => void) {
  await act(async () => update());
}
beforeEach(async () => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await change(() => root.render(createElement(Probe)));
});
afterEach(async () => {
  await change(() => root.unmount());
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('scene suspension', () => {
  it('pauses for an open native dialog and resumes after it closes', async () => {
    const dialog = document.createElement('dialog');
    await change(() => document.body.append(dialog));
    expect(host.textContent).toBe('false');
    await change(() => dialog.setAttribute('open', ''));
    expect(host.textContent).toBe('true');
    await change(() => dialog.removeAttribute('open'));
    expect(host.textContent).toBe('false');
  });
  it('stays paused until the last visible custom modal is dismissed', async () => {
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    const second = modal.cloneNode() as HTMLElement;
    await change(() => document.body.append(modal, second));
    expect(host.textContent).toBe('true');
    await change(() => modal.remove());
    expect(host.textContent).toBe('true');
    await change(() => second.setAttribute('aria-hidden', 'true'));
    expect(host.textContent).toBe('false');
  });
  it('suspends a hidden tab and resumes when it becomes visible', async () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    await change(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(host.textContent).toBe('true');
    hidden.mockReturnValue(false);
    await change(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(host.textContent).toBe('false');
  });
});
