import { useDialogFocus } from '../useDialogFocus';
import { usePageScrollLock } from '../usePageScrollLock';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CARS } from '../../config';
import { useAppStore } from '../../store';
import './credits.css';

export function Credits() {
  const current = useAppStore((state) =>
    state.sceneUnavailable || state.isCarLoading || state.carLoadError
      ? null
      : CARS[state.carIndex],
  );
  const credit = current?.credit;
  const credited = CARS.filter((car) => !!car.credit);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);

  useDialogFocus(open, sheetRef, closeRef);
  usePageScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (credited.length === 0) return null;
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          setOpen(true);
        }}
        className="contact-credits"
      >
        <span>3D model credits</span>
        <span aria-hidden="true">+</span>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="3D model credits"
            onMouseDown={() => setOpen(false)}
            className="dialog-overlay fixed inset-0 z-[60] grid place-items-center bg-[rgba(5,5,13,0.78)] px-4 backdrop-blur-sm"
          >
            <section
              ref={sheetRef}
              onMouseDown={(event) => event.stopPropagation()}
              className="dialog-panel model-credits-panel"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close model credits"
                className="model-credits-close"
              >
                ×
              </button>
              <h2 className="model-credits-title">3D model credits</h2>
              <p className="model-credits-description">
                Models adapted for web display with compressed textures and geometry. Full mesh
                detail retained. Interactive paint and lighting added.
              </p>
              {current && credit && (
                <section
                  className="model-credit-feature closing-car-credit"
                  aria-label="Car in the closing frame"
                >
                  <img src={'/cars/' + current.file.replace('.glb', '.jpg')} alt="" />
                  <div>
                    <h3>{current.name}</h3>
                    <CreditDetails credit={credit} />
                  </div>
                </section>
              )}
              <ul className="model-credits-list" aria-label="Model catalogue">
                {credited
                  .filter((car) => car !== current)
                  .map((car) => (
                    <li key={car.name} className="min-w-0 text-[0.76rem] leading-[1.3]">
                      <span className="block text-[rgba(244,240,255,0.82)]">{car.name}</span>
                      <CreditDetails credit={car.credit!} />
                    </li>
                  ))}
              </ul>
              <p className="model-credits-notice">
                Vehicle designs and trademarks belong to their owners, including Porsche AG. No
                manufacturer affiliation or endorsement is implied.
              </p>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}

function CreditDetails({ credit }: { credit: NonNullable<(typeof CARS)[number]['credit']> }) {
  return (
    <div className="model-credit-detail">
      <a
        href={credit.url}
        target="_blank"
        aria-describedby="external-link-hint"
        rel="noopener"
        className="text-[0.68rem] text-[var(--color-muted)] no-underline border-b border-transparent hover:text-[var(--color-fg)] hover:border-[var(--color-neon)]"
      >
        {credit.title}
      </a>
      <span className="block mt-1 text-[0.68rem] text-[var(--color-muted)]">
        by {credit.author} ·{' '}
        <a
          href={credit.licenseUrl}
          target="_blank"
          aria-describedby="external-link-hint"
          rel="noopener"
        >
          {credit.license}
        </a>
      </span>
      {credit.upstream && (
        <span className="block mt-1 text-[0.68rem] text-[var(--color-muted)]">
          Credited source:{' '}
          <a
            href={credit.upstream.url}
            target="_blank"
            aria-describedby="external-link-hint"
            rel="noopener"
          >
            {credit.upstream.author}
          </a>
          {credit.upstream.license && credit.upstream.licenseUrl && (
            <>
              {' · '}
              <a
                href={credit.upstream.licenseUrl}
                target="_blank"
                aria-describedby="external-link-hint"
                rel="noopener"
              >
                {credit.upstream.license}
              </a>
            </>
          )}
        </span>
      )}
      {credit.notice && (
        <span className="block mt-1 text-[0.68rem] text-[var(--color-muted)]">{credit.notice}</span>
      )}
      {credit.copyright && (
        <span className="block mt-1 text-[0.68rem] text-[var(--color-muted)]">
          {credit.copyright}
        </span>
      )}
    </div>
  );
}
