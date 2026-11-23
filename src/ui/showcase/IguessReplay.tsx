import { useEffect, useRef, useState } from 'react';
import round from './iguess-round.json';
import './iguess-replay.css';

const pointCount = round.strokes.reduce((total, stroke) => total + stroke.length, 0);
const answer = round.word[0]!.toUpperCase() + round.word.slice(1);
const guess = `“${round.guess.replace(/ \(.*\)$/, '')}”`;
const drawDuration = 2300;
const guessDuration = 1250;

function paint(canvas: HTMLCanvasElement, visible: number) {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 4.6;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = '#25241e';
  for (const stroke of round.strokes) {
    if (visible <= 0) break;
    context.beginPath();
    stroke.slice(0, visible).forEach(([x, y], index) => {
      const drawX = 162 + x * 636;
      const drawY = 22 + y * 558;
      if (index === 0) context.moveTo(drawX, drawY);
      else context.lineTo(drawX, drawY);
    });
    context.stroke();
    visible -= stroke.length;
  }
}

export function IguessReplay() {
  const demo = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [replay, setReplay] = useState(0);
  const [result, setResult] = useState('');

  useEffect(() => {
    const board = demo.current;
    const element = canvas.current;
    if (!board || !element) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame = 0;
    let elapsed = 0;
    let last = 0;
    let drawn = -1;
    let label = '';

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }

    function draw(now: number) {
      frame = 0;
      elapsed += last ? Math.min(64, now - last) : 0;
      last = now;
      const points = Math.round(pointCount * Math.min(elapsed / drawDuration, 1));
      if (points !== drawn && element) paint(element, points);
      drawn = points;
      const next =
        elapsed < drawDuration ? '' : elapsed < drawDuration + guessDuration ? guess : answer;
      if (label !== next) {
        setResult(next);
        label = next;
      }
      wake();
    }

    function wake() {
      if (visible && !document.hidden && !motion.matches && label !== answer && !frame)
        frame = requestAnimationFrame(draw);
    }

    function reset() {
      stop();
      elapsed = 0;
      drawn = motion.matches ? pointCount : 0;
      label = motion.matches ? answer : '';
      if (element) paint(element, drawn);
      setResult(label);
      wake();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry && entry.intersectionRatio >= 0.28;
        if (visible) wake();
        else stop();
      },
      { threshold: 0.28 },
    );
    const visibility = () => {
      if (document.hidden) stop();
      else wake();
    };
    observer.observe(board);
    motion.addEventListener('change', reset);
    document.addEventListener('visibilitychange', visibility);
    reset();
    return () => {
      stop();
      observer.disconnect();
      motion.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [replay]);

  return (
    <figure ref={demo} className="iguess-replay" aria-label="Recorded iguess drawing round">
      <canvas ref={canvas} width="960" height="605" aria-hidden="true" />
      <div className="iguess-replay-controls">
        <span className="iguess-replay-result" role="status">
          {result && <span key={result}>{result}</span>}
        </span>
        <button
          type="button"
          aria-label="Replay the drawing"
          onClick={() => setReplay((count) => count + 1)}
        >
          Replay
        </button>
      </div>
    </figure>
  );
}
