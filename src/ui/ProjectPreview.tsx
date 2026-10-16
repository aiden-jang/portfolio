import { copyText } from '../browserSharing';
import { useShareFeedback } from './useShareFeedback';
import { ScreenshotImage } from './ScreenshotImage';
import { useEffect, useRef, useState } from 'react';
import { ScreenshotViewer } from './ScreenshotViewer';
import type { PreviewState } from '../data/projectPreviews';
import './preview-states.css';
import { usePreviewSelection } from './usePreviewSelection';
import { previewIndex, previewLink } from './previewLinks';
import './browsing-controls.css';

type Props = { image: string; name: string; caption: string; states?: PreviewState[] };

export function ProjectPreview({
  image: initialImage,
  name,
  caption: initialCaption,
  states,
}: Props) {
  const [selected, setSelected] = usePreviewSelection(name, states?.length ?? 1);
  const { result, run } = useShareFeedback(`${name}:${selected}`);
  const copyStatus = result === 'copied' || result === 'failed' ? result : 'idle';
  const image = states?.[selected]?.image ?? initialImage;
  const caption = states?.[selected]?.caption ?? initialCaption;
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const linked = previewIndex(
      new URLSearchParams(location.search).get('preview'),
      name,
      states?.length ?? 1,
    );
    if (linked === null || location.hash.startsWith('#work/')) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled)
        document
          .querySelector(`[data-project="${name}"]`)
          ?.closest('article')
          ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => {
      cancelled = true;
    };
  }, [name, states]);
  const shareView = async () => {
    await run(() => copyText(previewLink(location.href, name, selected)));
  };
  return (
    <>
      <figure>
        <button
          ref={trigger}
          type="button"
          className="project-preview"
          data-project={name}
          data-view={selected}
          onClick={() => {
            setOpen(true);
          }}
          aria-label={`Inspect screenshot: ${name}`}
        >
          <div className="preview-thumbnail">
            <ScreenshotImage key={image} src={image} alt={`${name} product interface`} lazy />
          </div>
          <span>Inspect screenshot ↗</span>
        </button>
        {states && (
          <div className="preview-states" role="group" aria-label={`${name} product views`}>
            {states.map((state, index) => (
              <button
                key={state.label}
                type="button"
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                {state.label}
              </button>
            ))}
          </div>
        )}
        {states &&
          previewIndex(new URLSearchParams(location.search).get('preview'), name, states.length) !==
            null && (
            <div className="preview-view-links">
              <a href="#sec-intro">Back to portfolio ↑</a>
            </div>
          )}
        <figcaption aria-live="polite">{caption}</figcaption>
      </figure>
      {open && (
        <ScreenshotViewer
          image={image}
          name={name}
          caption={caption}
          returnFocus={trigger.current}
          onClose={() => setOpen(false)}
          onShare={states ? shareView : undefined}
          shareStatus={copyStatus}
          viewLink={previewLink(location.href, name, selected)}
          navigation={
            states && states.length > 1
              ? {
                  index: selected,
                  count: states.length,
                  label: states[selected]!.label,
                  onSelect: setSelected,
                }
              : undefined
          }
        />
      )}
    </>
  );
}
