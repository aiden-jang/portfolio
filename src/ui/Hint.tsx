import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { COMMAND_MENU_EVENT } from './useCommandMenuEvents';
import { useGarageStudio } from '../garageStudio/state';
import './all-controls.css';

export function AllControlsButton() {
  return (
    <div className="garage-dock-actions">
      <button
        type="button"
        className="all-controls-trigger"
        aria-label="Garage controls"
        title="Garage controls"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          if (useAppStore.getState().sceneUnavailable)
            window.dispatchEvent(new Event(COMMAND_MENU_EVENT));
          else useGarageStudio.getState().open();
        }}
      >
        <span>Garage</span>
      </button>
      <button
        type="button"
        className="scene-control-button"
        aria-label="Garage tools"
        aria-haspopup="dialog"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          window.dispatchEvent(new Event(COMMAND_MENU_EVENT));
        }}
      >
        Tools
      </button>
    </div>
  );
}

export function Hint() {
  const [triedOrbit, setTriedOrbit] = useState(false);
  const sectionIndex = useAppStore((state) => state.sectionIndex);
  const loading = useAppStore((state) => state.isCarLoading);
  const error = useAppStore((state) => state.carLoadError);
  const manual = useAppStore((state) => state.hasManualView);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('orbiting')) setTriedOrbit(true);
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <>
      {sectionIndex === 0 && !loading && !error && !manual && !triedOrbit && (
        <p className="orbit-invitation">
          <span className="orbit-hint-desktop hidden md:inline">Drag the car to orbit.</span>
          <span className="orbit-hint-mobile md:hidden">Swipe sideways to orbit.</span>
        </p>
      )}
      <p className="orbit-status">Drag to orbit · release to scroll</p>
    </>
  );
}
