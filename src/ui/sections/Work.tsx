import type { CSSProperties } from 'react';
import { useState } from 'react';
import { WORK_ITEMS } from '../../data/workItems';
import type { WorkDetail } from '../WorkModal';
import { ACCENTS, marks } from '../marks';
import { EYEBROW, H2, Section } from './shared';

type Props = {
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

/** Work section. The shipped apps (entries with a `mark`) render as a product
 *  card grid; everything else stays as editorial rows below. The panel scrolls
 *  internally if it outgrows the viewport, so the scroll-snap section model
 *  (one screen per section) holds on short displays. */
export function WorkSection({ onOpen }: Props) {
  const apps = WORK_ITEMS.filter((i) => i.mark);
  const rest = WORK_ITEMS.filter((i) => !i.mark);

  return (
    <Section id="sec-work" side="right">
      <div className="panel pointer-events-auto w-full max-w-[560px]">
        <span className={EYEBROW}>01 / WORK</span>
        <h2 className={H2}>Selected work</h2>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {apps.map((item, i) => (
            <AppCard
              key={item.title}
              item={item}
              featured={i === 0}
              onOpen={(el) => onOpen(item, el)}
            />
          ))}
        </div>

        <p className="mt-4 mb-0.5 font-[var(--font-mono)] text-[0.62rem] tracking-[0.24em] uppercase text-[var(--color-muted)]">
          Before the side projects
        </p>
        <div>
          {rest.map((item) => (
            <WorkRow key={item.title} item={item} onOpen={(el) => onOpen(item, el)} />
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
        group relative text-left rounded-xl overflow-hidden
        border border-[var(--color-line)] bg-[rgba(10,10,18,0.55)] p-3
        transition-[transform,border-color,background-color] duration-200
        hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[rgba(14,14,26,0.72)]
        flex items-center gap-3 ${featured ? 'col-span-2' : ''}
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
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-[0.95rem] tracking-[-0.01em] text-[var(--color-fg)]">
            {item.shortName}
          </span>
          <LiveDot />
        </span>
        <span className="block mt-0.5 text-[rgba(244,240,255,0.6)] text-[0.8rem] leading-[1.4] line-clamp-1">
          {item.summary}
        </span>
      </span>
    </button>
  );
}

/** Editorial-row item used for the professional (non-app) work. Clicking opens
 *  the full case-study modal. */
function WorkRow({ item, onOpen }: { item: WorkDetail; onOpen: (el: HTMLElement) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      className="
        group w-full text-left block py-[0.4rem]
        border-y border-transparent rounded-md -mx-2 px-2
        transition-colors duration-200
        hover:border-[var(--color-line)] hover:bg-white/[0.02]
      "
    >
      <p className="text-[rgba(244,240,255,0.8)] text-[0.85rem] leading-[1.45] m-0 line-clamp-1 transition-colors group-hover:text-[var(--color-fg)]">
        {item.summary}
      </p>
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
