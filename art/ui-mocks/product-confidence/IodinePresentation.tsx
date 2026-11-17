import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PREVIEWS } from '../../../src/data/projectPreviews';
import { IodineWalkthrough } from '../../../src/ui/showcase/IodineWalkthrough';
import { ScreenshotViewer } from '../../../src/ui/ScreenshotViewer';

export function IodinePresentation() {
  const [target, setTarget] = useState<Element | null>(null);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setTarget(document.querySelector('#project-iodine > figure'));
  }, []);
  const preview = PREVIEWS.iodine;
  if (!target) return null;
  return createPortal(
    <div className="product-iodine-presentation">
      <button
        className="product-iodine-shot"
        type="button"
        ref={trigger}
        aria-label="Inspect Iodine editor screenshot"
        onClick={() => setOpen(true)}
      >
        <img
          src={preview.image}
          alt="Iodine editor with code and the coding assistant side by side"
        />
      </button>
      <p className="product-shot-caption">{preview.caption}</p>
      <details className="product-undo-disclosure">
        <summary>Try an edit and its undo</summary>
        <IodineWalkthrough image={preview.image} caption={preview.caption} />
      </details>
      {open && (
        <ScreenshotViewer
          image={preview.image}
          name="iodine"
          caption={preview.caption}
          returnFocus={trigger.current}
          onClose={() => setOpen(false)}
        />
      )}
    </div>,
    target,
  );
}
