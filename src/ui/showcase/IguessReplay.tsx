import { useCallback, useEffect, useRef, useState } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import { useTimedScene } from '../../hooks/useTimedScene';

import './iguess-replay.css';
import { frameCatDrawing } from './frameCatDrawing';
import { useDrawingMark } from './useDrawingMark';

// A playable cat round for the match to Bean. Coordinates share her sitting pose.
const outlines = [
  [
    [2, 4],
    [1.7, 2],
    [2, 0.9],
    [3, 1],
    [5.5, 4],
    [8, 4.1],
    [11, 4],
    [14.8, 1],
  ],
  [
    [1.8, 4],
    [1.2, 7],
    [1.8, 9.5],
    [3.5, 11],
    [3.3, 14],
    [2.8, 16],
    [1.5, 17.2],
    [2.4, 18],
    [6, 18.2],
    [9, 18.4],
    [14.6, 18.1],
    [16.1, 17],
    [15.5, 16],
    [15.2, 12],
    [14.5, 10.5],
    [16.3, 9],
    [16.7, 6],
    [16, 4],
  ],
  [
    [4, 7.4],
    [4.8, 6.8],
    [5.7, 7.2],
  ],
  [
    [11.6, 7.2],
    [12.6, 6.8],
    [13.3, 7.3],
  ],
  [
    [7.3, 8.6],
    [8.3, 9.3],
    [9.2, 8.5],
  ],
  [
    [8.2, 9.4],
    [8.2, 9.8],
    [7.5, 10.2],
  ],
  [
    [8.2, 9.8],
    [9.2, 10.1],
  ],
  [
    [5.8, 13.8],
    [5.6, 16.5],
    [4.6, 17.4],
  ],
  [
    [11.9, 13.7],
    [12.1, 16.6],
    [13.1, 17.5],
  ],
  [
    [14.7, 1.1],
    [15.6, 0.7],
    [16.1, 1.5],
    [16, 4.2],
  ],
];
const paths = outlines.map((stroke) =>
  stroke.flatMap(([x, y], i) => {
    if (!i) return [[x, y]];
    const [a, b] = stroke[i - 1];
    const steps = Math.ceil(Math.hypot(x - a, y - b) * 4);
    return Array.from({ length: steps }, (_, j) => [
      a + ((x - a) * (j + 1)) / steps,
      b + ((y - b) * (j + 1)) / steps,
    ]);
  }),
);
const pointCount = paths.reduce((n, p) => n + p.length, 0);
const answer = 'Cat';
const guess = 'Two ears…';
function paint(canvas: HTMLCanvasElement, visible: number, ink = '#f7f0df') {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 960, 605);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  for (const path of paths) {
    if (visible <= 0) break;
    ctx.beginPath();
    path.slice(0, visible).forEach(([x, y], i) => {
      const sx = 300 + x * 20,
        sy = 112 + y * 20;
      if (i) ctx.lineTo(sx, sy);
      else ctx.moveTo(sx, sy);
    });
    ctx.stroke();
    visible -= path.length;
  }
}

export function IguessReplay({
  active,
  onAnswer,
  onPrint,
}: {
  active: boolean;
  onAnswer: () => void;
  onPrint: (print: HTMLCanvasElement | null) => void;
}) {
  const demo = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState('');
  const { paint: paintMarks, ...strokes } = useDrawingMark(canvas);
  const frameDrawing = useCallback(() => {
    const master = document.createElement('canvas');
    master.width = 960;
    master.height = 605;
    paint(master, pointCount, '#504047');
    paintMarks(master, '#197363');
    const paper = frameCatDrawing(master);
    onPrint(paper);
  }, [paintMarks, onPrint]);
  useEffect(frameDrawing, [frameDrawing]);
  const grip = useRef(false);
  const [used, setUsed] = useState(false);
  const [holding, setHolding] = useState(false);
  const takeover = useCallback(() => {
    grip.current = true;
    setHolding(true);
    setUsed(true);
    canvas.current
      ?.closest('.duet')
      ?.dispatchEvent(new CustomEvent('drawing-grip', { detail: true }));
  }, []);
  const release = useCallback(() => {
    grip.current = false;
    setHolding(false);
    canvas.current
      ?.closest('.duet')
      ?.dispatchEvent(new CustomEvent('drawing-grip', { detail: false }));
  }, []);

  const cache = useRef({ drawn: -1, label: '' });
  const draw = useCallback(
    (progress: number) => {
      const element = canvas.current;
      if (!element) return;
      const visible =
        element.closest('.duet')?.getAttribute('data-finish-cat') === 'true'
          ? pointCount
          : Math.round(pointCount * (0.18 + 0.82 * easedProgress(progress, 0, 0.59)));
      if (cache.current.drawn !== visible) {
        paint(element, visible);
        paintMarks();
      }
      cache.current.drawn = visible;
      const next =
        visible === pointCount || progress > 0.77
          ? answer
          : progress >= 0.27
            ? guess
            : 'What is it?';
      if (next !== cache.current.label) {
        cache.current.label = next;
        setResult(next);
        if (next === answer) onAnswer();
      }
    },
    [onAnswer, paintMarks],
  );
  const redraw = useCallback(() => {
    if (!canvas.current) return;
    paint(canvas.current, Math.max(0, cache.current.drawn));
    paintMarks();
  }, [paintMarks]);
  const finishDrawing = useTimedScene(demo, draw, {
    enabled: active && !holding,
    duration: 3040,
    hold: 1250,
  });

  useEffect(() => {
    const el = canvas.current!;
    const lane = el.closest('.duet');
    const finish = () => {
      paint(el, pointCount);
      paintMarks();
      setResult(answer);
      cache.current = { drawn: pointCount, label: answer };
    };
    const settle = () => finishDrawing(1, 1250);
    lane?.addEventListener('settle-drawing', settle);
    lane?.addEventListener('finish-cat', finish);
    return () => {
      lane?.removeEventListener('finish-cat', finish);
      lane?.removeEventListener('settle-drawing', settle);
    };
  }, [paintMarks, finishDrawing]);
  return (
    <figure ref={demo} className="iguess-replay" aria-label="Interactive cat drawing round">
      <canvas
        ref={canvas}
        className="iguess-draw-board"
        width="960"
        height="605"
        tabIndex={0}
        aria-label="Draw on the replay. Drag to draw. On touch, start sideways. You can also use the arrow keys. Press Escape to clear your marks."
        onPointerDown={strokes.start(() => {
          takeover();
          redraw();
        })}
        onPointerMove={strokes.move(() => {
          if (!grip.current) takeover();
          redraw();
        })}
        onLostPointerCapture={() => {
          strokes.stop();
          if (grip.current) {
            frameDrawing();
            release();
          }
        }}
        onKeyDown={strokes.key(() => {
          setUsed(true);
          redraw();
          frameDrawing();
        })}
      />
      {!used && (
        <span className="connect-draw-cue" aria-hidden="true">
          <span>Drag to draw</span>
          <span>Draw sideways to start</span>
        </span>
      )}
      <div className="iguess-replay-controls" data-verdict={result === answer && !holding}>
        <small>
          {holding
            ? 'Your turn'
            : result === answer
              ? 'Answer'
              : result === guess
                ? 'Recorded guess'
                : 'Draw & guess'}
        </small>
        <span className="iguess-replay-result" role="status" aria-live="off">
          {holding ? (
            <span>Keep drawing</span>
          ) : result === guess ? (
            <>
              <span>{guess}</span>
            </>
          ) : (
            <span>{result}</span>
          )}
        </span>
      </div>
    </figure>
  );
}
