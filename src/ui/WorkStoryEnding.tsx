import type { WorkDetail } from '../types';

export function WorkStoryEnding({ item }: { item: WorkDetail }) {
  const links = [...(item.link ? [item.link] : []), ...(item.links ?? [])];
  if (!links.length) return null;
  return (
    <div className="work-story-ending">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener"
          aria-describedby="external-link-hint"
        >
          {link.label}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
