import { WORK_ITEMS, workId } from './workItems';
import type { WorkDetail } from '../types';

export type ProjectFilter = 'all' | 'realtime' | 'ai' | 'social' | 'systems';
export const FEATURED_PROJECTS = ['everythingisfine', 'iodine'];
const PROJECT_ORDER = [
  ...FEATURED_PROJECTS,
  'mrrp',
  'worth',
  'bloomnote',
  'owewell',
  'iguess',
  'wherever',
  'platform',
];

export function isPortfolioProject(item: WorkDetail): boolean {
  return !!(item.mark || item.contribution);
}

export function visibleProjects(filter: ProjectFilter): WorkDetail[] {
  return WORK_ITEMS.filter(
    (item) => isPortfolioProject(item) && (filter === 'all' || item.categories?.includes(filter)),
  ).sort((a, b) => PROJECT_ORDER.indexOf(workId(a)) - PROJECT_ORDER.indexOf(workId(b)));
}

export function caseStudyLane(item: WorkDetail, filter: ProjectFilter): WorkDetail[] {
  if (!isPortfolioProject(item))
    return WORK_ITEMS.filter((candidate) => !isPortfolioProject(candidate));
  const filtered = visibleProjects(filter);
  return filtered.includes(item) ? filtered : visibleProjects('all');
}
