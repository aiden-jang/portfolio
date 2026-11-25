import { useCallback, useRef, useState } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import { useTimedScene } from '../../hooks/useTimedScene';
import round from './iguess-round.json';
import './iguess-replay.css';
import { useDrawingMark } from './useDrawingMark';

const pointCount = round.strokes.reduce((total, stroke) => total + stroke.length, 0);
const answer = round.word[0]!.toUpperCase() + round.word.slice(1);
const guess = `“${round.guess.replace(/ \(.*\)$/, '')}”`;

function paint(canvas: HTMLCanvasElement, visible: number) {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 7;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = '#f7f0df';
  let tip: number[] = [];
  for (const stroke of round.strokes) {
    if (visible <= 0) break;
    context.beginPath();
    stroke.slice(0, visible).forEach(([x, y], index) => {
      const drawX = 61 + x * 854;
      const drawY = -63 + y * 735;
      tip = [drawX, drawY];
      if (index === 0) context.moveTo(drawX, drawY);
      else context.lineTo(drawX, drawY);
    });
    context.stroke();
    visible -= stroke.length;
  }
  if (tip.length && visible < 0) {
    context.beginPath();
    context.fillStyle = '#f2ac79';
    context.arc(tip[0]!, tip[1]!, 8, 0, Math.PI * 2);
    context.fill();
  }
}

export function IguessReplay({ active }: { active: boolean }) {
  const demo = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState('');

  const { paint: paintMarks, ...strokes } = useDrawingMark(canvas);
  const grip = useRef(false);
  const [holding, setHolding] = useState(false);
  const takeover = useCallback(() => {
    grip.current = true;
    setHolding(true);
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
      const visible = Math.round(pointCount * (0.085 + 0.915 * easedProgress(progress, 0, 0.59)));
      if (cache.current.drawn !== visible) {
        paint(element, visible);
        paintMarks();
      }
      cache.current.drawn = visible;
      const next = progress > 0.77 ? answer : progress >= 0.27 ? guess : 'What is it?';
      if (next !== cache.current.label) {
        cache.current.label = next;
        setResult(next);
      }
    },
    [paintMarks],
  );
  function redraw() {
    if (!canvas.current) return;
    paint(canvas.current, Math.max(0, cache.current.drawn));
    paintMarks();
  }
  useTimedScene(demo, draw, { enabled: active && !holding, duration: 3040, hold: 1250 });

  return (
    <figure ref={demo} className="iguess-replay" aria-label="Recorded iguess drawing round">
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
          if (grip.current) release();
        }}
        onKeyDown={strokes.key(redraw)}
      />
      <div className="iguess-replay-controls" data-verdict={!holding && result === answer}>
        <small>
          {holding
            ? 'Your turn'
            : result === answer
              ? 'Answer'
              : result === guess
                ? 'AI guess'
                : 'Draw & guess'}
        </small>
        <span className="iguess-replay-result" role="status" aria-live="off">
          {holding ? (
            <span>Keep drawing</span>
          ) : result === guess ? (
            <>
              <span>“A rocket.”</span>
              <em>With reservations.</em>
            </>
          ) : (
            <span>{result}</span>
          )}
        </span>
        {!holding && result === answer && <s aria-hidden="true">A rocket.</s>}
      </div>
    </figure>
  );
}
