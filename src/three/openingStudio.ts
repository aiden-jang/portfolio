import { DEFAULT_CAR_INDEX, F40_INDEX } from '../config';
import { useAppStore } from '../store';

export const F40_PAINT = { roughness: 0.34, coatRoughness: 0.26, coat: 0.55 };

export function openingStudioWeight() {
  const { carIndex, isContactVisible, renderFinish } = useAppStore.getState();
  if (
    (carIndex !== F40_INDEX && carIndex !== DEFAULT_CAR_INDEX) ||
    isContactVisible ||
    renderFinish
  )
    return 0;
  return Math.max(0, 1 - scrollY / (innerHeight * 0.55));
}
