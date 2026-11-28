import { useRef, useState, type PointerEvent } from 'react';
import { dinnerPhoto, WorthCharacter } from './DinnerRating';
import { useDinnerSequence } from './useDinnerSequence';
import './dinner-table.css';
import { useBoxCut } from './useBoxCut';
import './supper-cut.css';

type Props = {
  dinner: string;
  bill: string;
  worth: string;
  onReadDinner: (trigger: HTMLElement) => void;
  onReadBill: (trigger: HTMLElement) => void;
  onReadWorth: (trigger: HTMLElement) => void;
};

const restaurant = 'Neighborhood Pizza Kitchen';

function MealIcon({ name }: { name: 'external' | 'swipe' | 'check' | 'split' | 'heart' }) {
  const paths = {
    external: 'M6 15 16 5M8 5h8v8',
    swipe: 'M2 11h16m-5-5 5 5-5 5',
    check: 'm4 10 4 4 9-9',
    split: 'M10 3v4c0 4-5 4-5 8v2m-3-3 3 3 3-3M10 7c0 4 5 4 5 8v2m-3-3 3 3 3-3',
    heart: 'M10 17.5 3.2 11a4.6 4.6 0 0 1 6.8-6.2 4.6 4.6 0 0 1 6.8 6.2Z',
  };
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function DinnerTable({ dinner, bill, worth, onReadDinner, onReadBill, onReadWorth }: Props) {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const ignoreClick = useRef(false);
  useBoxCut(track, stage);
  const { moment, paid, act } = useDinnerSequence(track, stage);
  const [announcement, announce] = useState('');
  const [missingPhoto, setMissingPhoto] = useState(false);
  const voting = moment === 'vote';
  const atBill = moment === 'bill' || moment === 'split';
  const atWorth = moment === 'entry' || moment === 'favorite';
  const isSplit = moment === 'split';
  const isFavorite = moment === 'favorite';
  const app = atWorth ? 'worth' : atBill ? 'owewell' : 'wherever';
  const href = atWorth ? worth : atBill ? bill : dinner;

  function pick(keyboard = false) {
    act('pick', keyboard);
    announce('You and Alex picked ' + restaurant + '. Dinner for two is $48.');
    title.current?.focus({ preventScroll: true });
  }

  function split(event: React.MouseEvent<HTMLButtonElement>) {
    act('split', event.detail === 0);
    announce('The $48 bill is split equally. Your share is $24. Alex owes you $24.');
    title.current?.focus({ preventScroll: true });
  }

  function favorite() {
    act('favorite');
    announce(restaurant + (isFavorite ? ' removed from Favorites.' : ' is a Favorite in Places.'));
  }

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || !event.isPrimary) return;
    ignoreClick.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.moved) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        ignoreClick.current = true;
        drag.current = null;
        return;
      }
      if (Math.abs(dx) < 7) return;
      gesture.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    stage.current?.style.setProperty('--card-drag', Math.max(-88, Math.min(88, dx * 0.68)) + 'px');
  }

  function finish(event: PointerEvent<HTMLButtonElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    stage.current?.style.removeProperty('--card-drag');
    if (!gesture.moved) return;
    ignoreClick.current = true;
    if (event.type === 'pointerup' && Math.abs(event.clientX - gesture.x) >= 29) pick();
  }

  return (
    <article
      id="project-wherever"
      className="meal-story"
      ref={track}
      data-phase={app}
      data-paid={paid || undefined}
      data-moment={moment}
      aria-label="Dinner with wherever, owewell, and worth"
    >
      <span className="supper-entrance" aria-hidden="true" />
      <span id="project-owewell" className="meal-anchor meal-anchor-bill" aria-hidden="true" />
      <span id="project-worth" className="meal-anchor meal-anchor-entry" aria-hidden="true" />
      <div className="meal-stage" ref={stage} data-study-pin>
        <div className="meal-linen" aria-hidden="true">
          <div />
        </div>
        <div className="meal-intro" aria-hidden={!voting}>
          <h2>
            <span>Pizza</span> <span>tonight?</span>
          </h2>
        </div>

        <div className="meal-archive" aria-hidden="true">
          <div className="meal-book">
            <i />
          </div>
        </div>
        <div className="meal-photo">
          {missingPhoto ? (
            <span className="meal-photo-missing">Pizza for two</span>
          ) : (
            <img
              src={dinnerPhoto}
              alt="Pepperoni pizza on a wooden peel"
              width="700"
              height="525"
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setMissingPhoto(true)}
            />
          )}
        </div>
        <header className="meal-head">
          <a
            href={href}
            className="meal-app"
            target="_blank"
            rel="noopener"
            aria-label={'Open app: ' + app}
            aria-describedby="external-link-hint"
          >
            {app}
            <MealIcon name="external" />
          </a>
          <button
            type="button"
            className="meal-notes"
            aria-label={'How I built it: ' + app}
            onClick={(event) =>
              (atWorth ? onReadWorth : atBill ? onReadBill : onReadDinner)(event.currentTarget)
            }
          >
            Project notes
          </button>
        </header>
        <div className="meal-ticket">
          <div className="meal-ticket-stock" aria-hidden="true" />
          <h3 className="meal-name" ref={title} tabIndex={-1} aria-label={restaurant}>
            <span>Neighborhood</span> <span>Pizza Kitchen</span>
          </h3>
          <div className="supper-total">
            <span>Dinner for two</span>
            <b>$48.00</b>
          </div>
          <div className="meal-ticket-note">
            {voting ? (
              <>
                <MealIcon name="swipe" />
                Swipe or tap to pick
              </>
            ) : atWorth ? (
              <>
                <MealIcon name="check" />
                Saved in Places
              </>
            ) : atBill ? (
              <>{isSplit ? 'Paid by you' : 'Guest check'}</>
            ) : (
              <>
                <MealIcon name="check" />
                You and Alex picked this
              </>
            )}
          </div>
          <div className="meal-bill-fold" aria-hidden={!atBill}>
            <div className="meal-fold-inside">
              {isSplit ? (
                <div className="meal-shares">
                  <div>
                    <span>Your share</span>
                    <strong>$24.00</strong>
                  </div>
                  <div>
                    <span>Alex owes you</span>
                    <strong>$24.00</strong>
                  </div>
                </div>
              ) : (
                <button type="button" className="meal-split" disabled={!atBill} onClick={split}>
                  <MealIcon name="split" />
                  Split $48
                </button>
              )}
            </div>
          </div>
          <div className="meal-entry-fold" aria-hidden={!atWorth}>
            <div className="meal-fold-inside">
              <div className="supper-share">$24 each</div>
              <div className="meal-verdict">
                <button
                  className="meal-favorite"
                  type="button"
                  aria-label="Favorite"
                  aria-pressed={isFavorite}
                  disabled={!atWorth}
                  onClick={favorite}
                >
                  <MealIcon name="heart" />
                  Favorite
                </button>
                {atWorth && (
                  <span className="meal-character" data-stamping={isFavorite}>
                    <WorthCharacter />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {voting && (
          <button
            className="meal-pick"
            type="button"
            aria-label={'Pick ' + restaurant}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={finish}
            onPointerCancel={finish}
            onClick={(event) => {
              if (!ignoreClick.current || event.detail === 0) pick(event.detail === 0);
              ignoreClick.current = false;
            }}
          />
        )}
        <span className="sr-only" role="status">
          {announcement}
        </span>
      </div>
    </article>
  );
}
