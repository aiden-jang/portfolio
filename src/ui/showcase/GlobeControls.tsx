import type { Ref } from 'react';
import { ControlIcon } from '../ControlIcon';

type Props = {
  reduced: boolean;
  rotating: boolean;
  showRef: Ref<HTMLButtonElement>;
  onRotate: () => void;
  onShow: () => void;
  eventSelected: boolean;
  onReset: () => void;
  onDone: () => void;
};

export function GlobeControls({
  reduced,
  rotating,
  showRef,
  onRotate,
  onShow,
  eventSelected,
  onReset,
  onDone,
}: Props) {
  return (
    <>
      {!reduced && (
        <button
          type="button"
          className="orbit-rotate"
          aria-label={rotating ? 'Pause rotation' : 'Resume rotation'}
          title={rotating ? 'Pause rotation' : 'Resume rotation'}
          onClick={onRotate}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {rotating ? <path d="M9 5v14m6-14v14" /> : <path d="m9 5 11 7-11 7z" />}
          </svg>
        </button>
      )}
      <button
        ref={showRef}
        type="button"
        className="orbit-event-trigger"
        aria-label={eventSelected ? 'Show another event' : 'Show Kamchatka'}
        title={eventSelected ? 'Show another event' : 'Show Kamchatka'}
        onClick={onShow}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        {!eventSelected && <span>Kamchatka</span>}
      </button>
      <button
        type="button"
        className="orbit-reset"
        aria-label="Reset globe"
        title="Reset globe"
        onClick={onReset}
      >
        <ControlIcon name="reset" />
      </button>
      <button type="button" onClick={onDone}>
        Done
      </button>
    </>
  );
}
