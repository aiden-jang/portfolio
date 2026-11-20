import { useRef } from 'react';
import { CarBrowser } from '../ui/CarBrowser';
import { chooseStudioCar } from './matchedSwap';
import { repaintStudio } from './state';

export function StudioCarPicker({
  onClose,
  returnFocus,
}: {
  onClose: () => void;
  returnFocus: HTMLButtonElement | null;
}) {
  const selection = useRef<number | null>(null);
  return (
    <CarBrowser
      returnFocus={returnFocus}
      onChoose={(car) => {
        selection.current = car;
      }}
      onClose={() => {
        onClose();
        if (selection.current !== null) chooseStudioCar(selection.current);
        requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
        repaintStudio();
      }}
    />
  );
}
