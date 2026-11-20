import { prefersReducedMotion } from '../hooks/reducedMotion';
import { clamp } from '../math';
import type { Orbit } from './state';

const ORBIT_SPEED = 0.012;
const DECAY = 22;
const dragged = new WeakSet<Orbit>();
const motion = new WeakMap<Orbit, { velocity: number; replayAt?: number; origin?: number }>();

export function stopOrbitMotion(orbit: Orbit, pose: 'shown' | 'requested' = 'shown') {
  dragged.delete(orbit);
  motion.delete(orbit);
  if (pose === 'shown') orbit.yaw = orbit.shownYaw;
}

export function startOrbitDrag(orbit: Orbit) {
  stopOrbitMotion(orbit);
  dragged.add(orbit);
}

export function orbitDragYaw(start: number, dx: number) {
  return start + ORBIT_SPEED * dx;
}

export function releaseOrbit(orbit: Orbit, pixelsPerSecond: number) {
  dragged.delete(orbit);
  const velocity = clamp(pixelsPerSecond * ORBIT_SPEED, -4, 4);
  if (!prefersReducedMotion() && Math.abs(velocity) >= 1.15) motion.set(orbit, { velocity });
}

export function replayOrbit(orbit: Orbit) {
  stopOrbitMotion(orbit);
  if (prefersReducedMotion()) orbit.yaw += 0.36;
  else motion.set(orbit, { velocity: 0, replayAt: performance.now(), origin: orbit.yaw });
}

export function advanceOrbit(orbit: Orbit, dt: number) {
  const active = motion.get(orbit);
  if (!active) return dragged.has(orbit);
  if (prefersReducedMotion()) {
    motion.delete(orbit);
    return false;
  }
  if (active.replayAt !== undefined && active.origin !== undefined) {
    const progress = Math.min(1, (performance.now() - active.replayAt) / 2400);
    orbit.yaw = active.origin + Math.sin(progress * Math.PI * 2) * 0.36;
    if (progress === 1) motion.delete(orbit);
    return true;
  }
  const attenuation = Math.exp(-dt * DECAY);
  orbit.yaw += (active.velocity * (1 - attenuation)) / DECAY;
  active.velocity *= attenuation;
  if (Math.abs(active.velocity) < 0.01) motion.delete(orbit);
  return true;
}
