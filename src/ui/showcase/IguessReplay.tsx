import { useCallback, useEffect, useRef, useState } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import { useTimedScene } from '../../hooks/useTimedScene';

import './iguess-replay.css';
import { frameCatDrawing } from './frameCatDrawing';
import { useDrawingMark } from './useDrawingMark';

import { paintCat, pointCount, firstStrokeLength } from './catDrawing';

const answer = 'Cat';
const guess = 'Two ears…';
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
    paintCat(master, pointCount, '#504047');
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

  const leafInk = useRef(-1);
  const fromLeaf = useRef(false);
  const lastProgress = useRef(0);
  const [guiding, setGuiding] = useState(false);
  useEffect(() => {
    const board = canvas.current!;
    const guide = (event: Event) => {
      const amount = (event as CustomEvent<number>).detail;
      const wasGuided = leafInk.current >= 0;
      leafInk.current = amount;
      if (wasGuided !== amount >= 0) setGuiding(amount >= 0);
      if ((amount < 0 && !wasGuided) || grip.current) return;
      const finished = board.closest('.duet')?.getAttribute('data-finish-cat') === 'true';
      const count = finished
        ? pointCount
        : Math.round(firstStrokeLength * (amount < 0 ? 1 : amount));
      if (amount < 0 && !finished) {
        fromLeaf.current = true;
        lastProgress.current = 0;
      }
      cache.current.drawn = count;
      paintCat(board, count);
      paintMarks();
    };
    board.addEventListener('leaf-ink', guide);
    return () => board.removeEventListener('leaf-ink', guide);
  }, [paintMarks]);
  const cache = useRef({ drawn: -1, label: '' });
  const draw = useCallback(
    (progress: number) => {
      const element = canvas.current;
      if (!element || leafInk.current >= 0) return;
      if (progress < lastProgress.current) fromLeaf.current = false;
      lastProgress.current = progress;
      const initial = fromLeaf.current ? firstStrokeLength : 0;
      const visible =
        element.closest('.duet')?.getAttribute('data-finish-cat') === 'true'
          ? pointCount
          : Math.round(initial + (pointCount - initial) * easedProgress(progress, 0, 0.59));
      if (cache.current.drawn !== visible) {
        paintCat(element, visible);
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
    paintCat(canvas.current, Math.max(0, cache.current.drawn));
    paintMarks();
  }, [paintMarks]);
  const finishDrawing = useTimedScene(demo, draw, {
    enabled: active && !holding && !guiding,
    duration: 3040,
    hold: 1250,
  });

  useEffect(() => {
    const el = canvas.current!;
    const lane = el.closest('.duet');
    const finish = () => {
      paintCat(el, pointCount);
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
