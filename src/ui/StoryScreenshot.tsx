import { useCallback, useRef, useState } from 'react';
import { ScreenshotImage } from './ScreenshotImage';
import { ScreenshotViewer } from './ScreenshotViewer';
import { ExpandIcon } from './ExpandIcon';

export function StoryScreenshot({
  image,
  name,
  caption,
  cover,
}: {
  image: string;
  name: string;
  caption: string;
  cover?: string;
}) {
  const [open, setOpen] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const unavailable = failedImage === image;
  const onUnavailable = useCallback(() => setFailedImage(image), [image]);
  const onReady = useCallback(
    () => setFailedImage((current) => (current === image ? null : current)),
    [image],
  );
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <figure
      className={cover ? 'story-screenshot reader-cover' : 'story-screenshot'}
      data-project={name}
      data-story-cover={cover}
    >
      <button
        ref={trigger}
        type="button"
        className="story-image-trigger"
        disabled={unavailable}
        onClick={() => setOpen(true)}
        aria-label={`Inspect screenshot: ${name} case study`}
      >
        <span className={cover ? 'story-image-crop reader-cover-frame' : 'story-image-crop'}>
          <ScreenshotImage
            src={image}
            alt={`${name} product interface`}
            onUnavailable={onUnavailable}
            onReady={onReady}
          />
        </span>
        {!unavailable && <ExpandIcon />}
      </button>
      <figcaption>{caption}</figcaption>
      {open && (
        <ScreenshotViewer
          image={image}
          name={name}
          caption={caption}
          returnFocus={trigger.current}
          onClose={() => setOpen(false)}
        />
      )}
    </figure>
  );
}
