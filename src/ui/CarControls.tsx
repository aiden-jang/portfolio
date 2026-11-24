import { CARS } from '../config';
import { useAppStore } from '../store';
import { CarPicker } from './CarPicker';
import { ColorSwatches, MobileColorButton } from './ColorSwatches';
import { CarDetailButton } from './CarDetailButton';
import { HeadlightButton } from './HeadlightButton';
import { MobileThemeButton, ThemeToggle } from './ThemeToggle';
import { Hint, AllControlsButton } from './Hint';
import './car-controls.css';
import { useEffect, useRef } from 'react';
import { PaintPicker } from './PaintPicker';
import { usePhotoMode } from './photo/state';
import { CarZoomControls } from './CarZoomControls';

function CarActionSlot() {
  return (
    <div className="car-action-slot">
      <HeadlightButton />
      <CarDetailButton />
    </div>
  );
}

function IntroActions() {
  const openPhoto = usePhotoMode((state) => state.open);
  const loading = useAppStore((state) => state.isCarLoading);
  const failed = useAppStore((state) => Boolean(state.carLoadError));
  return (
    <div className="intro-actions">
      <button
        type="button"
        aria-label="Photo mode"
        className="scene-control-button"
        disabled={loading || failed}
        onClick={(event) => openPhoto(event.currentTarget)}
      >
        Photo
      </button>
      <AllControlsButton />
    </div>
  );
}

export function CarControls() {
  const carIndex = useAppStore((state) => state.carIndex);
  const fixedLivery = CARS[carIndex].fixedLivery;
  const sectionIndex = useAppStore((state) => state.sectionIndex);
  const visible = sectionIndex === 0;
  const unavailable = useAppStore((state) => state.sceneUnavailable);
  const loading = useAppStore((state) => state.isCarLoading);
  const retrying = useRef(false);
  useEffect(() => {
    if (unavailable) retrying.current = true;
    else if (!loading && retrying.current) {
      retrying.current = false;
      Array.from(document.querySelectorAll<HTMLButtonElement>('.car-browse-trigger'))
        .find((element) => element.getClientRects().length)
        ?.focus({ preventScroll: true });
    }
  }, [loading, unavailable]);
  if (unavailable) return null;
  return (
    <>
      <div
        id="mobile-bar"
        style={visible ? undefined : { display: 'none' }}
        className="
              md:hidden fixed inset-x-0 bottom-0 z-30 pointer-events-none
              flex flex-col items-center pt-5 pb-[max(16px,env(safe-area-inset-bottom))]
              bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/70 to-transparent
            "
      >
        {visible && (
          <div className="car-controls-row">
            <div className="car-view-row">
              <CarPicker mobile />
              <CarZoomControls />
            </div>
            <div className="car-control-buttons">
              <div className="car-paint-slot" data-fixed-livery={fixedLivery || undefined}>
                {fixedLivery ? <span className="car-livery">Livery</span> : <MobileColorButton />}
              </div>
              <MobileThemeButton />
              <CarActionSlot />
              <IntroActions />
            </div>
          </div>
        )}
      </div>
      {visible && (
        <div
          id="desktop-dock"
          className="
              hidden md:flex justify-center fixed left-1/2 -translate-x-1/2 bottom-8 z-20
              pointer-events-none
            "
        >
          <div className="car-controls-row">
            <CarPicker />
            <CarActionSlot />
            <div className="car-paint-slot" data-fixed-livery={fixedLivery || undefined}>
              {fixedLivery ? (
                <span className="car-livery">Original livery</span>
              ) : (
                <>
                  <div className="desktop-paint-swatches">
                    <ColorSwatches bordered={false} />
                  </div>
                  <PaintPicker />
                </>
              )}
            </div>
            <CarZoomControls />
            <ThemeToggle />
            <IntroActions />
          </div>
        </div>
      )}
      {visible && <Hint />}
    </>
  );
}
