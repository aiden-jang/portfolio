import { CARS, PREFETCH_MODEL_INDICES } from '../config';

type Connection = { saveData?: boolean; effectiveType?: string };

export function canPrefetchModels(connection?: Connection): boolean {
  return connection?.effectiveType === '4g' && !connection.saveData;
}

export function scheduleCompanionPrefetch(currentFile: string, signal: AbortSignal): number {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  if (!canPrefetchModels(connection)) return 0;

  // Warm the HTTP cache without competing with the first model for GPU upload.
  return window.setTimeout(() => {
    for (const index of PREFETCH_MODEL_INDICES) {
      const { file } = CARS[index];
      if (file !== currentFile)
        void fetch(`/models/${file}`, { priority: 'low', signal }).catch(() => {});
    }
  }, 1500);
}
