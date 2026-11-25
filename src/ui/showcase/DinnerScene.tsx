import { useEffect, useRef, type PointerEvent } from 'react';
import { shortPhoneQuery } from '../../hooks/scrollArrival';
import './dinner-scene.css';

export type DinnerStep = { progress: number; focus?: string; animate?: boolean; reset?: boolean };

function DinnerTicket() {
  const drag = useRef<{ id: number; x: number; left: number } | null>(null);
  const splitTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(splitTimer.current), []);
  function send(stage: HTMLElement | null, detail: DinnerStep) {
    stage?.dispatchEvent(new CustomEvent<DinnerStep>('dinner-preview-step', { detail }));
  }
  function start(event: PointerEvent<HTMLImageElement>) {
    if (
      event.button !== 0 ||
      matchMedia('(prefers-reduced-motion: reduce), (max-height: 609px)').matches
    )
      return;
    clearTimeout(splitTimer.current);
    drag.current = { id: event.pointerId, x: event.clientX, left: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<HTMLImageElement>) {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    const moved = event.clientX - state.x;
    if (!state.left && Math.abs(moved) < 7) return;
    const ticket = event.currentTarget.closest<HTMLElement>('.dinner-ticket');
    if (!state.left && ticket?.closest('article')?.getAttribute('data-dinner-state') === 'bill')
      return;
    if (!state.left) send(ticket?.closest('article') ?? null, { progress: 0, reset: true });
    state.left = moved;
    ticket?.style.setProperty('--dinner-flick', Math.max(-112, Math.min(112, moved * 0.7)) + 'px');
    ticket?.setAttribute('data-flicking', '');
  }
  function finish(event: PointerEvent<HTMLImageElement>) {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    const ticket = event.currentTarget.closest<HTMLElement>('.dinner-ticket');
    ticket?.removeAttribute('data-flicking');
    ticket?.style.removeProperty('--dinner-flick');
    if (!state.left) return;
    const stage = ticket?.closest('article') ?? null;
    if (event.type === 'pointercancel' || Math.abs(state.left) < 22) {
      send(stage, { progress: 1, animate: true });
      return;
    }
    send(stage, { progress: 0.47, animate: true });
    splitTimer.current = setTimeout(() => {
      const bounds = stage?.getBoundingClientRect();
      const visible = !!bounds && bounds.bottom > 0 && bounds.top < innerHeight && !document.hidden;
      send(stage, { progress: 1, animate: visible });
    }, 760);
  }
  const choose = (event: React.MouseEvent<HTMLButtonElement>, phase: number) => {
    const stage = event.currentTarget.closest('article');
    send(stage, {
      progress: phase,
      focus: phase === 1 ? '.dinner-title-bill a' : '.dinner-split',
    });
  };
  return (
    <div className="dinner-ticket">
      <img
        className="dinner-ticket-photo"
        src="/projects/scenes/wherever-pizza.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
      />
      <div className="dinner-receipt" id="project-owewell">
        <div className="dinner-ticket-paper paper">
          <div className="dinner-ticket-state">
            <span className="dinner-ticket-vote">Pick your dinner</span>
            <span className="dinner-ticket-match">Tonight’s plan</span>
          </div>
          <strong>Neighborhood Pizza Kitchen</strong>
          <div className="dinner-ticket-decisions">
            <div className="dinner-ticket-vote dinner-ticket-actions">
              <button type="button" onClick={(event) => choose(event, 0.47)}>
                Vote yes
              </button>
            </div>
            <div className="dinner-ticket-match dinner-ticket-count">
              <span>
                Alex <b>✓</b>
              </span>
              <span>
                Maya <b>✓</b>
              </span>
              <button className="dinner-split" type="button" onClick={(event) => choose(event, 1)}>
                Split $48
              </button>
            </div>
            <div className="dinner-total" aria-hidden="true">
              <small>Dinner for two</small>
              <strong>$48.00</strong>
            </div>
          </div>
        </div>
        <div className="stubs dinner-stubs" aria-hidden="true">
          <div className="paper stub">
            <small>Your share</small>
            <strong>$24.00</strong>
          </div>
          <div className="paper stub due">
            <small>Alex owes you</small>
            <strong>$24.00</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DinnerScene({ onRead }: { onRead?: (button: HTMLElement) => void }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = track.current;
    const section = stage?.closest('article');
    const body = stage?.parentElement;
    if (!stage || !section || !body) return;
    const animated = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 610px)');
    const seekSecond = () => {
      if (location.hash !== '#project-owewell') return;
      section.dispatchEvent(
        new CustomEvent<DinnerStep>('dinner-preview-step', {
          detail: { progress: 1 },
        }),
      );
      if (!animated.matches || matchMedia(shortPhoneQuery).matches) {
        stage
          .querySelector('#project-owewell')
          ?.scrollIntoView({ block: 'center', behavior: 'instant' });
        return;
      }
      const top = window.scrollY + section.getBoundingClientRect().top;
      const inset = Number.parseFloat(getComputedStyle(body).top);
      const travel = section.offsetHeight - body.offsetHeight;
      window.scrollTo({ top: top - inset + travel * 0.9, behavior: 'instant' });
    };
    let frame = 0;
    let active = true;
    const queueSeek = () => {
      cancelAnimationFrame(frame);
      // Reload can restore the old scroll offset after the first layout.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(seekSecond);
      });
    };
    const restoreLink = (event: PageTransitionEvent) => {
      if (!event.persisted) queueSeek();
    };
    queueSeek();
    void document.fonts?.ready.then(() => {
      if (active) queueSeek();
    });
    addEventListener('pageshow', restoreLink);
    addEventListener('hashchange', queueSeek);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      removeEventListener('pageshow', restoreLink);
      removeEventListener('hashchange', queueSeek);
    };
  }, []);

  return (
    <div className="dinner-sequence" ref={track}>
      <DinnerTicket />
      {onRead && (
        <button
          type="button"
          className="dinner-case"
          hidden
          onClick={(event) => {
            track.current?.closest('article')?.dispatchEvent(
              new CustomEvent<DinnerStep>('dinner-preview-step', {
                detail: { progress: 1 },
              }),
            );
            onRead(event.currentTarget);
          }}
        >
          Case study <span aria-hidden="true">↗</span>
        </button>
      )}
      <div className="dinner-exit-shade" aria-hidden="true" />
    </div>
  );
}
