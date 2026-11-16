import { shareLink } from '../browserSharing';
import { useShareFeedback } from './useShareFeedback';
import { useState } from 'react';
import type { WorkDetail } from '../types';
import { PREVIEWS } from '../data/projectPreviews';
import { usePreviewSelection } from './usePreviewSelection';
import { previewLink } from './previewLinks';

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
  const secondary = (
    <>
      {item.links?.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          aria-describedby="external-link-hint"
          rel="noopener"
        >
          {link.label}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
      <button type="button" onClick={() => void share()}>
        {result === 'shared' ? 'Link shared' : result === 'copied' ? 'Link copied' : 'Share link'}
        <span aria-hidden="true">{result === 'shared' || result === 'copied' ? '✓' : '↗'}</span>
      </button>
    </>
  );

  return (
    <div className="work-modal-links">
      {item.link && (
        <a
          href={item.link.url}
          target="_blank"
          aria-describedby="external-link-hint"
          rel="noopener"
        >
          {item.link.label}
          <span aria-hidden="true">→</span>
        </a>
      )}
      <div className="story-secondary-inline">{secondary}</div>
      <details className="story-secondary-menu">
        <summary aria-label="Source and sharing">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </summary>
        <div className="story-secondary-panel">{secondary}</div>
      </details>
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
