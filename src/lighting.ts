import type { ThemeName } from './types';

export const DEFAULT_LIGHTING = 'studio';
export const STUDIO_TALL_ASPECT = 0.43;
export const LIGHTING_MODES = ['studio', 'dusk', 'night'] as const;
export const LIGHTING_LABELS: Record<ThemeName, string> = {
  studio: 'Studio',
  dusk: 'Dusk',
  night: 'Night',
};

export function parseLighting(value: string | null): ThemeName {
  return value === 'dusk' || value === 'night' ? value : DEFAULT_LIGHTING;
}

export function nextLighting(theme: ThemeName) {
  return LIGHTING_MODES[(LIGHTING_MODES.indexOf(theme) + 1) % LIGHTING_MODES.length];
}

export function isOpeningStudio(state: {
  themeName: ThemeName;
  sectionIndex: number;
  isContactVisible: boolean;
  renderFinish: string | null;
}) {
  return (
    state.themeName === 'studio' &&
    state.sectionIndex === 0 &&
    !state.isContactVisible &&
    !state.renderFinish
  );
}
