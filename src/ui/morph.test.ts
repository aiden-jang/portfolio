// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runMorph } from './morph';

type Handle = {
  resolveReady: () => void;
  rejectReady: (reason: unknown) => void;
  resolveFinished: () => void;
  callback: () => void;
};

/** Stands in for the View Transitions API so each promise can be settled on demand. */
function stubViewTransitions(): { handles: Handle[]; calls: () => number } {
  const handles: Handle[] = [];
  const start = (callback: () => void) => {
    let resolveReady!: () => void;
    let rejectReady!: (reason: unknown) => void;
    let resolveFinished!: () => void;
    const ready = new Promise<void>((res, rej) => {
      resolveReady = res;
      rejectReady = rej;
    });
    const finished = new Promise<void>((res) => {
      resolveFinished = res;
    });
    handles.push({ resolveReady, rejectReady, resolveFinished, callback });
    callback();
    return { ready, finished };
  };
  Object.defineProperty(document, 'startViewTransition', {
    value: start,
    configurable: true,
    writable: true,
  });
  return { handles, calls: () => handles.length };
}

function card(): HTMLElement {
  const el = document.createElement('button');
  document.body.append(el);
  return el;
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  Reflect.deleteProperty(document, 'startViewTransition');
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('runMorph', () => {
  it('does not leave an unhandled rejection when a transition is superseded', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    const { handles } = stubViewTransitions();

    runMorph(() => {}, card(), true);
    handles[0].rejectReady(new DOMException('Transition was aborted', 'InvalidStateError'));
    handles[0].resolveFinished();
    await settle();
    await settle();

    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });

  it('still clears the morph name after a superseded transition, so the card is reusable', async () => {
    const { handles } = stubViewTransitions();
    const el = card();

    runMorph(() => {}, el, true);
    handles[0].rejectReady(new DOMException('aborted', 'InvalidStateError'));
    handles[0].resolveFinished();
    await settle();
    await settle();

    expect(el.style.viewTransitionName).toBe('');
  });

  it('names the card before the snapshot when opening', () => {
    const { handles } = stubViewTransitions();
    const el = card();
    const seen: string[] = [];
    // The callback runs inside the transition, so record what the name was on the way in.
    runMorph(() => seen.push(el.style.viewTransitionName), el, true);

    expect(seen).toEqual(['work-morph']);
    expect(handles).toHaveLength(1);
  });

  it('hands the name to the card when closing, so the morph target is the card', () => {
    stubViewTransitions();
    const el = card();

    runMorph(() => {}, el, false);

    expect(el.style.viewTransitionName).toBe('work-morph');
  });

  it('applies the update exactly once', () => {
    stubViewTransitions();
    const update = vi.fn();

    runMorph(update, card(), true);

    expect(update).toHaveBeenCalledOnce();
  });

  it('updates without a transition when the browser has no support', () => {
    const update = vi.fn();

    runMorph(update, card(), true);

    expect(update).toHaveBeenCalledOnce();
  });

  it('survives a null element, which is what a direct deep link gives it', async () => {
    const { handles } = stubViewTransitions();
    const update = vi.fn();

    expect(() => runMorph(update, null, false)).not.toThrow();
    handles[0].resolveReady();
    handles[0].resolveFinished();
    await settle();
    expect(update).toHaveBeenCalledOnce();
  });
});
