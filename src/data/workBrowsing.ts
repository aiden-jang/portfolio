import { PREVIEWS } from './projectPreviews';
import { WORK_ITEMS } from './workItems';
import type { WorkDetail } from '../types';

export type ProjectFilter = 'all' | 'realtime' | 'ai' | 'social' | 'systems';

export function visibleProjects(filter: ProjectFilter): WorkDetail[] {
  return WORK_ITEMS.filter(
    (item) => item.mark && (filter === 'all' || item.categories?.includes(filter)),
  ).sort((a, b) => Object.keys(PREVIEWS).indexOf(a.mark!) - Object.keys(PREVIEWS).indexOf(b.mark!));
}

export function caseStudyLane(item: WorkDetail, filter: ProjectFilter): WorkDetail[] {
  if (!item.mark) return WORK_ITEMS.filter((candidate) => !candidate.mark);
  const filtered = visibleProjects(filter);
  return filtered.includes(item) ? filtered : visibleProjects('all');
}
