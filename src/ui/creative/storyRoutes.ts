export const storyIds = ['everythingisfine', 'iodine', 'ad-slot-details-120-1-api-call'] as const;
export type StoryId = (typeof storyIds)[number];

export function storyHref(id: StoryId, state?: { edit?: 'restored'; agency?: 'USGS' | 'EMSC' }) {
  const query = new URLSearchParams({ story: id });
  if (state?.edit) query.set('edit', state.edit);
  if (state?.agency) query.set('agency', state.agency);
  return window.location.pathname + '?' + query.toString();
}
