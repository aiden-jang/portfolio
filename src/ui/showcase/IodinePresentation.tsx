import { useRef, useState } from 'react';
import type { ProductPreview } from '../../data/projectPreviews';
import type { WorkDetail } from '../../types';
import { IodineContribution } from './IodineContribution';
import { ScreenshotViewer } from '../ScreenshotViewer';
import './iodine-presentation.css';

type Props = {
  item: WorkDetail;
  preview: ProductPreview;
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

export function IodinePresentation({ item, preview, onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <article id="project-iodine" className="garage-project iodine-feature">
      <div className="iodine-intro">
        <h3>{item.shortName}</h3>
        <div>
          <p className="iodine-summary">
            Scoped terminal approvals and agent edit recovery for an open-source IDE.
          </p>
          <p className="iodine-role">Open-source contributor</p>
        </div>
      </div>
      <IodineContribution />
      <div className="iodine-evidence">
        <h4>Scoped terminal approvals</h4>
        <p>
          Reusable approvals stay within approved command signatures and paths. Local embeddings
          suggest similar commands.
        </p>
      </div>
      <div className="iodine-links">
        <button
          type="button"
          aria-label="Read my contribution to iodine"
          onClick={(event) => onOpen(item, event.currentTarget)}
        >
          Read my contribution
        </button>
        <button
          type="button"
          ref={trigger}
          aria-label="View editor screenshot for iodine"
          onClick={() => setOpen(true)}
        >
          View editor screenshot
        </button>
        {item.link && (
          <a
            href={item.link.url}
            target="_blank"
            aria-describedby="external-link-hint"
            aria-label="View changes on GitHub: iodine"
            rel="noopener"
          >
            View changes on GitHub <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      {open && (
        <ScreenshotViewer
          image={preview.image}
          name="iodine"
          caption={preview.caption}
          returnFocus={trigger.current}
          onClose={() => setOpen(false)}
        />
      )}
    </article>
  );
}
