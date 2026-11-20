import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useLineup } from './state';

const YAW_PER_PIXEL = 0.012;
const PITCH_PER_PIXEL = 0.0028;

type DragStart = {
  id: number;
  x: number;
  y: number;
  azimuth: number;
  pitch: number;
};

export function useLineupGesture() {
  const [dragging, setDragging] = useState(false);
  const origin = useRef<DragStart | null>(null);

  function start(event: PointerEvent<HTMLElement>) {
    const { status, orbit, stopOrbit } = useLineup.getState();
    if (status !== 'ready' || !event.isPrimary || event.button !== 0) return;
    stopOrbit();
    origin.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      azimuth: orbit.shownAzimuth,
      pitch: orbit.pitch,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLElement>) {
    const from = origin.current;
    if (!from || from.id !== event.pointerId) return;
    const x = event.clientX - from.x;
    const y = event.clientY - from.y;
    if (!dragging && Math.abs(x) + Math.abs(y) < 3) return;
    useLineup.getState().drag(from.azimuth + x * YAW_PER_PIXEL, from.pitch - y * PITCH_PER_PIXEL);
    if (!dragging) setDragging(true);
  }

  function end(event: PointerEvent<HTMLElement>) {
    if (origin.current?.id !== event.pointerId) return;
    origin.current = null;
    setDragging(false);
  }

  function key(event: KeyboardEvent<HTMLElement>) {
    const { status, orbit, drag } = useLineup.getState();
    if (status !== 'ready' || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    drag(orbit.shownAzimuth + (event.key === 'ArrowRight' ? 1 : -1) * (Math.PI / 12), orbit.pitch);
  }

  return {
    dragging,
    events: {
      onPointerDown: start,
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
      onLostPointerCapture: end,
      onKeyDown: key,
    },
  };
}
