import { clearSignatureBookmark } from './studioTour';
import { useEffect, useRef, useState } from 'react';
import { captureScene } from '../ui/photo/capture';
import { useAppStore } from '../store';
import { CarBrowser } from '../ui/CarBrowser';
import { chooseStudioCar } from './matchedSwap';
import { repaintStudio } from './state';

export function StudioCarPicker({
  onClose,
  returnFocus,
  matched,
}: {
  matched: boolean;
  onClose: () => void;
  returnFocus: HTMLButtonElement | null;
}) {
  const selection = useRef<number | null>(null);
  const [still, setStill] = useState('');
  useEffect(() => {
    const { isCarLoading, carLoadError } = useAppStore.getState();
    if (!matched || isCarLoading || carLoadError) return;
    let current = true;
    let url = '';
    void captureScene().then(
      (blob) => {
        if (!current) return;
        url = URL.createObjectURL(blob);
        setStill(url);
      },
      () => {},
    );
    return () => {
      current = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [matched]);
  return (
    <CarBrowser
      returnFocus={returnFocus}
      matched={matched}
      still={still}
      onChoose={(car) => {
        selection.current = car;
      }}
      onClose={() => {
        onClose();
        if (selection.current !== null) {
          clearSignatureBookmark();
          chooseStudioCar(selection.current);
        }
        requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
        repaintStudio();
      }}
    />
  );
}
