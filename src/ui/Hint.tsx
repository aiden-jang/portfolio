import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { COMMAND_MENU_EVENT } from './CommandMenu';
import './keyboard-legend.css';

export function Hint() {
  const [triedOrbit, setTriedOrbit] = useState(false);
  const sectionIndex = useAppStore((state) => state.sectionIndex);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('orbiting')) setTriedOrbit(true);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return (
    <>
      {sectionIndex === 0 && (
        <p className={`orbit-invitation ${triedOrbit ? 'orbit-invitation-used' : ''}`}>
          <span className="hidden md:inline">Drag to look around.</span>
          <span className="md:hidden">Hold the car, then drag to look around.</span>
        </p>
      )}
      <p className="orbit-status">Drag to orbit · release to scroll</p>
      <div id="hint" className="keyboard-legend" aria-label="Car controls and keyboard shortcuts">
        <span>
          <kbd>←</kbd>
          <kbd>→</kbd> Car
        </span>
        <span>
          <kbd>C</kbd> Paint
        </span>
        <span>
          <kbd>B</kbd> Lighting
        </span>
        <button type="button" onClick={() => window.dispatchEvent(new Event(COMMAND_MENU_EVENT))}>
          <kbd>?</kbd> All controls
        </button>
      </div>
    </>
  );
}
