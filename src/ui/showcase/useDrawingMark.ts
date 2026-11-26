import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react';

type Point = [number, number];

function location(canvas: HTMLCanvasElement, x: number, y: number): Point {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
  return [
    (x - rect.left - (rect.width - canvas.width * scale) / 2) / scale,
    (y - rect.top - (rect.height - canvas.height * scale) / 2) / scale,
  ];
}

export function useDrawingMark(canvas: RefObject<HTMLCanvasElement>) {
  const paths = useRef<Point[][]>([]);
  const pointer = useRef<number | null>(null);
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const keyboard = useRef<Point>([510, 260]);
  const drawingTouch = useRef(false);
  useEffect(() => {
    const board = canvas.current;
    if (!board) return;
    const keepDrawing = (event: TouchEvent) => {
      if (pointer.current === null || event.touches.length !== 1) return;
      const origin = touchOrigin.current;
      const finger = event.touches[0]!;
      if (
        drawingTouch.current ||
        (origin &&
          Math.abs(finger.clientX - origin.x) > 7 &&
          Math.abs(finger.clientX - origin.x) > Math.abs(finger.clientY - origin.y))
      ) {
        if (event.cancelable) event.preventDefault();
      }
    };
    board.addEventListener('touchmove', keepDrawing, { passive: false });
    return () => board.removeEventListener('touchmove', keepDrawing);
  }, [canvas]);
  const paint = useCallback(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!element || !ctx) return;
    ctx.strokeStyle = '#80e8d2';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const points of paths.current) {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      if (points.length === 1) ctx.lineTo(points[0][0] + 0.1, points[0][1]);
      else for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
      ctx.stroke();
    }
    element.toggleAttribute('data-marked', paths.current.length > 0);
  }, [canvas]);
  return {
    paint,
    print: () => {
      const points = paths.current.flat();
      if (!points.length) return null;
      const minX = Math.min(...points.map(([x]) => x));
      const minY = Math.min(...points.map(([, y]) => y));
      const width = Math.max(1, Math.max(...points.map(([x]) => x)) - minX);
      const height = Math.max(1, Math.max(...points.map(([, y]) => y)) - minY);
      const paper = document.createElement('canvas');
      paper.width = 300;
      paper.height = 180;
      const ink = paper.getContext('2d');
      if (!ink) return null;
      const scale = Math.min(220 / width, 138 / height);
      const xOffset = (paper.width - width * scale) / 2;
      const yOffset = (paper.height - height * scale) / 2;
      ink.strokeStyle = '#493966';
      ink.lineWidth = Math.max(4, Math.min(12, 6 * scale));
      ink.lineCap = 'round';
      ink.lineJoin = 'round';
      for (const path of paths.current) {
        ink.beginPath();
        path.forEach(([x, y], index) => {
          const px = (x - minX) * scale + xOffset;
          const py = (y - minY) * scale + yOffset;
          if (index) ink.lineTo(px, py);
          else {
            ink.moveTo(px, py);
            if (path.length === 1) ink.lineTo(px + 0.01, py);
          }
        });
        ink.stroke();
      }
      return paper;
    },
    start: (redraw: () => void) => (event: PointerEvent<HTMLCanvasElement>) => {
      if (event.button !== 0 || pointer.current !== null) return;
      const element = event.currentTarget;
      const point = location(element, event.clientX, event.clientY);
      if (point[0] < 0 || point[0] > element.width || point[1] < 0 || point[1] > element.height)
        return;
      pointer.current = event.pointerId;
      element.setPointerCapture(event.pointerId);
      if (event.pointerType === 'touch') {
        touchOrigin.current = { x: event.clientX, y: event.clientY };
        return;
      }
      paths.current = [...paths.current.slice(-23), [point]];
      redraw();
    },
    move: (redraw: () => void) => (event: PointerEvent<HTMLCanvasElement>) => {
      if (pointer.current !== event.pointerId) return;
      const origin = touchOrigin.current;
      if (origin) {
        const x = Math.abs(event.clientX - origin.x);
        const y = Math.abs(event.clientY - origin.y);
        if (x < 6 || x < y) return;
        paths.current = [
          ...paths.current.slice(-23),
          [location(event.currentTarget, origin.x, origin.y)],
        ];
        touchOrigin.current = null;
        drawingTouch.current = true;
      }
      const path = paths.current.at(-1);
      if (!path || path.length >= 600) return;
      path.push(location(event.currentTarget, event.clientX, event.clientY));
      redraw();
    },
    stop: () => {
      pointer.current = null;
      touchOrigin.current = null;
      drawingTouch.current = false;
    },
    key: (redraw: () => void) => (event: KeyboardEvent<HTMLCanvasElement>) => {
      const step: Record<string, Point> = {
        ArrowUp: [0, -15],
        ArrowDown: [0, 15],
        ArrowLeft: [-15, 0],
        ArrowRight: [15, 0],
      };
      if (event.key === 'Escape') {
        paths.current = [];
      } else if (event.key in step) {
        const [x, y] = keyboard.current;
        const [dx, dy] = step[event.key];
        const next: Point = [
          Math.max(0, Math.min(event.currentTarget.width, x + dx)),
          Math.max(0, Math.min(event.currentTarget.height, y + dy)),
        ];
        paths.current = [...paths.current.slice(-23), [[x, y], next]];
        keyboard.current = next;
      } else return;
      event.preventDefault();
      redraw();
    },
  };
}
