import { copyText, shareLink } from '../browserSharing';
import { useShareFeedback } from './useShareFeedback';
import { useRef, useState } from 'react';
import type { WorkDetail } from '../types';
import { PREVIEWS } from '../data/projectPreviews';
import { usePreviewSelection } from './usePreviewSelection';
import { ControlIcon } from './ControlIcon';

export function WorkModalLinks({ item }: { item: WorkDetail }) {
  const preview = PREVIEWS[item.mark ?? ''];
  const [selected] = usePreviewSelection(item.shortName ?? '', preview?.states?.length ?? 1);
  const { result, run } = useShareFeedback(item.title);
  const [fallbackUrl, setFallbackUrl] = useState('');
  const copyButton = useRef<HTMLButtonElement>(null);

  const hasSources = Boolean(item.link || item.links?.length || item.shortName);
  const share = async (copy = false) => {
    const shared = new URL(window.location.pathname, window.location.origin);
    if (preview?.states && item.shortName) {
      shared.searchParams.set('preview', `${item.shortName}:${selected}`);
    }
    shared.hash = window.location.hash;
    const url = shared.href;
    const next = await run(() =>
      copy
        ? copyText(url)
        : shareLink({ title: item.shortName ?? item.title, text: item.summary, url }),
    );
    if (next === 'failed') setFallbackUrl(url);
  };

  if (!hasSources)
    return (
      <>
        <div className="work-modal-links">
          <button
            ref={copyButton}
            type="button"
            className="story-copy-case"
            onClick={() => void share(true)}
          >
            <ControlIcon name={result === 'copied' ? 'check' : 'copy'} />
            {result === 'copied' ? 'Link copied' : 'Copy case link'}
          </button>
          <span className="sr-only" role="status">
            {result === 'copied'
              ? 'Case link copied.'
              : result === 'failed' && fallbackUrl
                ? 'Copy unavailable. Select the case study link.'
                : ''}
          </span>
        </div>
        {result === 'failed' && fallbackUrl && (
          <div className="story-direct-link">
            <label>
              Case study link
              <input
                readOnly
                value={fallbackUrl}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setFallbackUrl('');
                copyButton.current?.focus();
              }}
            >
              Done
            </button>
          </div>
        )}
      </>
    );
  const secondary = (
    <>
      {item.link && (
        <a
          href={item.link.url}
          target="_blank"
          rel="noopener"
          aria-describedby="external-link-hint"
        >
          {item.link.label}
          <span aria-hidden="true">↗</span>
        </a>
      )}
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
        <ControlIcon name={result === 'shared' || result === 'copied' ? 'check' : 'share'} />
      </button>
    </>
  );

  return (
    <div className="work-modal-links">
      <details className="story-secondary-menu">
        <summary aria-label="Source and sharing">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </summary>
        <div className="story-secondary-panel">
          {secondary}
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
      </details>
    </div>
  );
}
