// @vitest-environment jsdom
import { act, createElement, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import * as THREE from 'three';
import { useAppStore } from '../store';
import { ColorSwatches, MobileColorButton } from './ColorSwatches';

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  useAppStore.setState(useAppStore.getInitialState(), true);
  const state = useAppStore.getState();
  state.setCarIndex(6);
  state.refs.bodyMaterial = new THREE.MeshStandardMaterial();
  state.refs.bodyOriginalColor = state.refs.bodyMaterial.color!.clone();
  state.setHasBodyMaterial(true);
});
afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
  useAppStore.setState(useAppStore.getInitialState(), true);
});

it('shows the actual named default and keeps mobile paint in sync with swatches', async () => {
  await act(() =>
    root.render(
      createElement(Fragment, null, createElement(ColorSwatches), createElement(MobileColorButton)),
    ),
  );
  const swatches = host.querySelectorAll<HTMLButtonElement>('[data-color-swatch]');
  expect(swatches.length).toBe(7);
  const defaultButton = host.querySelector<HTMLButtonElement>(
    '[aria-label="Paint: Amber Gold (default)"]',
  )!;
  expect(defaultButton.getAttribute('aria-pressed')).toBe('true');
  expect(defaultButton.style.background).toBe('rgb(156, 97, 43)');
  await act(() => host.querySelector<HTMLButtonElement>('[aria-label="Paint: Bordeaux"]')!.click());
  expect(host.querySelector('[aria-label="Paint: Bordeaux. Change color"]')).not.toBeNull();
  await act(() => defaultButton.click());
  expect(host.querySelector('[aria-label="Paint: Amber Gold. Change color"]')).not.toBeNull();
});

it('names old linked colors and cycles back to the car default', async () => {
  useAppStore.getState().applyBodyColor('#ff6b1c');
  await act(() => root.render(createElement(MobileColorButton)));
  const button = host.querySelector<HTMLButtonElement>('button')!;
  expect(button.getAttribute('aria-label')).toBe('Paint: Custom. Change color');
  await act(() => button.click());
  expect(button.getAttribute('aria-label')).toBe('Paint: Amber Gold. Change color');
  expect(useAppStore.getState().activeBodyColor).toBe('original');
});
