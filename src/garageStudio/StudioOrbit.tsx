import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { clamp } from '../math';
import { activeOrbit, repaintStudio } from './state';

export function StudioOrbit({
  enabled,
  onDrag,
}: {
  enabled: boolean;
  onDrag: (active: boolean) => void;
}) {
  const drag = useRef<{ pointer: number; x: number; y: number; yaw: number; pitch: number } | null>(
    null,
  );
  function begin(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || !enabled) return;
    const orbit = activeOrbit();
    orbit.yaw = orbit.shownYaw;
    drag.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      yaw: orbit.yaw,
      pitch: orbit.pitch,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    onDrag(true);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.pointer !== event.pointerId) return;
    const orbit = activeOrbit();
    orbit.yaw = start.yaw + (event.clientX - start.x) * 0.012;
    orbit.pitch = clamp(start.pitch - (event.clientY - start.y) * 0.0023, -0.18, 0.22);
    repaintStudio();
  }

  function end(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    onDrag(false);
  }

  function arrow(event: KeyboardEvent<HTMLDivElement>) {
    if (!enabled || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    activeOrbit().yaw += ((event.key === 'ArrowRight' ? 1 : -1) * Math.PI) / 18;
    repaintStudio();
  }

  return (
    <div
      className="garage-studio-stage"
      aria-label="Drag to orbit"
      role="region"
      tabIndex={0}
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onKeyDown={arrow}
    />
  );
}
