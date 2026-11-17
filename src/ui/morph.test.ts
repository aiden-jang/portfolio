// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { runMorph } from './morph';
vi.mock('../hooks/reducedMotion', () => ({ prefersReducedMotion: () => reduced }));
let reduced = false;
const handles: { resolve: () => void; cancel: () => void }[] = [];
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
beforeEach(() => {
  reduced = false;
  handles.length = 0;
  document.body.innerHTML =
    '<div class="work-modal-overlay"><div class="work-modal-panel"></div></div>';
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: vi.fn(() => {
      let resolve!: () => void, reject!: (error: Error) => void;
      const finished = new Promise<void>((yes, no) => {
        resolve = yes;
        reject = no;
      });
      const cancel = vi.fn(() => reject(new DOMException('Cancelled', 'AbortError')));
      handles.push({ resolve, cancel });
      return { finished, cancel };
    }),
  });
});
afterEach(() => {
  reduced = true;
  runMorph(() => {}, null, false);
  document.body.innerHTML = '';
  Reflect.deleteProperty(Element.prototype, 'animate');
  vi.restoreAllMocks();
});
it('opens immediately so keyboard focus can enter the mounted reader', () => {
  const update = vi.fn();
  runMorph(update, null, true);
  expect(update).toHaveBeenCalledOnce();
  expect(handles).toHaveLength(2);
});
it('keeps the reader mounted until its exit finishes', async () => {
  const update = vi.fn();
  runMorph(update, null, false);
  expect(update).not.toHaveBeenCalled();
  handles.forEach((h) => h.resolve());
  await settle();
  expect(update).toHaveBeenCalledOnce();
});
it('cancels an entry cleanly when the reader is closed quickly', async () => {
  const unhandled = vi.fn();
  process.on('unhandledRejection', unhandled);
  runMorph(() => {}, null, true);
  const entry = [...handles];
  const close = vi.fn();
  runMorph(close, null, false);
  entry.forEach((h) => expect(h.cancel).toHaveBeenCalledOnce());
  handles.slice(2).forEach((h) => h.resolve());
  await settle();
  expect(close).toHaveBeenCalledOnce();
  expect(unhandled).not.toHaveBeenCalled();
  process.off('unhandledRejection', unhandled);
});
it('does not let a stale exit dismiss a newer reader', async () => {
  const stale = vi.fn(),
    next = vi.fn();
  runMorph(stale, null, false);
  runMorph(next, null, true);
  await settle();
  expect(stale).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalledOnce();
});
it('applies a closing update exactly once even after cancellation', async () => {
  const update = vi.fn();
  runMorph(update, null, false);
  handles.forEach((h) => h.cancel());
  await settle();
  expect(update).toHaveBeenCalledOnce();
});
it('skips both entry and exit motion for reduced motion', () => {
  reduced = true;
  const update = vi.fn();
  runMorph(update, null, true);
  runMorph(update, null, false);
  expect(update).toHaveBeenCalledTimes(2);
  expect(handles).toHaveLength(0);
});
it('falls back to direct updates when animation is unavailable', () => {
  Reflect.deleteProperty(Element.prototype, 'animate');
  const update = vi.fn();
  runMorph(update, null, true);
  expect(update).toHaveBeenCalledOnce();
});
it('closes a direct link safely even if its panel has already gone', () => {
  document.body.innerHTML = '';
  const update = vi.fn();
  runMorph(update, null, false);
  expect(update).toHaveBeenCalledOnce();
});
