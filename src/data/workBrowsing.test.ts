import { describe, expect, it } from 'vitest';
import {
  caseStudyLane,
  FEATURED_PROJECTS,
  isPortfolioProject,
  visibleProjects,
} from './workBrowsing';
import { WORK_ITEMS } from './workItems';

describe('case study browsing', () => {
  it('keeps a filtered case study in the visible project lane', () => {
    const lane = visibleProjects('ai');
    expect(caseStudyLane(lane[0], 'ai')).toEqual(lane);
    expect(lane.map((item) => item.shortName)).toEqual(['bloomnote', 'iodine', 'iguess']);
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
  it('gives three projects the spotlight while keeping the rest available in the gallery', () => {
    expect(FEATURED_PROJECTS).toEqual(['everythingisfine', 'mrrp', 'worth']);
    expect(
      visibleProjects('all')
        .filter((item) => !FEATURED_PROJECTS.includes(item.shortName!))
        .map((item) => item.shortName),
    ).toEqual(['bloomnote', 'iodine', 'owewell', 'platform', 'iguess', 'wherever']);
  });
});
