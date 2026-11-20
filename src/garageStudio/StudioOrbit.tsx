import { orbitDragYaw, releaseOrbit, startOrbitDrag, stopOrbitMotion } from './orbitMotion';
import type { Orbit } from './state';
import { track, useGarageStudy } from '../garageStudy/state';
import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { clamp } from '../math';
import { activeOrbit, repaintStudio } from './state';

export function StudioOrbit({
  enabled,
  onDrag,
}: {
  enabled: boolean;
  onDrag: (active: boolean) => void;
}) {
  const drag = useRef<{
    pointer: number;
    orbit: Orbit;
    lastX: number;
    lastAt: number;
    speed: number;
    x: number;
    y: number;
    yaw: number;
    pitch: number;
  } | null>(null);
  const points = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const glideStart = useRef(0);

  function distance() {
    const [a, b] = points.current.values();
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  function begin(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !enabled) return;
    const { camera, playing } = useGarageStudy.getState();
    if (camera === 'deck' && event.pointerType === 'touch') {
      points.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
      if (points.current.size === 2)
        pinch.current = {
          zoom: activeOrbit().zoom,
          distance: Math.max(1, distance()),
        };
    }
    if (!event.isPrimary) return;
    if (camera === 'glide') {
      glideStart.current = track.position;
      if (playing) useGarageStudy.setState({ playing: false });
    }
    const orbit = activeOrbit();
    startOrbitDrag(orbit);
    drag.current = {
      pointer: event.pointerId,
      orbit,
      lastX: event.clientX,
      lastAt: event.timeStamp,
      speed: 0,
      x: event.clientX,
      y: event.clientY,
      yaw: orbit.yaw,
      pitch: orbit.pitch,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    onDrag(true);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (points.current.has(event.pointerId)) {
      points.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      if (pinch.current) {
        activeOrbit().zoom = clamp(
          (pinch.current.zoom * pinch.current.distance) / Math.max(1, distance()),
          0.64,
          1.65,
        );
        repaintStudio();
        return;
      }
    }
    const start = drag.current;
    if (!enabled || !start || start.pointer !== event.pointerId || start.orbit !== activeOrbit())
      return;
    if (useGarageStudy.getState().camera === 'glide') {
      track.position = clamp(
        glideStart.current +
          (event.clientX - start.x) / Math.min(event.currentTarget.clientWidth * 0.72, 400),
        0,
        1,
      );
      repaintStudio();
      return;
    }
    const orbit = activeOrbit();
    start.speed =
      ((event.clientX - start.lastX) * 1000) / Math.max(8, event.timeStamp - start.lastAt);
    start.lastX = event.clientX;
    start.lastAt = event.timeStamp;
    orbit.yaw = orbitDragYaw(start.yaw, event.clientX - start.x);
    orbit.pitch = clamp(start.pitch - (event.clientY - start.y) * 0.0023, -0.18, 0.22);
    repaintStudio();
  }

  function end(event: PointerEvent<HTMLDivElement>) {
    points.current.delete(event.pointerId);
    if (pinch.current) {
      if (!points.current.size) pinch.current = null;
      if (drag.current) releaseOrbit(drag.current.orbit, 0);
      drag.current = null;
      onDrag(false);
      return;
    }
    const start = drag.current;
    if (start?.pointer !== event.pointerId) return;
    drag.current = null;
    const flick =
      enabled &&
      event.type === 'pointerup' &&
      event.timeStamp - start.lastAt < 85 &&
      activeOrbit() === start.orbit &&
      useGarageStudy.getState().camera !== 'glide';
    releaseOrbit(start.orbit, flick ? start.speed : 0);
    onDrag(false);
  }

  function arrow(event: KeyboardEvent<HTMLDivElement>) {
    if (!enabled || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    if (useGarageStudy.getState().camera === 'glide') {
      useGarageStudy.setState({ playing: false });
      track.position = clamp(track.position + (event.key === 'ArrowRight' ? 0.075 : -0.075), 0, 1);
      repaintStudio();
      return;
    }
    const orbit = activeOrbit();
    stopOrbitMotion(orbit);
    orbit.yaw += ((event.key === 'ArrowRight' ? 1 : -1) * Math.PI) / 18;
    repaintStudio();
  }

  return (
    <div
      className="garage-studio-stage"
      aria-label="Drag to orbit"
      role="region"
      tabIndex={0}
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onKeyDown={arrow}
      onWheel={(event) => {
        if (!enabled || useGarageStudy.getState().camera !== 'deck') return;
        const orbit = activeOrbit();
        orbit.zoom = clamp(orbit.zoom + event.deltaY * 0.0011, 0.64, 1.65);
        repaintStudio();
      }}
    />
  );
}
