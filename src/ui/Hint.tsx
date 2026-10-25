import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { COMMAND_MENU_EVENT } from './CommandMenu';
import './all-controls.css';

export function AllControlsButton() {
  return (
    <button
      type="button"
      className="all-controls-trigger"
      aria-label="All controls"
      title="All controls"
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        window.dispatchEvent(new Event(COMMAND_MENU_EVENT));
      }}
    >
      <span aria-hidden="true">···</span>
      <span>All controls</span>
    </button>
  );
}

export function Hint() {
  const [triedOrbit, setTriedOrbit] = useState(false);
  const sectionIndex = useAppStore((state) => state.sectionIndex);
  const loading = useAppStore((state) => state.isCarLoading);
  const error = useAppStore((state) => state.carLoadError);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('orbiting')) setTriedOrbit(true);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return (
    <>
      {sectionIndex === 0 && !loading && !error && (
        <p className={`orbit-invitation ${triedOrbit ? 'orbit-invitation-used' : ''}`}>
          <span className="hidden md:inline">Drag to look around.</span>
          <span className="md:hidden">Hold the car, then drag to look around.</span>
        </p>
      )}
      <p className="orbit-status">Drag to orbit · release to scroll</p>
    </>
  );
}
