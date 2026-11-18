export const motionState = { progress: 1, openingOrbitProgress: 0 };

export function updateIntroFov(
  camera: { fov?: number; updateProjectionMatrix: () => void },
  width: number,
  scrollT: number,
) {
  if (typeof camera.fov !== 'number') return;
  const initial = width > 767 ? 32 : 34;
  const next = initial + (35 - initial) * Math.min(1, Math.max(0, scrollT * 5));
  if (camera.fov !== next) {
    camera.fov = next;
    camera.updateProjectionMatrix();
  }
}
