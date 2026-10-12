import { useEffect, useRef } from 'react';
import { ColorSwatches } from './ColorSwatches';
import { RevButton } from './RevButton';
import { CameraResetButton } from './CameraResetButton';
import { ThemeToggle } from './ThemeToggle';
import { SceneShareButton } from './SceneShareButton';
import './garage-menu.css';

export function GarageMenu() {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) {
        menu.current.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        event.stopPropagation();
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);
  return (
    <details ref={menu} className="garage-menu">
      <summary>
        Garage <span aria-hidden="true">+</span>
      </summary>
      <div className="garage-menu-panel">
        <div className="garage-menu-heading">
          <span>Make yourself comfortable.</span>
          <button
            type="button"
            aria-label="Close Garage"
            onClick={() => {
              if (menu.current) menu.current.open = false;
              menu.current?.querySelector('summary')?.focus();
            }}
          >
            ×
          </button>
        </div>
        <p>Paint</p>
        <ColorSwatches bordered={false} />
        <div className="garage-menu-actions">
          <div>
            <span>Lighting</span>
            <ThemeToggle />
          </div>
          <div>
            <span>Camera</span>
            <CameraResetButton />
          </div>
          <div>
            <span>Engine</span>
            <RevButton />
          </div>
          <div>
            <span>Share setup</span>
            <SceneShareButton />
          </div>
        </div>
      </div>
    </details>
  );
}
