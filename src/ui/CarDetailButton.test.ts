// @vitest-environment jsdom
import { act, createElement, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { useAppStore } from '../store';
import { CarDetailButton } from './CarDetailButton';
import { HeadlightButton } from './HeadlightButton';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

it('does not offer headlight interactions for the Supra', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  useAppStore.getState().setCarIndex(2);
  try {
    await act(() =>
      root.render(
        createElement(
          Fragment,
          null,
          createElement(CarDetailButton),
          createElement(HeadlightButton),
        ),
      ),
    );
    expect(host.querySelector('button')).toBeNull();
  } finally {
    await act(() => root.unmount());
    useAppStore.setState(useAppStore.getInitialState(), true);
  }
});
