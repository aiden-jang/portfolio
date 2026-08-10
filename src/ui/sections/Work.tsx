import type { CSSProperties } from 'react';
import { useState } from 'react';
import { WORK_ITEMS } from '../../data/workItems';
import type { WorkDetail } from '../WorkModal';
import { ACCENTS, marks } from '../marks';
import { EYEBROW, H2, Section } from './shared';

type Props = {
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'realtime', label: 'Realtime' },
  { id: 'ai', label: 'AI' },
  { id: 'social', label: 'For people' },
  { id: 'systems', label: 'Systems' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];

/** Side-projects section: the shipped apps (entries with a `mark`) as a product
 *  card grid. The professional highlights live in the Experience section above;
 *  these stand on their own as what I build outside of work. */
export function WorkSection({ onOpen }: Props) {
  const apps = WORK_ITEMS.filter((i) => i.mark);
  const [filter, setFilter] = useState<FilterId>('all');
  const visibleApps =
    filter === 'all' ? apps : apps.filter((item) => item.categories?.includes(filter));

  return (
    <Section id="sec-work" side="right">
      <div className="panel pointer-events-auto w-full max-w-[560px]">
        <span className={EYEBROW}>02 / PROJECTS</span>
        <h2 className={H2}>Stuff I&apos;ve made</h2>

        <div aria-label="Filter projects" className="mt-4 flex flex-wrap gap-1.5">
          {FILTERS.map((option) => {
            const active = option.id === filter;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                aria-pressed={active}
                className={`rounded-full border px-2.5 py-1.5 font-[var(--font-mono)] text-[0.58rem] tracking-[0.13em] uppercase transition-colors ${
                  active
                    ? 'border-[var(--color-neon)] bg-[var(--color-neon)]/10 text-[var(--color-neon)]'
                    : 'border-white/[0.09] text-[var(--color-muted)] hover:border-white/[0.25] hover:text-[var(--color-fg)]'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {visibleApps.map((item, i) => (
            <AppCard
              key={item.title}
              item={item}
              featured={filter === 'all' && i === 0}
              onOpen={(el) => onOpen(item, el)}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

/** Product card for a shipped app: its real mark, name, one-line summary, and a
 *  live dot. Clicking opens the full case-study modal. When `item.preview` is
 *  set it plays a looping clip on hover; otherwise the mark carries the card. */
function AppCard({
  item,
  featured,
  onOpen,
}: {
  item: WorkDetail;
  featured: boolean;
  onOpen: (el: HTMLElement) => void;
}) {
  const [clipFailed, setClipFailed] = useState(false);
  const accent = item.mark ? ACCENTS[item.mark] : 'var(--color-neon)';
  const Mark = item.mark ? marks[item.mark] : null;
  const showClip = !!item.preview && !clipFailed;

  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      style={{ '--accent': accent } as CSSProperties}
      className={`
        group relative text-left rounded-xl overflow-hidden cursor-pointer
        border border-transparent bg-[rgba(14,14,22,0.6)] p-3
        transition-[transform,border-color,background-color] duration-200
        hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[rgba(16,16,26,0.72)]
        flex items-center gap-3 ${featured ? 'md:col-span-2' : ''}
      `}
    >
      <span className="relative block w-11 h-11 rounded-lg overflow-hidden shrink-0 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.7)]">
        {Mark && <Mark />}
        {showClip && (
          <video
            src={item.preview}
            muted
            loop
            playsInline
            preload="none"
            onError={() => setClipFailed(true)}
            onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
        {/* accent glow ring on hover */}
        <span
          className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ boxShadow: '0 0 26px -6px var(--accent)' }}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="truncate font-semibold text-[0.95rem] tracking-[-0.01em] text-[var(--color-fg)]">
            {item.shortName}
          </span>
          <LiveDot />
        </span>
        <span className="mt-0.5 text-[rgba(244,240,255,0.6)] text-[0.8rem] leading-[1.4] max-md:hidden">
          {item.tagline ?? item.summary}
        </span>
        {item.moment && (
          <span className="mt-1 flex items-center gap-1.5 font-[var(--font-mono)] text-[0.57rem] tracking-[0.12em] uppercase text-[rgba(244,240,255,0.46)] max-md:hidden">
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--accent)]" />
            {item.moment}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className="hidden md:block text-[var(--color-muted)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
      >
        ↗
      </span>
    </button>
  );
}

/** Small pulsing dot signalling a live, reachable app. */
function LiveDot() {
  return (
    <span
      aria-label="Live"
      className="inline-block w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse shrink-0"
    />
  );
}
