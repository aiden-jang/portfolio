export const workJumps = [
  {
    label: 'Quake readings',
    href: '#quake/kamchatka/USGS',
    keywords: 'meanwhile globe earthquake',
  },
  { label: 'Iodine edit recovery', href: '#project-iodine', keywords: 'undo edit case study' },
  { label: '120 calls → 1', href: '#batching-study', keywords: 'experience batching results API' },
  { label: 'Bean’s room', href: '#project-mrrp', keywords: 'mrrp cat room' },
] as const;

export function jumpToWork(href: (typeof workJumps)[number]['href']) {
  if (location.hash !== href) location.hash = href;
  else window.dispatchEvent(new HashChangeEvent('hashchange'));
}
