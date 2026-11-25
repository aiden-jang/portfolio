import { useRef, type PointerEvent, type RefObject } from 'react';

export function useBeanToyDrag(
  hotspots: RefObject<HTMLDivElement>,
  playWithMouse: () => void,
  onDrag: () => void,
) {
  const toy = useRef<{ x: number; held: boolean } | null>(null);
  const dragging = useRef<{
    id: number;
    from: number;
    x: number;
    width: number;
    moved: boolean;
  } | null>(null);
  const suppressToyClick = useRef(false);
  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragging.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragging.current = null;
    if (toy.current) toy.current.held = false;
    if (drag.moved && event.type === 'pointerup') {
      suppressToyClick.current = true;
      playWithMouse();
    }
    delete event.currentTarget.dataset.dragging;
  }

  const toyDrag = {
    onPointerDown(event: PointerEvent<HTMLButtonElement>) {
      if (event.button !== 0 || !hotspots.current || dragging.current) return;
      suppressToyClick.current = false;
      const x = parseFloat(hotspots.current.style.getPropertyValue('--mouse-x')) / 100;
      if (!Number.isFinite(x)) return;
      const width = hotspots.current.getBoundingClientRect().width;
      if (!width) return;
      dragging.current = { id: event.pointerId, from: event.clientX, x, width, moved: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: PointerEvent<HTMLButtonElement>) {
      const drag = dragging.current;
      if (!drag || drag.id !== event.pointerId) return;
      const delta = event.clientX - drag.from;
      if (!drag.moved && Math.abs(delta) < 5) return;
      if (!drag.moved) {
        drag.moved = true;
        onDrag();
      }
      const x = drag.x + delta / drag.width;
      toy.current = { x: Math.max(0.25, Math.min(0.82, x)), held: true };
      event.currentTarget.dataset.dragging = '';
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  function onMouse() {
    if (suppressToyClick.current) suppressToyClick.current = false;
    else playWithMouse();
  }

  return { toy, toyDrag, onMouse };
}
