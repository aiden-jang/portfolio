import { shareLink } from '../browserSharing';
import { useShareFeedback } from './useShareFeedback';
import { useState } from 'react';
import type { WorkDetail } from '../types';
import { PREVIEWS } from '../data/projectPreviews';
import { usePreviewSelection } from './usePreviewSelection';
import { previewLink } from './previewLinks';

const pill =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--color-line)] font-[var(--font-mono)] text-[0.72rem] tracking-[0.2em] uppercase no-underline transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]';

export function WorkModalLinks({ item }: { item: WorkDetail }) {
  const preview = PREVIEWS[item.mark ?? ''];
  const [selected] = usePreviewSelection(item.shortName ?? '', preview?.states?.length ?? 1);
  const { result, run } = useShareFeedback(item.title);
  const [fallbackUrl, setFallbackUrl] = useState('');

  const share = async () => {
    const shared = new URL(
      preview?.states
        ? previewLink(window.location.href, item.shortName ?? '', selected)
        : window.location.href,
    );
    shared.hash = window.location.hash;
    const url = shared.href;
    const next = await run(() =>
      shareLink({ title: item.shortName ?? item.title, text: item.summary, url }),
    );
    if (next === 'failed') setFallbackUrl(url);
  };

  if (!item.link && !item.links?.length && !item.shortName) return null;

  return (
    <div className="work-modal-links shrink-0 flex flex-wrap gap-2.5 px-5 md:px-7 py-4 border-t border-[var(--color-line)]">
      {item.link && (
        <a
          href={item.link.url}
          target="_blank"
          aria-describedby="external-link-hint"
          rel="noopener"
          className={`${pill} text-[var(--color-fg)]`}
        >
          {item.link.label}
          <span aria-hidden="true">→</span>
        </a>
      )}
      {item.links?.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          aria-describedby="external-link-hint"
          rel="noopener"
          className={`${pill} text-[var(--color-muted)]`}
        >
          {link.label}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
      <button
        type="button"
        onClick={() => void share()}
        className={`${pill} cursor-pointer text-[var(--color-muted)]`}
      >
        {result === 'shared' ? 'Link shared' : result === 'copied' ? 'Link copied' : 'Share link'}
        <span aria-hidden="true">{result === 'shared' || result === 'copied' ? '✓' : '↗'}</span>
      </button>
      <span className="story-share-status" role="status">
        {result === 'failed'
          ? 'Copy unavailable. Select the link below to share it.'
          : result === 'shared'
            ? 'Link shared.'
            : result === 'copied'
              ? 'Link copied.'
              : ''}
      </span>
      {result === 'failed' && (
        <input
          className="story-share-fallback"
          aria-label="Case study link"
          readOnly
          value={fallbackUrl}
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
