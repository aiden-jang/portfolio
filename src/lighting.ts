import { F40_INDEX } from './cars';
import type { ThemeName } from './types';

export const DEFAULT_LIGHTING = 'studio';
export const STUDIO_TALL_ASPECT = 0.43;
export const LIGHTING_MODES = ['studio', 'night'] as const;
export const LIGHTING_LABELS: Record<ThemeName, string> = {
  studio: 'Studio',
  dusk: 'Studio',
  night: 'After Hours',
};

export function parseLighting(value: string | null): ThemeName {
  // The old Night link selects After Hours. Dusk links open the default Studio.
  return value === 'night' ? 'night' : DEFAULT_LIGHTING;
}

export function readOpeningTheme() {
  return parseLighting(new URLSearchParams(globalThis.location?.search).get('light'));
}

export function nextLighting(theme: ThemeName) {
  return theme === 'night' ? 'studio' : 'night';
}

export function isOpeningStudio(state: {
  sectionIndex: number;
  isContactVisible: boolean;
  renderFinish: string | null;
}) {
  return state.sectionIndex === 0 && !state.isContactVisible && !state.renderFinish;
}

export function isOpeningLowLight(
  state: Parameters<typeof isOpeningStudio>[0] & { themeName: ThemeName },
) {
  return state.themeName === 'night' && isOpeningStudio(state);
}

export function openingHeadlights(carIndex: number, theme: ThemeName) {
  return carIndex !== F40_INDEX || theme === 'night';
}

export function openingLighting(
  state: { carIndex: number; themeName: ThemeName; headlightsRaised: boolean },
  themeName: ThemeName,
) {
  const usePreset = state.carIndex === F40_INDEX && themeName !== state.themeName;
  return {
    themeName,
    headlightsRaised: usePreset
      ? openingHeadlights(state.carIndex, themeName)
      : state.headlightsRaised,
  };
}
