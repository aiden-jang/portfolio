// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { handleNavigationKey } from './navigationKeyboard';
import { useAppStore } from '../store';

afterEach(() => {
  vi.restoreAllMocks();
  useAppStore.setState(useAppStore.getInitialState(), true);
  document.body.replaceChildren();
});

const actions = () => ({ goToSection: vi.fn(), nextCar: vi.fn(), previousCar: vi.fn() });

it('preserves native reading keys in projects and keyboard input in controls', () => {
  const navigation = actions();
  const reading = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
  handleNavigationKey(reading, 2, navigation);
  expect(reading.defaultPrevented).toBe(false);
  expect(navigation.goToSection).not.toHaveBeenCalled();
  const button = document.createElement('button');
  document.body.append(button);
  button.addEventListener('keydown', (event) => handleNavigationKey(event, 0, navigation));
  button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  expect(navigation.nextCar).not.toHaveBeenCalled();
});

it('routes section and car keys independently and blocks numbered selection while loading', () => {
  const navigation = actions();
  handleNavigationKey(new KeyboardEvent('keydown', { key: 'ArrowDown' }), 1, navigation);
  expect(navigation.goToSection).toHaveBeenCalledWith(2);
  handleNavigationKey(new KeyboardEvent('keydown', { key: 'ArrowLeft' }), 0, navigation);
  expect(navigation.previousCar).toHaveBeenCalledOnce();
  useAppStore.setState({ carIndex: 0, isCarLoading: true });
  handleNavigationKey(new KeyboardEvent('keydown', { key: '2' }), 0, navigation);
  expect(useAppStore.getState().carIndex).toBe(0);
  useAppStore.setState({ isCarLoading: false });
  handleNavigationKey(new KeyboardEvent('keydown', { key: '2' }), 0, navigation);
  expect(useAppStore.getState().carIndex).toBe(1);
});

it('preserves browser shortcuts and keys another control already handled', () => {
  const navigation = actions();
  const cycle = vi.spyOn(useAppStore.getState(), 'cycleBodyColor');
  for (const options of [
    { key: 'c', ctrlKey: true },
    { key: 'c', metaKey: true },
    { key: 'ArrowLeft', altKey: true },
    { key: 'Home', ctrlKey: true },
  ]) {
    const event = new KeyboardEvent('keydown', { ...options, cancelable: true });
    handleNavigationKey(event, 0, navigation);
    expect(event.defaultPrevented).toBe(false);
  }
  const handled = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
  handled.preventDefault();
  handleNavigationKey(handled, 0, navigation);
  expect(cycle).not.toHaveBeenCalled();
  expect(navigation.goToSection).not.toHaveBeenCalled();
  expect(navigation.previousCar).not.toHaveBeenCalled();
});
