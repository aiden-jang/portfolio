import { useContext, useRef, useState } from 'react';
import type { ProductPreview } from '../../data/projectPreviews';
import type { WorkDetail } from '../../types';
import { ScopedApprovals } from './ScopedApprovals';
import { IodineContribution } from './IodineContribution';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { ScreenshotImage } from '../ScreenshotImage';
import './iodine-presentation.css';
import { storyHref } from '../creative/storyRoutes';
import { IodineSession } from './iodine-session';

type Props = {
  item: WorkDetail;
  preview: ProductPreview;
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

export function IodinePresentation({ item, preview, onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const session = useContext(IodineSession);
  const story = storyHref('iodine', {
    edit: session?.phase === 'restored' ? 'restored' : undefined,
  });
  return (
    <article id="project-iodine" className="garage-project iodine-feature">
      <div className="iodine-intro">
        <h3>{item.shortName}</h3>
        <div>
          <p className="iodine-summary">
            I contributed scoped terminal approvals and agent edit recovery to the open-source IDE.
          </p>
        </div>
      </div>
      <div className="iodine-preview-row">
        <IodineContribution reader />
        <div className="iodine-editor-tile story-photo-card">
          <button
            type="button"
            data-story-source="iodine"
            aria-label="Read the Iodine case study from the editor image"
            onClick={(event) => onOpen(item, event.currentTarget)}
          >
            <ScreenshotImage src={preview.image} alt="" lazy />
            <span className="iodine-editor-label">Read the case study</span>
          </button>
          <button
            type="button"
            ref={trigger}
            className="story-photo-inspect"
            aria-label="Inspect editor detail for iodine"
            onClick={() => setOpen(true)}
          >
            Inspect editor
          </button>
        </div>
      </div>
      <ScopedApprovals />
      <div className="iodine-links">
        <a href={story} aria-label="Read my contribution to iodine">
          Read my contribution
        </a>
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
