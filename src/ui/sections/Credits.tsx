import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CARS } from '../../config';

/** Model credits stay out of the Contact layout until requested. A compact
 * sheet keeps attribution easy to inspect without stretching the final section
 * into an awkward extra page. */
export function Credits() {
  const credited = CARS.filter((car) => !!car.credit);
  const licenses = [...new Set(credited.map((car) => car.credit!.license))];
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  if (credited.length === 0) return null;
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="group pointer-events-auto mt-5 inline-flex items-center gap-2 border-t border-[var(--color-line)] pt-3 font-[var(--font-mono)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
      >
        <span>3D model credits ({credited.length})</span>
        <span
          aria-hidden="true"
          className="grid h-5 w-5 place-items-center rounded-full border border-[var(--color-line)] text-[0.8rem] transition-colors group-hover:border-[var(--color-neon)] group-hover:text-[var(--color-neon)]"
        >
          +
        </span>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="3D model credits"
            onMouseDown={() => setOpen(false)}
            className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(5,5,13,0.78)] px-4 backdrop-blur-sm"
          >
            <section
              ref={sheetRef}
              onMouseDown={(event) => event.stopPropagation()}
              className="relative w-full max-w-[440px] max-h-[76dvh] overflow-y-auto rounded-2xl border border-white/[0.14] bg-[#0b0b15] p-5 text-left shadow-[0_24px_80px_-22px_rgba(0,0,0,0.9)] animate-[app-fade-in_160ms_ease-out_both]"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close model credits"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line)] text-lg text-[var(--color-muted)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
              >
                ×
              </button>
              <p className="pr-10 font-[var(--font-mono)] text-[0.62rem] tracking-[0.2em] uppercase text-[var(--color-fg)]">
                3D model credits
              </p>
              <p className="mt-2 font-[var(--font-mono)] text-[0.54rem] tracking-[0.09em] text-[rgba(244,240,255,0.48)]">
                {licenses.length === 1
                  ? `All models are ${licenses[0]}.`
                  : `Licenses: ${licenses.join(', ')}.`}
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 list-none p-0 m-0">
                {credited.map((car) => {
                  const credit = car.credit!;
                  return (
                    <li key={car.name} className="min-w-0 text-[0.76rem] leading-[1.3]">
                      <span className="block truncate text-[rgba(244,240,255,0.82)]">
                        {car.name}
                      </span>
                      <a
                        href={credit.url}
                        target="_blank"
                        rel="noopener"
                        className="text-[0.68rem] text-[var(--color-muted)] no-underline border-b border-transparent hover:text-[var(--color-fg)] hover:border-[var(--color-neon)]"
                      >
                        by {credit.author}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
