import { useEffect, useRef, useState } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import round from './iguess-round.json';
import './iguess-replay.css';

const pointCount = round.strokes.reduce((total, stroke) => total + stroke.length, 0);
const answer = round.word[0]!.toUpperCase() + round.word.slice(1);
const guess = `“${round.guess.replace(/ \(.*\)$/, '')}”`;

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
  const [result, setResult] = useState('');

  useEffect(() => {
    const element = canvas.current;
    const scene = demo.current?.closest('article');
    if (!scene || !element) return;
    let drawn = -1;
    let label = '';
    const draw = (progress: number) => {
      const visible = Math.round(pointCount * easedProgress(progress, 0.05, 0.65));
      if (drawn !== visible) paint(element, visible);
      drawn = visible;
      const next = progress > 0.86 ? answer : progress >= 0.66 ? guess : '';
      if (next !== label) setResult(next);
      label = next;
    };
    const update = (event: Event) => draw((event as CustomEvent<number>).detail);
    draw(Number(scene.dataset.sceneProgress ?? 0));
    scene.addEventListener('project-scene-progress', update);
    return () => scene.removeEventListener('project-scene-progress', update);
  }, []);

  return (
    <figure ref={demo} className="iguess-replay" aria-label="Recorded iguess drawing round">
      <canvas ref={canvas} width="960" height="605" aria-hidden="true" />
      <div className="iguess-replay-controls">
        <span className="iguess-replay-result" role="status">
          {result && <span key={result}>{result}</span>}
        </span>
      </div>
    </figure>
  );
}
