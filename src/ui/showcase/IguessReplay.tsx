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
      const visible = Math.round(pointCount * (0.085 + 0.915 * easedProgress(progress, 0, 0.59)));
      if (drawn !== visible) paint(element, visible);
      drawn = visible;
      const next = progress > 0.77 ? answer : progress >= 0.27 ? guess : 'What is it?';
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
      <div className="iguess-replay-controls" data-verdict={result === answer}>
        <small>
          {result === answer ? 'Answer' : result === guess ? 'AI guess' : 'Draw & guess'}
        </small>
        <span className="iguess-replay-result" role="status">
          {result === guess ? (
            <>
              <span>“A rocket.”</span>
              <em>With reservations.</em>
            </>
          ) : (
            <span>{result}</span>
          )}
        </span>
        {result === answer && <s aria-hidden="true">A rocket.</s>}
      </div>
    </figure>
  );
}
