import { describe, expect, it } from 'vitest';
import { caseStudyLane, visibleProjects } from './workBrowsing';
import { WORK_ITEMS } from './workItems';

describe('case study browsing', () => {
  it('keeps a filtered case study in the visible project lane', () => {
    const lane = visibleProjects('ai');
    expect(caseStudyLane(lane[0], 'ai')).toEqual(lane);
    expect(lane.map((item) => item.mark)).toEqual(['iguess', 'bloomnote']);
  });
  it('lets a direct link outside the filter browse all projects', () => {
    const worth = WORK_ITEMS.find((item) => item.mark === 'worth')!;
    expect(caseStudyLane(worth, 'ai')).toEqual(visibleProjects('all'));
  });
  it('keeps employer work separate from side projects', () => {
    const work = WORK_ITEMS.find((item) => !item.mark)!;
    const lane = caseStudyLane(work, 'ai');
    expect(lane).toContain(work);
    expect(lane.every((item) => !item.mark)).toBe(true);
  });
});
