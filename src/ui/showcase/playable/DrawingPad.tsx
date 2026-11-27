import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type MutableRefObject,
  type CSSProperties,
  type PointerEvent,
  type KeyboardEvent,
} from 'react';
import { pointCount } from '../catDrawing';
import { DrawingControls } from './DrawingControls';
import { DrawingInstructions } from './Pencils';
import {
  createPaper,
  H,
  W,
  inkStroke,
  keyboardTip,
  makeInkSurface,
  paintBase,
  paperColor,
  restore,
  savePortrait,
  type Stroke,
  type XY,
} from './portrait';
import { inkPoint, printProjection, screenProjection, type SheetGeometry } from './sheetGeometry';

type Props = {
  board: RefObject<HTMLCanvasElement>;
  master: HTMLCanvasElement;
  geometry: MutableRefObject<SheetGeometry>;
  active: boolean;
  drawingChanged: () => void;
  title: ReactNode;
  link: ReactNode;
  hang: () => void;
};

export function DrawingPad({
  board,
  master,
  geometry,
  active,
  drawingChanged,
  title,
  link,
  hang,
}: Props) {
  const [scratch] = useState(makeInkSurface);
  const [guide] = useState(() => {
    const c = createPaper();
    paintBase(c.getContext('2d')!, scratch, pointCount);
    return c;
  });
  const [initial] = useState(restore);
  const strokes = useRef<Stroke[]>(initial);
  const [snapshot, setSnapshot] = useState(initial);
  const [guess, setGuess] = useState('');
  const [selected, setSelected] = useState(2);
  const [freeTouch, setFreeTouch] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [tip, setTip] = useState<XY>([W / 2, H / 2]);
  const [penDown, setPenDown] = useState(true);
  const [notice, setNotice] = useState('');
  const pixels = useRef(1);
  const revealed = useRef(pointCount);
  const frame = useRef(0);
  const gesture = useRef<{
    id: number;
    stroke: Stroke | null;
    start: XY;
    x: number;
    y: number;
  } | null>(null);
  const keyStroke = useRef<Stroke | null>(null);

  useEffect(() => {
    let live = true;
    if (!snapshot.length) setGuess('');
    else
      void import('./guessDrawing')
        .then(({ guessDrawing }) => {
          if (live) setGuess(guessDrawing(snapshot));
        })
        .catch(() => {
          if (live) setGuess('');
        });
    return () => {
      live = false;
    };
  }, [snapshot]);

  const paintScreen = useCallback(() => {
    frame.current = 0;
    const canvas = board.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const d = pixels.current,
      p = geometry.current.screen;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = paperColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(d * p.scale, 0, 0, d * p.scale, d * p.x, d * p.y);
    if (!strokes.current.length) {
      if (revealed.current >= pointCount) ctx.drawImage(guide, 0, 0);
      else if (revealed.current > 0) paintBase(ctx, scratch, revealed.current);
    } else {
      for (const stroke of strokes.current) inkStroke(ctx, stroke);
    }
  }, [board, geometry, guide, scratch]);

  const schedulePaint = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(paintScreen);
  }, [paintScreen]);

  const printSheet = useCallback(() => {
    const ctx = master.getContext('2d')!;
    const p = printProjection(strokes.current);
    geometry.current.print = p;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    master.dataset.ground = paperColor;
    ctx.setTransform(p.scale, 0, 0, p.scale, p.x, p.y);
    if (strokes.current.length) {
      for (const stroke of strokes.current) inkStroke(ctx, stroke);
    } else ctx.drawImage(guide, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    master.dataset.marked = String(strokes.current.length > 0);
    drawingChanged();
  }, [drawingChanged, geometry, guide, master]);

  const commit = useCallback(() => {
    printSheet();
    savePortrait(strokes.current);
    setSnapshot(strokes.current.slice());
    schedulePaint();
  }, [printSheet, schedulePaint]);

  useLayoutEffect(() => {
    const canvas = board.current!;
    function size() {
      const width = canvas.clientWidth,
        height = canvas.clientHeight;
      if (!width || !height) return;
      pixels.current = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixels.current);
      canvas.height = Math.round(height * pixels.current);
      geometry.current.screen = screenProjection(width, height, strokes.current);
      paintScreen();
    }
    function reveal(e: Event) {
      revealed.current = (e as CustomEvent<number>).detail;
      if (!strokes.current.length) schedulePaint();
    }
    size();
    printSheet();
    const observer = new ResizeObserver(size);
    observer.observe(canvas);
    canvas.addEventListener('studio-ink', reveal);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      canvas.removeEventListener('studio-ink', reveal);
    };
  }, [board, geometry, paintScreen, printSheet, schedulePaint]);

  useEffect(() => {
    if (active) return;
    if (gesture.current?.stroke) commit();
    gesture.current = null;
    keyStroke.current = null;
    setFreeTouch(false);
    setKeyboard(false);
  }, [active, commit]);

  function add(point: XY) {
    const stroke = { ink: selected, points: [point] };
    strokes.current = [...strokes.current.slice(-95), stroke];
    return stroke;
  }
  function down(e: PointerEvent<HTMLCanvasElement>) {
    if (!active || e.button !== 0 || !e.isPrimary || gesture.current) return;
    const passive = e.pointerType === 'touch' && !freeTouch;
    if (!passive) e.preventDefault();
    e.currentTarget.focus({ preventScroll: true });
    setKeyboard(false);
    keyStroke.current = null;
    const start = inkPoint(e.currentTarget, geometry.current.screen, e.clientX, e.clientY);
    gesture.current = {
      id: e.pointerId,
      start,
      x: e.clientX,
      y: e.clientY,
      stroke: passive ? null : add(start),
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!passive) schedulePaint();
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    const g = gesture.current;
    if (!active || g?.id !== e.pointerId) return;
    if (!g.stroke) {
      const dx = Math.abs(e.clientX - g.x),
        dy = Math.abs(e.clientY - g.y);
      if (dx < 5 || dx < dy * 1.25) return;
      g.stroke = add(g.start);
    }
    const actual = e.nativeEvent;
    const events = actual.getCoalescedEvents?.() || [];
    const points = g.stroke.points;
    for (const event of events.length ? events : [actual]) {
      const pt = inkPoint(e.currentTarget, geometry.current.screen, event.clientX, event.clientY);
      const last = points[points.length - 1];
      if (points.length < 4800 && Math.hypot(pt[0] - last[0], pt[1] - last[1]) > 0.8)
        points.push(pt);
    }
    schedulePaint();
  }
  function end(e: PointerEvent<HTMLCanvasElement>) {
    const g = gesture.current;
    if (g?.id !== e.pointerId) return;
    gesture.current = null;
    if (!g.stroke && e.type === 'pointerup' && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 5)
      g.stroke = add(g.start);
    if (g.stroke) commit();
  }
  function undo() {
    if (!strokes.current.length || gesture.current) return;
    strokes.current = strokes.current.slice(0, -1);
    keyStroke.current = null;
    commit();
    setNotice('Last mark removed.');
  }
  function key(e: KeyboardEvent<HTMLCanvasElement>) {
    if (!active) return;
    if (e.key === 'Escape') {
      setFreeTouch(false);
      setKeyboard(false);
      return;
    }
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
      setKeyboard(true);
      keyStroke.current = null;
      setPenDown(!penDown);
      setNotice(penDown ? 'Pencil lifted.' : 'Pencil touching paper.');
      return;
    }
    const next = keyboardTip(e.key, tip, e.shiftKey);
    if (!next) return;
    e.preventDefault();
    setKeyboard(true);
    if (penDown) {
      if (!keyStroke.current) keyStroke.current = add(tip);
      keyStroke.current.points.push(next);
      commit();
    }
    setTip(next);
  }
  const view = geometry.current.screen;
  return (
    <div className="ink-stage" style={{ '--ink-ground': paperColor } as CSSProperties}>
      <canvas
        id="drawing-board"
        ref={board}
        className="ink-surface"
        data-mark-count={snapshot.length}
        data-touch-pencil={freeTouch || undefined}
        aria-label="Draw on the full-screen canvas"
        aria-describedby="keyboard-drawing"
        tabIndex={active ? 0 : -1}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
        onKeyDown={key}
        onFocus={(e) => setKeyboard(e.currentTarget.matches(':focus-visible'))}
        onBlur={() => {
          setKeyboard(false);
          keyStroke.current = null;
        }}
      >
        Your drawing appears here and in the frame on Bean’s wall.
      </canvas>
      {keyboard && (
        <i
          aria-hidden="true"
          className="ink-tip"
          style={{
            left: tip[0] * view.scale + view.x,
            top: tip[1] * view.scale + view.y,
          }}
        />
      )}
      <DrawingControls
        title={title}
        link={link}
        marked={snapshot.length > 0}
        guess={guess}
        keyboard={keyboard}
        freeTouch={freeTouch}
        selected={selected}
        select={(ink, name) => {
          setSelected(ink);
          setFreeTouch(true);
          keyStroke.current = null;
          setNotice(name + ' pencil selected.');
        }}
        done={() => {
          setFreeTouch(false);
          setNotice('Drawing finished. Swipe to scroll.');
        }}
        undo={undo}
        hang={hang}
      />
      <DrawingInstructions />
      <span className="sr-only" role="status">
        {notice}
      </span>
    </div>
  );
}
