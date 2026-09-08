import { useEffect, type MutableRefObject } from 'react';
import { clamp } from '../math';
import { useAppStore } from '../store';

const TAP_THRESHOLD_PX = 3;
// Fingers jitter far more than a mouse, so the 3px threshold reads a normal tap as a drag.
const TOUCH_TAP_THRESHOLD_PX = 12;
// Hold-to-orbit: a press that stays put this long switches touch from scrolling the page to
// orbiting the car. Moving further than the tolerance first means it was a scroll.
const HOLD_MS = 300;
const HOLD_MOVE_TOLERANCE = 10;
const DRAG_YAW_SENSITIVITY = 0.01;
const DRAG_PITCH_SENSITIVITY = 0.006;
const MIN_ELEVATION_FREE = -0.4;
const MAX_ELEVATION_FREE = 0.9;
const SCROLL_PAUSE_DURATION = 0.2;
const NON_DRAGGABLE_SELECTOR = 'a, button, .panel, #nav, #theme-toggle';

export type RigState = {
  dragAzimuth: number;
  dragElevation: number;
  isDown: boolean;
  isTouch: boolean;
  dragMoved: boolean;
  orbitHold: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  idleSpin: number;
  scrollActiveTimer: number;
  introT: number;
};

/** Owns the pointer gestures that feed CameraRig: orbit drag, touch hold-to-orbit, tap-to-rev. */
export function useOrbitGesture(state: MutableRefObject<RigState>): void {
  const triggerRev = useAppStore((s) => s.triggerRev);

  useEffect(() => {
    const isNonDraggable = (target: EventTarget | null) =>
      !!(target as HTMLElement | null)?.closest?.(NON_DRAGGABLE_SELECTOR);

    let holdTimer = 0;
    const endGesture = (s: RigState) => {
      window.clearTimeout(holdTimer);
      s.orbitHold = false;
      document.body.classList.remove('orbiting');
    };

    const onPointerDown = (e: PointerEvent) => {
      if (isNonDraggable(e.target)) return;
      const s = state.current;
      s.isDown = true;
      s.isTouch = e.pointerType === 'touch';
      s.dragMoved = false;
      s.orbitHold = false;
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      if (s.isTouch) {
        window.clearTimeout(holdTimer);
        holdTimer = window.setTimeout(() => {
          if (s.isDown && !s.dragMoved) {
            s.orbitHold = true;
            document.body.classList.add('orbiting');
            navigator.vibrate?.(12);
          }
        }, HOLD_MS);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      const s = state.current;
      if (!s.isDown) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      const tapThreshold = s.isTouch ? TOUCH_TAP_THRESHOLD_PX : TAP_THRESHOLD_PX;
      const totalMovement = Math.abs(e.clientX - s.startX) + Math.abs(e.clientY - s.startY);
      if (totalMovement > tapThreshold) s.dragMoved = true;
      if (s.isTouch && !s.orbitHold) {
        if (totalMovement > HOLD_MOVE_TOLERANCE) window.clearTimeout(holdTimer);
        return;
      }
      if (!s.dragMoved) return;
      // The class is what fades the DOM text out, so the car reads clean while you orbit.
      if (s.dragMoved) document.body.classList.add('orbiting');
      s.dragAzimuth += dx * DRAG_YAW_SENSITIVITY;
      s.dragElevation = clamp(
        s.dragElevation - dy * DRAG_PITCH_SENSITIVITY,
        MIN_ELEVATION_FREE,
        MAX_ELEVATION_FREE,
      );
    };
    // Registered non-passive below, so an engaged hold can suppress the page scroll.
    const onTouchMove = (e: TouchEvent) => {
      if (state.current.orbitHold) e.preventDefault();
    };
    const onPointerUp = () => {
      const s = state.current;
      if (!s.isDown) {
        endGesture(s);
        return;
      }
      // Don't add `&& !s.orbitHold` here. A press that outlasts the hold but never moves should
      // still rev instead of reading as a dead press.
      if (!s.dragMoved) triggerRev();
      s.idleSpin += s.dragAzimuth;
      s.dragAzimuth = 0;
      s.isDown = false;
      endGesture(s);
    };
    const onPointerCancel = () => {
      state.current.isDown = false;
      endGesture(state.current);
    };
    const onScroll = () => {
      state.current.scrollActiveTimer = SCROLL_PAUSE_DURATION;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(holdTimer);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('orbiting');
    };
  }, [state, triggerRev]);
}
