import { useRef, useState } from 'react';
import type { ProductPreview } from '../../data/projectPreviews';
import type { WorkDetail } from '../../types';
import { ScopedApprovals } from './ScopedApprovals';
import { IodineContribution } from './IodineContribution';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { ScreenshotImage } from '../ScreenshotImage';
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
      <div className="iodine-preview-row">
        <IodineContribution />
        <button
          type="button"
          ref={trigger}
          className="iodine-editor-tile"
          aria-label="Inspect editor detail for iodine"
          onClick={() => setOpen(true)}
        >
          <ScreenshotImage src={preview.image} alt="" lazy />
          <span className="iodine-editor-label">Inspect editor detail</span>
        </button>
      </div>
      <ScopedApprovals />
      <div className="iodine-links">
        <button
          type="button"
          aria-label="Read my contribution to iodine"
          onClick={(event) => onOpen(item, event.currentTarget)}
        >
          Read my contribution
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
          editorDetail
          caption="fileSystem.ts highlights the symbolic-link check. Fit image shows the full editor and assistant."
          returnFocus={trigger.current}
          onClose={() => setOpen(false)}
        />
      )}
    </article>
  );
}
