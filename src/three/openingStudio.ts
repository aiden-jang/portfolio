import { useAppStore } from '../store';

export const F40_PAINT = { roughness: 0.34, coatRoughness: 0.26, coat: 0.55 };

export function openingStudioWeight() {
  const { carIndex, themeName, isContactVisible, renderFinish } = useAppStore.getState();
  if (carIndex !== 0 || themeName !== 'dusk' || isContactVisible || renderFinish) return 0;
  return Math.max(0, 1 - scrollY / (innerHeight * 0.55));
}
