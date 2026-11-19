import { describe, expect, it } from 'vitest';
import {
  caseStudyLane,
  FEATURED_PROJECTS,
  isPortfolioProject,
  visibleProjects,
} from './workBrowsing';
import { WORK_ITEMS, workId } from './workItems';

describe('case study browsing', () => {
  it('keeps a filtered case study in the visible project lane', () => {
    const lane = visibleProjects('ai');
    expect(caseStudyLane(lane[0], 'ai')).toEqual(lane);
    expect(lane.map((item) => item.shortName)).toEqual(['iodine', 'bloomnote', 'iguess']);
  });
  it('lets a direct link outside the filter browse all projects', () => {
    const worth = WORK_ITEMS.find((item) => item.mark === 'worth')!;
    expect(caseStudyLane(worth, 'ai')).toEqual(visibleProjects('all'));
  });
  it('keeps employer work separate from side projects', () => {
    const work = WORK_ITEMS.find((item) => !isPortfolioProject(item))!;
    const lane = caseStudyLane(work, 'ai');
    expect(lane).toContain(work);
    expect(lane.every((item) => !isPortfolioProject(item))).toBe(true);
    expect(lane.some((item) => item.contribution)).toBe(false);
  });
  it('keeps the renamed featured project first and preserves its case study link', () => {
    expect(FEATURED_PROJECTS).toEqual(['everythingisfine', 'iodine']);
    const projects = visibleProjects('all');
    expect(projects[0]?.shortName).toBe('meanwhile.');
    expect(projects.map(workId)).toEqual([
      ...FEATURED_PROJECTS,
      'mrrp',
      'worth',
      'bloomnote',
      'owewell',
      'iguess',
      'wherever',
      'platform',
    ]);
  });
});
