import { describe, expect, it } from 'vitest';
import { WORK_ITEMS, workId } from './workItems';

describe('workId', () => {
  it('gives every entry its own fragment, so no two share a URL', () => {
    const ids = WORK_ITEMS.map(workId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('produces fragments that survive a round trip through a URL', () => {
    for (const item of WORK_ITEMS) {
      const id = workId(item);
      expect(id, `${item.title} has an empty id`).not.toBe('');
      expect(id).toBe(encodeURIComponent(id));
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('strips punctuation and casing rather than passing it through', () => {
    expect(workId({ shortName: 'Wherever, Honestly' } as never)).toBe('wherever-honestly');
    expect(workId({ shortName: 'iguess' } as never)).toBe('iguess');
    expect(workId({ shortName: '  spaced  out  ' } as never)).toBe('spaced-out');
  });

  it('falls back to the title when an entry has no short name', () => {
    expect(workId({ title: 'A Platform of Shipped Side Projects' } as never)).toBe(
      'a-platform-of-shipped-side-projects',
    );
  });
});

describe('WORK_ITEMS', () => {
  it('gives each entry the copy the card and modal both need', () => {
    for (const item of WORK_ITEMS) {
      expect(item.title, 'an entry has no title').toBeTruthy();
      expect(item.summary, `${item.title} has no summary`).toBeTruthy();
      expect(item.context, `${item.title} has no context`).toBeTruthy();
      expect(item.body.length, `${item.title} has an empty body`).toBeGreaterThan(0);
      expect(item.stack.length, `${item.title} lists no stack`).toBeGreaterThan(0);
    }
  });

  it('only points at real URLs, so no entry renders a dead link', () => {
    for (const item of WORK_ITEMS) {
      if (item.link) expect(item.link.url, `${item.title} primary link`).toMatch(/^https:\/\//);
      for (const link of item.links ?? []) {
        expect(link.url, `${item.title} -> ${link.label}`).toMatch(/^https:\/\//);
        expect(link.label, `${item.title} has an unlabelled link`).toBeTruthy();
      }
    }
  });

  it('gives every product card the fields the card layout reads', () => {
    for (const item of WORK_ITEMS.filter((entry) => entry.mark)) {
      expect(item.shortName, `${item.title} is a card with no short name`).toBeTruthy();
      expect(item.tagline, `${item.title} is a card with no tagline`).toBeTruthy();
    }
  });
});
