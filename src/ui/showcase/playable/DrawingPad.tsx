import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { pointCount } from '../catDrawing';
import { Icon } from './StudioIcon';
import {
  createPaper,
  savePortrait,
  inks,
  inkStroke,
  keyboardTip,
  pointFromClient,
  makeInkSurface,
  paintBase,
  restore,
  W,
  H,
  type Stroke,
  type XY,
} from './portrait';
import { DrawingInstructions, Pencils } from './Pencils';

export function DrawingPad({
  master,
  board,
  active,
  drawingChanged,
  title,
  link,
}: {
  title: React.ReactNode;
  link: React.ReactNode;
  master: HTMLCanvasElement;
  board: React.RefObject<HTMLCanvasElement>;
  active: boolean;
  drawingChanged: () => void;
}) {
  const [scratch] = useState(makeInkSurface);
  const [base] = useState(() => {
    const paper = createPaper();
    paintBase(paper.getContext('2d')!, scratch, pointCount);
    return paper;
  });
  const showPoints = useRef(pointCount);
  const [history] = useState(restore);
  const strokes = useRef<Stroke[]>(history);
  const [count, setCount] = useState(history.length);
  const [selected, setSelected] = useState(0);
  const [touchPencil, enableTouchPencil] = useState(false);
  const pendingTouch = useRef<{ point: XY; x: number; y: number } | null>(null);
  const [usingKeys, setUsingKeys] = useState(false);
  const [tip, setTip] = useState<XY>([728, 207]);
  const [penDown, setPenDown] = useState(true);
  const keyStroke = useRef<Stroke | null>(null);
  const pointer = useRef<number | null>(null);
  const livePath = useRef<Stroke | null>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');

  const paintBoard = useCallback(() => {
    const face = board.current?.getContext('2d');
    if (!face) return;
    face.clearRect(0, 0, W, H);
    if (showPoints.current >= pointCount || strokes.current.length > 0) {
      face.drawImage(master, 0, 0);
    } else if (showPoints.current > 0) {
      paintBase(face, scratch, showPoints.current);
    }
  }, [board, master, scratch]);

  useLayoutEffect(() => {
    const paper = board.current;
    if (!paper) return;
    const reveal = (event: Event) => {
      const visible = (event as CustomEvent<number>).detail;
      if (showPoints.current === visible) return;
      showPoints.current = visible;
      paintBoard();
    };
    paper.addEventListener('studio-ink', reveal);
    return () => paper.removeEventListener('studio-ink', reveal);
  }, [board, paintBoard]);

  const paint = useCallback(() => {
    const ctx = master.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(base, 0, 0);
    for (const path of strokes.current) inkStroke(ctx, path);
    master.dataset.marked = String(strokes.current.length > 0);
    paintBoard();
    drawingChanged();
  }, [master, base, paintBoard, drawingChanged]);
  useLayoutEffect(paint, [paint]);
  useEffect(() => {
    if (!active) {
      enableTouchPencil(false);
      pendingTouch.current = null;
      pointer.current = null;
      livePath.current = null;
      setUsingKeys(false);
      keyStroke.current = null;
    }
  }, [active]);

  function save() {
    setCount(strokes.current.length);
    savePortrait(strokes.current);
  }
  function undo() {
    if (!strokes.current.length || pointer.current !== null) return;
    strokes.current.pop();
    keyStroke.current = null;
    paint();
    save();
    setStatus('Last mark removed.');
  }
  function addStroke(point: XY) {
    const stroke = { ink: selected, points: [point] };
    strokes.current = [...strokes.current.slice(-95), stroke];
    return stroke;
  }
  function drawDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!active || e.button !== 0 || pointer.current !== null) return;
    const point = pointFromClient(e.currentTarget, sheet.current!, e.clientX, e.clientY);
    const passiveTouch = e.pointerType === 'touch' && !touchPencil;
    if (!passiveTouch) e.preventDefault();
    e.currentTarget.focus({ preventScroll: true });
    pointer.current = e.pointerId;
    keyStroke.current = null;
    setUsingKeys(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    if (passiveTouch) {
      // A vertical first gesture belongs to the page. A tap or a sideways mark belongs to the pad.
      pendingTouch.current = { point, x: e.clientX, y: e.clientY };
      return;
    }
    livePath.current = addStroke(point);
    paint();
    setCount(strokes.current.length);
  }
  function drawMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!active || e.pointerId !== pointer.current) return;
    if (!livePath.current && pendingTouch.current) {
      const start = pendingTouch.current;
      const dx = Math.abs(e.clientX - start.x),
        dy = Math.abs(e.clientY - start.y);
      if (dx < 4 || dx < dy * 1.2) return;
      pendingTouch.current = null;
      livePath.current = addStroke(start.point);
      setCount(strokes.current.length);
    }
    if (!livePath.current) return;
    const native = e.nativeEvent;
    const events =
      typeof native.getCoalescedEvents === 'function' ? native.getCoalescedEvents() : [];
    const path = livePath.current.points;
    for (const move of events.length ? events : [native]) {
      const point = pointFromClient(e.currentTarget, sheet.current!, move.clientX, move.clientY);
      const last = path[path.length - 1];
      if (path.length < 4800 && Math.hypot(point[0] - last[0], point[1] - last[1]) > 1)
        path.push(point);
    }
    paint();
  }
  function drawEnd(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.pointerId !== pointer.current) return;
    const pending = pendingTouch.current;
    if (
      pending &&
      e.type === 'pointerup' &&
      Math.hypot(e.clientX - pending.x, e.clientY - pending.y) < 6
    ) {
      addStroke(pending.point);
      paint();
    }
    pendingTouch.current = null;
    pointer.current = null;
    livePath.current = null;
    save();
  }
  function drawKey(e: React.KeyboardEvent<HTMLCanvasElement>) {
    if (!active) return;
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z')
    ) {
      e.preventDefault();
      undo();
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setUsingKeys(true);
      keyStroke.current = null;
      setPenDown(!penDown);
      setStatus(penDown ? 'Pencil lifted.' : 'Pencil touching paper.');
      return;
    }
    const next = keyboardTip(e.key, tip, e.shiftKey);
    if (!next) return;
    e.preventDefault();
    setUsingKeys(true);
    if (penDown) {
      if (!keyStroke.current) keyStroke.current = addStroke(tip);
      keyStroke.current.points.push(next);
      paint();
      save();
    }
    setTip(next);
  }
  const ink = inks[selected];
  return (
    <div className="drawing-unit" aria-hidden={!active}>
      <div className="sketchbook" ref={sheet}>
        <div className="paper-under" aria-hidden="true" />
        <div className="paper-front">
          <div className="paper-head">
            <span className="game-sign">
              <img
                src={new URL('../../../../studio-art/iguess.svg', import.meta.url).href}
                alt=""
              />
              {title}
            </span>
            <span className="paper-mode">{link}</span>
          </div>
          <div className="canvas-place" style={{ '--ink': ink.color } as React.CSSProperties}>
            <canvas
              ref={board}
              id="drawing-board"
              className="studio-draw-board"
              data-touch-pencil={touchPencil || undefined}
              width={W}
              height={H}
              tabIndex={active ? 0 : -1}
              data-mark-count={count}
              aria-label="Bean’s portrait, drawing canvas"
              aria-describedby="keyboard-drawing"
              onPointerDown={drawDown}
              onPointerMove={drawMove}
              onPointerUp={drawEnd}
              onPointerCancel={drawEnd}
              onLostPointerCapture={drawEnd}
              onKeyDown={drawKey}
              onFocus={(e) => setUsingKeys(e.currentTarget.matches(':focus-visible'))}
              onBlur={() => {
                setUsingKeys(false);
                keyStroke.current = null;
              }}
            />
            {usingKeys && (
              <span
                className="pencil-tip"
                style={{
                  left: `${(tip[0] / W) * 100}%`,
                  top: `${(tip[1] / H) * 100}%`,
                }}
                data-down={penDown}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="paper-foot">
            <span className="drawing-cue">
              <Icon name="pencil" size={15} />
              <span>{usingKeys ? 'Arrows draw · Space lifts' : 'Draw on the page'}</span>
            </span>
            <button
              type="button"
              className="undo"
              onClick={undo}
              disabled={!count}
              aria-label="Undo last mark"
            >
              <Icon name="undo" size={15} />
              Undo
            </button>
          </div>
        </div>
        <div className="coils" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
      <Pencils
        selected={selected}
        select={(index, name) => {
          setSelected(index);
          enableTouchPencil(true);
          keyStroke.current = null;
          setStatus(`${name} pencil selected.`);
        }}
      />
      <DrawingInstructions />
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}
