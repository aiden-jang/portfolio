export const storyIds = ['everythingisfine', 'iodine', 'ad-slot-details-120-1-api-call'] as const;
export type StoryId = (typeof storyIds)[number];

export function storyHref(id: StoryId, state?: { edit?: 'restored'; agency?: 'USGS' | 'EMSC' }) {
  const query = new URLSearchParams({ story: id });
  if (state?.edit) query.set('edit', state.edit);
  if (state?.agency) query.set('agency', state.agency);
  return portfolioPath(window.location.pathname) + '?' + query.toString();
}

const caseSlugs = { everythingisfine: 'meanwhile', iodine: 'iodine' } as const;
type FeaturedStory = keyof typeof caseSlugs;

function caseRoute(path: string) {
  return /\/cases\/(meanwhile|iodine)(?:\/index\.html|\/)?$/.exec(path);
}

export function storyAtLocation({ pathname, search }: Location) {
  const slug = caseRoute(pathname)?.[1];
  if (slug) return slug === 'meanwhile' ? 'everythingisfine' : 'iodine';
  const query = new URLSearchParams(search).get('story');
  return storyIds.find((id) => id === query);
}

export function portfolioPath(path: string) {
  const match = caseRoute(path);
  return match ? path.slice(0, match.index + 1) : path;
}

export function evidenceHref(id: StoryId, state: Parameters<typeof storyHref>[1]) {
  if (!(id in caseSlugs)) return storyHref(id, state);
  const query = new URLSearchParams();
  if (state?.edit) query.set('edit', state.edit);
  if (state?.agency) query.set('agency', state.agency);
  const search = query.size ? '?' + query.toString() : '';
  return (
    portfolioPath(location.pathname) + 'cases/' + caseSlugs[id as FeaturedStory] + '/' + search
  );
}
