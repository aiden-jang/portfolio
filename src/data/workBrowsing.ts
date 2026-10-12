import { WORK_ITEMS } from './workItems';
import type { WorkDetail } from '../types';

export type ProjectFilter = 'all' | 'realtime' | 'ai' | 'social' | 'systems';
export const FEATURED_PROJECTS = ['everythingisfine', 'bloomnote', 'mrrp', 'worth', 'iodine'];
const PROJECT_ORDER = [...FEATURED_PROJECTS, 'owewell', 'platform', 'iguess', 'wherever'];

export function isPortfolioProject(item: WorkDetail): boolean {
  return !!(item.mark || item.contribution);
}

export function visibleProjects(filter: ProjectFilter): WorkDetail[] {
  return WORK_ITEMS.filter(
    (item) => isPortfolioProject(item) && (filter === 'all' || item.categories?.includes(filter)),
  ).sort((a, b) => PROJECT_ORDER.indexOf(a.shortName!) - PROJECT_ORDER.indexOf(b.shortName!));
}

export function caseStudyLane(item: WorkDetail, filter: ProjectFilter): WorkDetail[] {
  if (!isPortfolioProject(item))
    return WORK_ITEMS.filter((candidate) => !isPortfolioProject(candidate));
  const filtered = visibleProjects(filter);
  return filtered.includes(item) ? filtered : visibleProjects('all');
}
