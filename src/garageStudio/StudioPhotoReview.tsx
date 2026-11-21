import { useEffect, useRef, useState } from 'react';
import { clamp } from '../math';
import { StudioPrintActions, type StudioPrintDetails } from './StudioPrint';
import { photoRatio, type PhotoShape } from './state';
import './studio-photo-review.css';

type Point = { x: number; y: number };
const center = { x: 0.5, y: 0.5 };

type Props = {
  image: { src: string; frame: Blob };
  shape: PhotoShape;
  name: string;
  print: StudioPrintDetails;
  onShape: (shape: PhotoShape) => void;
  onRetake: () => void;
  onDone: () => void;
};

export function StudioPhotoReview({ image, shape, name, print, onShape, onRetake, onDone }: Props) {
  const guide = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; initial: Point }>();
  const [position, setPosition] = useState(center);
  const [border, setBorder] = useState(false);
  const ratio = photoRatio(shape);

  useEffect(() => guide.current?.focus({ preventScroll: true }), []);

  return (
    <section className="studio-photo-review" aria-label="Review photograph">
      <header>
        <div>
          <h3>Frame your photograph</h3>
          <p>Drag the image or use the arrow keys.</p>
        </div>
        <button type="button" onClick={onDone}>
          Done
        </button>
      </header>
      <div className="studio-photo-mat" style={{ '--crop-ratio': ratio } as React.CSSProperties}>
        <div className="studio-photo-sheet">
          <div
            className="studio-photo-crop"
            ref={guide}
            tabIndex={0}
            role="group"
            aria-label="Photo crop. Use arrows to reframe."
            onKeyDown={(event) => {
              const step = event.shiftKey ? 0.15 : 0.05;
              const delta = {
                ArrowLeft: [step, 0],
                ArrowRight: [-step, 0],
                ArrowUp: [0, step],
                ArrowDown: [0, -step],
              }[event.key];
              if (!delta) return;
              event.preventDefault();
              setPosition(({ x, y }) => ({
                x: clamp(x + delta[0], 0, 1),
                y: clamp(y + delta[1], 0, 1),
              }));
            }}
            onPointerDown={(event) => {
              if (event.button !== 0 || drag.current) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                initial: position,
              };
            }}
            onPointerMove={(event) => {
              const origin = drag.current;
              const img = event.currentTarget.querySelector('img');
              if (!origin || origin.id !== event.pointerId || !img?.naturalWidth) return;
              const { width, height } = event.currentTarget.getBoundingClientRect();
              const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
              const xRange = img.naturalWidth * scale - width;
              const yRange = img.naturalHeight * scale - height;
              setPosition({
                x:
                  xRange > 1
                    ? clamp(origin.initial.x - (event.clientX - origin.x) / xRange, 0, 1)
                    : origin.initial.x,
                y:
                  yRange > 1
                    ? clamp(origin.initial.y - (event.clientY - origin.y) / yRange, 0, 1)
                    : origin.initial.y,
              });
            }}
            onLostPointerCapture={() => {
              drag.current = undefined;
            }}
          >
            <img
              src={image.src}
              alt="Captured studio photograph"
              draggable={false}
              style={{ objectPosition: `${position.x * 100}% ${position.y * 100}%` }}
            />
          </div>
          {border && (
            <div className="studio-print-caption">
              <strong>{print.car}</strong>
              <span>
                {print.view} · {print.credit}
              </span>
            </div>
          )}
        </div>
      </div>
      <footer>
        <div role="group" aria-label="Photo format">
          <button
            type="button"
            aria-pressed={shape === 'portrait'}
            onClick={() => onShape('portrait')}
          >
            Portrait 4:5
          </button>
          <button
            type="button"
            aria-pressed={shape === 'landscape'}
            onClick={() => onShape('landscape')}
          >
            Wide 16:9
          </button>
          <button type="button" onClick={() => setPosition(center)}>
            Center
          </button>
        </div>
        <div>
          <button type="button" onClick={onRetake}>
            Retake
          </button>
          <button type="button" aria-pressed={border} onClick={() => setBorder(!border)}>
            Print border
          </button>
          <StudioPrintActions
            frame={image.frame}
            shape={shape}
            position={position}
            name={name}
            print={border ? print : undefined}
          />
        </div>
      </footer>
    </section>
  );
}
