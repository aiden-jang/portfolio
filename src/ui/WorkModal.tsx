import { followWorkIndex, indexHref } from './workIndexNavigation';
import { createPortal } from 'react-dom';
import type { WorkDetail } from '../types';
import { WorkModalLinks } from './WorkModalLinks';
import { WorkModalNav } from './WorkModalNav';
import { WorkStoryEnding } from './WorkStoryEnding';
import { WorkStory } from './WorkStory';
import { WorkStoryOpening } from './WorkStoryOpening';
import { ScrollBody } from './ScrollBody';
import { useWorkDialog } from './useWorkDialog';
import './work-modal.css';
type Props = {
  item: WorkDetail | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};
export function WorkModal({ item, onClose, onPrevious, onNext }: Props) {
  const dialog = useWorkDialog(item, { onClose, onPrevious, onNext });
  const { dialogRef, closeRef, onTouchStart, onTouchEnd, navigation } = dialog;
  if (!item) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-modal-title"
      onClick={onClose}
      className="work-modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4 py-4 bg-[rgba(5,5,13,0.9)]"
    >
      <div
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="work-modal-panel relative flex flex-col w-full max-w-[960px] max-h-[85dvh] overflow-hidden bg-[#0a0a14] border border-[var(--color-line)] rounded-xl"
      >
        <header className="work-modal-heading">
          <a href={indexHref()} onClick={followWorkIndex} className="work-modal-index">
            Work index
          </a>
          <h3 id="work-modal-title" className="work-modal-title">
            {item.displayTitle ?? item.title}
          </h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="work-modal-close"
          >
            ×
          </button>
        </header>
        <ScrollBody key={item.title} storyId={item.title}>
          <span data-nosnippet className="sr-only">
            {item.context}
          </span>
          <WorkStoryOpening item={item} />
          <WorkStory item={item} />
          <p className="work-technologies">{item.stack.join(' · ')}</p>
          <WorkStoryEnding item={item} />
        </ScrollBody>
        <div className="work-modal-footer">
          <WorkModalNav {...navigation} item={item} />
          <WorkModalLinks key={item.title} item={item} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
