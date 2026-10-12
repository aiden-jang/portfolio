import { describe, expect, it } from 'vitest';
import { previewIndex, previewLink } from './previewLinks';

describe('shared product views', () => {
  it('accepts a valid view for its own project', () => {
    expect(previewIndex('bloomnote:1', 'bloomnote', 2)).toBe(1);
  });
  it('rejects missing, malformed and out-of-range values', () => {
    for (const value of [null, 'bloomnote:-1', 'bloomnote:2', 'bloomnote:1:extra', 'bloomnote:x'])
      expect(previewIndex(value, 'bloomnote', 2)).toBeNull();
  });
  it('does not select a view belonging to another project', () => {
    expect(previewIndex('mrrp:1', 'bloomnote', 2)).toBeNull();
  });
  it('keeps the garage settings and targets the project when sharing', () => {
    const url = new URL(
      previewLink(
        'https://example.com/?car=3&paint=original&light=night#work/bloomnote',
        'bloomnote',
        1,
      ),
    );
    expect(url.searchParams.get('car')).toBe('3');
    expect(url.searchParams.get('light')).toBe('night');
    expect(url.searchParams.get('preview')).toBe('bloomnote:1');
    expect(url.hash).toBe('#project-bloomnote');
  });
});
