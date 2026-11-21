const SUN_RADIUS = 12;
const SUN_Z = 5;
export function computeSunPosition(date: Date) {
  const hours = date.getHours() + date.getMinutes() / 60;
  // Maps the clock onto [-π/2, 3π/2]: 6am is 0 at the east horizon, noon π/2 overhead,
  // 6pm π in the west, midnight -π/2 below.
  const angle = (hours - 6) * (Math.PI / 12);
  const x = Math.cos(angle) * SUN_RADIUS;
  const y = Math.sin(angle) * SUN_RADIUS;
  const daylight = Math.max(0, Math.sin(angle));
  return { x, y, z: SUN_Z, daylight };
}
