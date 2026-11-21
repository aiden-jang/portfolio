import { useEffect, useRef, useState } from 'react';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { ControlIcon } from '../ControlIcon';
import round from './iguess-round.json';
import './iguess-replay.css';

const pointCount = round.strokes.reduce((total, stroke) => total + stroke.length, 0);
const firstLook = round.strokes.slice(0, 3).reduce((total, stroke) => total + stroke.length, 0);

function paint(canvas: HTMLCanvasElement, visible: number) {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 5;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = '#22231b';
  for (const stroke of round.strokes) {
    if (visible <= 0) break;
    context.beginPath();
    stroke.slice(0, visible).forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x * canvas.width, y * canvas.height);
      else context.lineTo(x * canvas.width, y * canvas.height);
    });
    context.stroke();
    visible -= stroke.length;
  }
}

export function IguessReplay({ image, caption }: { image: string; caption: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const inspector = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<'ready' | 'drawing' | 'guess' | 'answer'>('ready');
  const [open, setOpen] = useState(false);
  const ended = phase === 'guess' || phase === 'answer';

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    if (phase === 'ready' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          paint(element, firstLook);
          observer.disconnect();
        },
        { rootMargin: '200px' },
      );
      observer.observe(element);
      return () => observer.disconnect();
    }
    if (phase !== 'drawing') {
      paint(element, phase === 'ready' ? firstLook : pointCount);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const progress = Math.min(1, (now - start) / 2600);
      paint(element, Math.floor(pointCount * progress));
      if (progress < 1) frame = requestAnimationFrame(draw);
      else setPhase('guess');
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  return (
    <>
      <figure className="iguess-replay" aria-label="Recorded iguess drawing round">
        <div className="iguess-replay-content">
          <canvas ref={canvas} width="1120" height="840" aria-hidden="true" />
          <div className="iguess-replay-sidebar">
            <div className="iguess-replay-chat" aria-live="polite">
              <span>{ended ? 'The guess' : 'Recorded round'}</span>
              <p>
                {ended
                  ? round.guess
                  : phase === 'drawing'
                    ? 'Waiting for the drawing…'
                    : 'Watch the sketch take shape and see what the guesser comes up with.'}
              </p>
              {phase === 'answer' && (
                <div className="iguess-answer">
                  <span>Word</span>
                  <strong>{round.word}</strong>
                </div>
              )}
            </div>
            <div className="iguess-replay-actions">
              <button
                type="button"
                className="iguess-replay-play"
                aria-disabled={phase === 'drawing'}
                onClick={() => {
                  if (phase === 'drawing') return;
                  setPhase(
                    matchMedia('(prefers-reduced-motion: reduce)').matches ? 'guess' : 'drawing',
                  );
                }}
              >
                <ControlIcon name="play" />{' '}
                {phase === 'ready' ? 'Play round' : phase === 'drawing' ? 'Drawing…' : 'Replay'}
              </button>
              {ended && (
                <button
                  type="button"
                  onClick={() => setPhase(phase === 'answer' ? 'guess' : 'answer')}
                >
                  {phase === 'answer' ? 'Hide word' : 'Reveal word'}
                </button>
              )}
              <button
                ref={inspector}
                className="iguess-replay-inspect"
                aria-label="Inspect screenshot: iguess"
                type="button"
                onClick={() => setOpen(true)}
              >
                Screenshot
              </button>
            </div>
          </div>
        </div>
      </figure>
      {open && (
        <ScreenshotViewer
          image={image}
          caption={caption}
          name="iguess"
          returnFocus={inspector.current}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
