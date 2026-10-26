import { describe, expect, it } from 'vitest';
import { canPrefetchModels } from './modelPrefetch';

describe('optional model downloads', () => {
  it('respects the data-saving preference even on a fast connection', () => {
    expect(canPrefetchModels({ saveData: true, effectiveType: '4g' })).toBe(false);
  });
  it('keeps spare models off limited mobile connections', () => {
    for (const effectiveType of ['slow-2g', '2g', '3g']) {
      expect(canPrefetchModels({ effectiveType })).toBe(false);
    }
  });
  it('warms spare models on a fast connection', () => {
    expect(canPrefetchModels({ effectiveType: '4g' })).toBe(true);
  });
  it('keeps optional downloads off when connection quality is unknown', () => {
    for (const connection of [undefined, {}, { saveData: false }])
      expect(canPrefetchModels(connection)).toBe(false);
  });
});
