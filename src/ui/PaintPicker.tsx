import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CARS } from '../config';
import { paintFinish } from '../paint';
import { useAppStore } from '../store';
import { ColorSwatches } from './ColorSwatches';

export function PaintPicker() {
  const car = CARS[useAppStore((state) => state.carIndex)];
  const color = useAppStore((state) => state.activeBodyColor);
  const enabled = useAppStore((state) => state.hasBodyMaterial);
  const finish = paintFinish(car, color);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const id = useId();
  useLayoutEffect(() => {
    const element = panel.current!;
    element.setAttribute('popover', 'auto');
    trigger.current?.setAttribute('popovertarget', id);
    const sync = () => setOpen(element.matches(':popover-open'));
    element.addEventListener('toggle', sync);
    return () => element.removeEventListener('toggle', sync);
  }, [id]);
  const close = () => {
    panel.current?.hidePopover();
    trigger.current?.focus({ preventScroll: true });
  };
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="scene-control-button compact-paint-trigger"
        aria-label={`Paint: ${finish.name}. Choose paint`}
        aria-expanded={open}
        aria-controls={id}
        disabled={!enabled}
      >
        <span className="mobile-paint-chip" style={{ background: finish.hex }} />
        <span className="compact-paint-name">{finish.name}</span>
        <span className="compact-paint-label">Paint</span>
      </button>
      {createPortal(
        <div
          ref={panel}
          id={id}
          className="paint-picker-panel"
          role="group"
          aria-label="Paint colors"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              close();
            }
          }}
          onClick={(event) => {
            if ((event.target as Element).closest('[data-color-swatch]')) close();
          }}
        >
          <p>Choose paint</p>
          <ColorSwatches bordered={false} />
        </div>,
        document.body,
      )}
    </>
  );
}
