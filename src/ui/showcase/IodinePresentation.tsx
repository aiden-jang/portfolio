import { useCallback, useRef, useState } from 'react';
import { IodineContribution } from './IodineContribution';
import { ScreenshotImage } from '../ScreenshotImage';
import { ScreenshotViewer } from '../ScreenshotViewer';

export function IodinePresentation({ image, caption }: { image: string; caption: string }) {
  const [open, setOpen] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const onUnavailable = useCallback(() => setUnavailable(true), []);
  const onReady = useCallback(() => setUnavailable(false), []);
  return (
    <figure className="iodine-example">
      <div className="product-iodine-presentation">
        <button
          className="product-iodine-shot"
          type="button"
          ref={trigger}
          disabled={unavailable}
          aria-label="Inspect Iodine editor screenshot"
          onClick={() => setOpen(true)}
        >
          <ScreenshotImage
            src={image}
            alt="Iodine editor with code and the coding assistant side by side"
            lazy
            onUnavailable={onUnavailable}
            onReady={onReady}
          />
        </button>
        <p className="product-shot-caption">{caption}</p>
        <IodineContribution />
        {open && (
          <ScreenshotViewer
            image={image}
            name="iodine"
            caption={caption}
            returnFocus={trigger.current}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </figure>
  );
}
