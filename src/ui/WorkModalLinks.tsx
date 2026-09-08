import { useEffect, useState } from 'react';
import type { WorkDetail } from '../types';

const pill =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--color-line)] font-[var(--font-mono)] text-[0.72rem] tracking-[0.2em] uppercase no-underline transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]';

export function WorkModalLinks({ item }: { item: WorkDetail }) {
  const [result, setResult] = useState<'shared' | 'copied' | null>(null);

  useEffect(() => setResult(null), [item]);

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: item.shortName ?? item.title, text: item.summary, url });
        setResult('shared');
        window.setTimeout(() => setResult(null), 1800);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setResult('copied');
      window.setTimeout(() => setResult(null), 1800);
    } catch {
      // No clipboard in a private or embedded browser. The URL in the bar is still shareable.
    }
  };

  if (!item.link && !item.links?.length && !item.shortName) return null;

  return (
    // A flex sibling of the scroll area, so it stays flush to the panel edge no matter
    // how long the body is.
    <div className="shrink-0 flex flex-wrap gap-2.5 px-5 md:px-7 py-4 border-t border-[var(--color-line)]">
      {item.link && (
        <a
          href={item.link.url}
          target="_blank"
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
        <span aria-hidden="true">{result ? '✓' : '↗'}</span>
      </button>
    </div>
  );
}
