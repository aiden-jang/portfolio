import { useEffect, type MutableRefObject } from 'react';
import { clamp } from '../math';
import { useAppStore } from '../store';
import { usePhotoMode } from '../ui/photo/state';
import { canOrbitAt, pageSectionBounds } from './orbitRegion';

const TAP_THRESHOLD_PX = 3;
// Fingers jitter far more than a mouse, so the 3px threshold reads a normal tap as a drag.
const TOUCH_TAP_THRESHOLD_PX = 12;
// Photo mode keeps the long press so it can still frame along both touch axes.
const HOLD_MS = 300;
const HOLD_MOVE_TOLERANCE = 10;
const SWIPE_DIRECTION_RATIO = 1.3;
const DRAG_YAW_SENSITIVITY = 0.01;
const DRAG_PITCH_SENSITIVITY = 0.006;
const MIN_ELEVATION_FREE = -0.4;
const MAX_ELEVATION_FREE = 0.9;
const SCROLL_PAUSE_DURATION = 0.2;
const NON_DRAGGABLE_SELECTOR =
  'a, button, input, select, textarea, summary, dialog, .panel, #nav, .car-controls-row, .garage-lineup, .garage-studio';

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

/** Owns intro orbit gestures; the scene decides whether a tap hits the car. */
export function useOrbitGesture(
  state: MutableRefObject<RigState>,
  onTap: (x: number, y: number) => void,
): void {
  useEffect(() => {
    const isNonDraggable = (target: EventTarget | null) =>
      !!(target as HTMLElement | null)?.closest?.(NON_DRAGGABLE_SELECTOR);

    let holdTimer = 0;
    let startsWithHold = false;
    let activePointer: number | null = null;
    const endGesture = (s: RigState) => {
      window.clearTimeout(holdTimer);
      s.orbitHold = false;
      document.body.classList.remove('orbiting');
    };

    const onPointerDown = (e: PointerEvent) => {
      if (activePointer !== null && activePointer !== e.pointerId) {
        onPointerCancel();
        return;
      }
      if (
        e.button !== 0 ||
        !e.isPrimary ||
        useAppStore.getState().renderFinish !== null ||
        isNonDraggable(e.target) ||
        !canOrbitAt(e.clientY, pageSectionBounds())
      )
        return;
      activePointer = e.pointerId;
      const s = state.current;
      s.isDown = true;
      s.isTouch = e.pointerType === 'touch';
      s.dragMoved = false;
      s.orbitHold = false;
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      startsWithHold = usePhotoMode.getState().active;
      if (s.isTouch && startsWithHold) {
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
      if (!s.isDown || activePointer !== e.pointerId) return;
      if (!canOrbitAt(e.clientY, pageSectionBounds())) {
        onPointerCancel();
        return;
      }
      let dx = e.clientX - s.lastX;
      let dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      const tapThreshold = s.isTouch ? TOUCH_TAP_THRESHOLD_PX : TAP_THRESHOLD_PX;
      const totalMovement = Math.abs(e.clientX - s.startX) + Math.abs(e.clientY - s.startY);
      if (totalMovement > tapThreshold) s.dragMoved = true;
      if (s.isTouch && !s.orbitHold && startsWithHold) {
        if (totalMovement > HOLD_MOVE_TOLERANCE) {
          window.clearTimeout(holdTimer);
          s.dragMoved = true;
        }
        return;
      }
      if (s.isTouch && !s.orbitHold) {
        const horizontal = e.clientX - s.startX;
        const vertical = e.clientY - s.startY;
        if (
          Math.abs(vertical) >= TOUCH_TAP_THRESHOLD_PX &&
          Math.abs(vertical) >= Math.abs(horizontal)
        ) {
          s.isDown = false;
          activePointer = null;
          return;
        }
        if (
          Math.abs(horizontal) < TOUCH_TAP_THRESHOLD_PX ||
          Math.abs(horizontal) < Math.abs(vertical) * SWIPE_DIRECTION_RATIO
        )
          return;
        s.orbitHold = true;
        s.dragMoved = true;
        dx = horizontal;
        dy = vertical;
      }
      if (!s.dragMoved) return;
      // The class is what fades the DOM text out, so the car reads clean while you orbit.
      document.body.classList.add('orbiting');
      if (!useAppStore.getState().hasManualView) useAppStore.setState({ hasManualView: true });
      s.introT = 1;
      s.dragAzimuth += dx * DRAG_YAW_SENSITIVITY;
      s.dragElevation = clamp(
        s.dragElevation - dy * DRAG_PITCH_SENSITIVITY,
        MIN_ELEVATION_FREE,
        MAX_ELEVATION_FREE,
      );
    };
    // Registered non-passive below, so an engaged hold can suppress the page scroll.
    const onTouchMove = (e: TouchEvent) => {
      if (startsWithHold && state.current.orbitHold && e.cancelable) e.preventDefault();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (activePointer !== e.pointerId) return;
      activePointer = null;
      const s = state.current;
      if (!s.isDown) {
        endGesture(s);
        return;
      }
      if (!s.dragMoved && canOrbitAt(e.clientY, pageSectionBounds()) && !isNonDraggable(e.target))
        onTap(e.clientX, e.clientY);
      s.idleSpin += s.dragAzimuth;
      s.dragAzimuth = 0;
      s.isDown = false;
      endGesture(s);
    };
    const onPointerCancel = () => {
      activePointer = null;
      state.current.idleSpin += state.current.dragAzimuth;
      state.current.dragAzimuth = 0;
      state.current.isDown = false;
      endGesture(state.current);
    };
    const onScroll = () => {
      state.current.scrollActiveTimer = SCROLL_PAUSE_DURATION;
      onPointerCancel();
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('blur', onPointerCancel);
    return () => {
      window.clearTimeout(holdTimer);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('blur', onPointerCancel);
      document.body.classList.remove('orbiting');
    };
  }, [state, onTap]);
}

export function createRigState(): RigState {
  return {
    dragAzimuth: 0,
    dragElevation: 0,
    isDown: false,
    isTouch: false,
    dragMoved: false,
    orbitHold: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    idleSpin: 0,
    scrollActiveTimer: 0,
    introT: 0,
  };
}
