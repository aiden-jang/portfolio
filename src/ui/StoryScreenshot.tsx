import { useRef, useState } from 'react';
import { ScreenshotImage } from './ScreenshotImage';
import { ScreenshotViewer } from './ScreenshotViewer';

export function StoryScreenshot({
  image,
  name,
  caption,
}: {
  image: string;
  name: string;
  caption: string;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <figure className="story-screenshot" data-project={name}>
      <button
        ref={trigger}
        type="button"
        className="story-image-trigger"
        onClick={() => setOpen(true)}
        aria-label={`Inspect screenshot: ${name} case study`}
      >
        <span className="story-image-crop">
          <ScreenshotImage key={image} src={image} alt={`${name} product interface`} />
        </span>
        <span className="story-image-action">Inspect screenshot ↗</span>
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
