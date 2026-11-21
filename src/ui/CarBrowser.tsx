import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CARS, GARAGE_INDICES } from '../config';
import { useAppStore } from '../store';
import { usePageScrollLock } from './usePageScrollLock';
import { ControlIcon } from './ControlIcon';

const archiveCars = CARS.map((_, id) => id).filter((id) => !GARAGE_INDICES.includes(id));
const catalogueOrder = [...GARAGE_INDICES, ...archiveCars];

type Props = {
  onClose: () => void;
  returnFocus: HTMLElement | null;
  onChoose?: (id: number) => void;
  matched?: boolean;
  still?: string;
};

export function CarBrowser({ onClose: finishClose, returnFocus, onChoose, matched, still }: Props) {
  const index = useAppStore((state) => state.carIndex);
  const choose = useAppStore((state) => state.setCarIndex);
  const loading = useAppStore((state) => state.isCarLoading);
  const error = useAppStore((state) => state.carLoadError);
  const locked = loading && !matched;
  const retry = useAppStore((state) => state.retryCar);
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const onClose = () => {
    const el = dialog.current;
    if (closing.current) return;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose();
      return;
    }
    closing.current = true;
    el.classList.add('is-exiting');
    el.animate(
      [
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(8px) scale(.99)' },
      ],
      { duration: 160, easing: 'ease-out', fill: 'forwards' },
    )
      .finished.catch(() => {})
      .then(finishClose);
  };
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(archiveCars.includes(index));
  usePageScrollLock(true);
  useEffect(() => {
    dialog.current?.showModal();
    options.current[catalogueOrder.indexOf(index)]?.focus({ preventScroll: true });
    options.current[catalogueOrder.indexOf(index)]?.scrollIntoView({
      block: 'nearest',
    });
    return () => {
      const target =
        returnFocus?.isConnected && returnFocus.getClientRects().length
          ? returnFocus
          : Array.from(document.querySelectorAll<HTMLButtonElement>('.car-browse-trigger')).find(
              (element) => element.getClientRects().length,
            );
      target?.focus({ preventScroll: true });
    };
  }, [index, returnFocus]);
  function carTile(carIndex: number) {
    const car = CARS[carIndex];
    const position = catalogueOrder.indexOf(carIndex);
    return (
      <div key={car.file} className="car-browser-card">
        <button
          ref={(element) => {
            options.current[position] = element;
          }}
          type="button"
          className="car-option"
          aria-label={`${index === carIndex && error ? 'Retry' : 'Show'} ${car.name}, ${car.code}`}
          aria-pressed={index === carIndex}
          aria-disabled={locked}
          onClick={() => {
            if (locked) return;
            if (carIndex !== index) (onChoose ?? choose)(carIndex);
            else if (error) retry();
            onClose();
          }}
        >
          <CarThumbnail file={car.file} lazy={archiveCars.includes(carIndex)} />
          <span className="car-option-name">
            <span className="car-option-title">{car.name}</span>
            <ControlIcon name={index === carIndex ? 'check' : 'chevron'} />
          </span>
          <span className="car-option-code">
            {car.code}
            {index === carIndex ? (error ? ' · Choose to retry' : ' · Selected') : ''}
          </span>
        </button>
        {car.credit && (
          <a
            href={car.credit.url}
            target="_blank"
            aria-describedby="external-link-hint"
            rel="noopener noreferrer"
          >
            {car.defaultPaint.name} · Model by {car.credit.author} ↗
          </a>
        )}
      </div>
    );
  }
  return createPortal(
    <dialog
      ref={dialog}
      className="car-browser"
      aria-labelledby="car-browser-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        const visible = options.current.filter((node) => node?.getClientRects().length);
        const position = visible.indexOf(event.target as HTMLButtonElement);
        if (position < 0) return;
        const columns = window.matchMedia('(min-width: 1000px)').matches
          ? 4
          : window.matchMedia('(min-width: 700px)').matches
            ? 3
            : 2;
        const steps: Record<string, number> = {
          ArrowLeft: -1,
          ArrowRight: 1,
          ArrowUp: -columns,
          ArrowDown: columns,
        };
        let target: number | undefined;
        if (event.key in steps) {
          const next = position + steps[event.key];
          target =
            event.key === 'ArrowLeft' || event.key === 'ArrowRight'
              ? (next + visible.length) % visible.length
              : next >= 0 && next < visible.length
                ? next
                : position;
        }
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = visible.length - 1;
        if (target !== undefined) {
          event.preventDefault();
          visible[target]?.focus();
        }
      }}
    >
      <header className="car-browser-heading">
        <div>
          <h2 id="car-browser-title">Pick your ride.</h2>
          {matched && <p>Keep the angle. Change the car.</p>}
        </div>
        <button type="button" aria-label="Close car browser" onClick={onClose}>
          Close ×
        </button>
      </header>
      <div className="car-browser-content">
        {still && (
          <img
            className="car-browser-studio-still"
            src={still}
            alt={CARS[index].name + ' from the current Studio camera'}
          />
        )}
        <div className="car-browser-grid" aria-label="Featured cars">
          {GARAGE_INDICES.map(carTile)}
        </div>
        <details
          className="car-browser-archive"
          open={archiveOpen}
          onToggle={(event) => setArchiveOpen(event.currentTarget.open)}
        >
          <summary>
            Archive cars <span>{archiveCars.length} cars</span>
          </summary>
          {archiveOpen && (
            <div className="car-browser-grid" aria-label="Archive cars">
              {archiveCars.map(carTile)}
            </div>
          )}
        </details>
      </div>
      <footer className="car-browser-footer">
        <span>Individual model licenses apply. Credits in Contact.</span>
        <span role="status">{error ?? (loading ? `Loading ${CARS[index].name}…` : '')}</span>
        <span className="keyboard-hint">Arrow keys to browse · Enter to choose</span>
      </footer>
    </dialog>,
    document.body,
  );
}

function CarThumbnail({ file, lazy }: { file: string; lazy: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="car-preview-placeholder">Preview unavailable</span>
  ) : (
    <img
      src={`/cars/${file.replace('.glb', '.jpg')}`}
      loading={lazy ? 'lazy' : 'eager'}
      width="640"
      height="360"
      alt=""
      onError={() => setFailed(true)}
    />
  );
}
