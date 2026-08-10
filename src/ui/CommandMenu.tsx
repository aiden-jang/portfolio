import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CARS, SECTION_IDS, type SectionId } from '../config';
import { shareCurrentScene } from '../sceneLink';
import { useAppStore } from '../store';

type Command = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void | Promise<void>;
  closeOnRun?: boolean;
};

export const COMMAND_MENU_EVENT = 'portfolio:open-command-menu';

const SECTION_LABELS: Record<SectionId, string> = {
  'sec-intro': 'Intro',
  'sec-experience': 'Experience',
  'sec-work': 'Projects',
  'sec-about': 'About',
  'sec-contact': 'Contact',
};

/** A small keyboard-first control surface. It exposes the site’s existing
 * navigation and scene controls without asking visitors to discover a long
 * shortcut list or leave the 3D experience. */
export function CommandMenu({ onSection }: { onSection: (id: SectionId) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const activeResultRef = useRef<HTMLButtonElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      ...SECTION_IDS.map((id) => ({
        id,
        label: `Go to ${SECTION_LABELS[id]}`,
        hint: 'section',
        keywords: `${SECTION_LABELS[id]} navigate`,
        run: () => onSection(id),
      })),
      ...CARS.map((car, index) => ({
        id: `car-${index}`,
        label: `Show ${car.name}`,
        hint: String(index + 1),
        keywords: `${car.name} ${car.code} vehicle garage`,
        run: () => {
          const state = useAppStore.getState();
          if (!state.isCarLoading && state.carIndex !== index) state.setCarIndex(index);
        },
      })),
      {
        id: 'next-car',
        label: 'Next car',
        hint: '→',
        keywords: 'car vehicle switch',
        run: () => {
          const state = useAppStore.getState();
          if (!state.isCarLoading) state.cycleCar();
        },
      },
      {
        id: 'previous-car',
        label: 'Previous car',
        hint: '←',
        keywords: 'car vehicle switch',
        run: () => {
          const state = useAppStore.getState();
          if (!state.isCarLoading) state.prevCar();
        },
      },
      {
        id: 'repaint',
        label: 'Change paint color',
        hint: 'C',
        keywords: 'paint color body repaint',
        run: () => {
          const state = useAppStore.getState();
          if (!state.isCarLoading) state.cycleBodyColor();
        },
      },
      {
        id: 'theme',
        label: 'Toggle studio lighting',
        hint: 'B',
        keywords: 'theme background night day lighting',
        run: () => useAppStore.getState().toggleTheme(),
      },
      {
        id: 'surprise',
        label: 'Surprise me',
        hint: 'X',
        keywords: 'randomize surprise shuffle garage car paint lighting',
        run: () => {
          const state = useAppStore.getState();
          if (!state.isCarLoading) state.randomizeGarage();
        },
      },
      {
        id: 'rev',
        label: 'Rev the engine',
        hint: 'R',
        keywords: 'engine car rumble shake',
        run: () => useAppStore.getState().triggerRev(),
      },
      {
        id: 'reset-view',
        label: 'Reset camera view',
        hint: 'V',
        keywords: 'camera view orbit reset',
        run: () => useAppStore.getState().resetCamera(),
      },
      {
        id: 'share-garage',
        label: 'Share this garage',
        hint: 'link',
        keywords: 'share copy car paint lighting garage',
        closeOnRun: false,
        run: async () => {
          const result = await shareCurrentScene();
          setNotice(
            result === 'shared'
              ? 'Garage shared'
              : result === 'copied'
                ? 'Garage link copied'
                : 'Could not share the garage',
          );
        },
      },
    ],
    [onSection],
  );

  const results = commands.filter((command) => {
    const needle = query.trim().toLowerCase();
    return !needle || `${command.label} ${command.keywords}`.toLowerCase().includes(needle);
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    activeResultRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        !!target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (!inField && event.key === '?') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const openFromControl = () => setOpen(true);
    window.addEventListener(COMMAND_MENU_EVENT, openFromControl);
    return () => window.removeEventListener(COMMAND_MENU_EVENT, openFromControl);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setNotice('');
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])',
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
    window.addEventListener('keydown', trapFocus);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', trapFocus);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  const select = async (command: Command) => {
    await command.run();
    if (command.closeOnRun !== false) setOpen(false);
  };

  // Keep the dialog out of the accessibility tree—and out of the tab order—
  // until it is actually open. `aria-hidden` alone does not prevent an input
  // from receiving keyboard focus in every browser.
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[min(18vh,9rem)] bg-[rgba(5,5,13,0.72)]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="w-full max-w-[490px] overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0b0b15]/95 shadow-[0_24px_80px_-22px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-[app-fade-in_160ms_ease-out_both]"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.1] px-4 py-3">
          <span aria-hidden="true" className="text-[var(--color-neon)]">
            ⌘
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && results.length) {
                event.preventDefault();
                setActiveIndex((index) => (index + 1) % results.length);
              }
              if (event.key === 'ArrowUp' && results.length) {
                event.preventDefault();
                setActiveIndex((index) => (index - 1 + results.length) % results.length);
              }
              if (event.key === 'Home' && results.length) {
                event.preventDefault();
                setActiveIndex(0);
              }
              if (event.key === 'End' && results.length) {
                event.preventDefault();
                setActiveIndex(results.length - 1);
              }
              if (event.key === 'Enter' && results[activeIndex]) {
                event.preventDefault();
                void select(results[activeIndex]);
              }
            }}
            placeholder="Jump somewhere, change the scene…"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-activedescendant={
              results[activeIndex] ? `command-${results[activeIndex].id}` : undefined
            }
            aria-controls="command-results"
            className="min-w-0 flex-1 bg-transparent font-[var(--font-display)] text-[0.96rem] text-[var(--color-fg)] outline-none placeholder:text-[rgba(244,240,255,0.36)]"
          />
          <kbd className="rounded border border-white/[0.12] px-1.5 py-0.5 font-[var(--font-mono)] text-[0.58rem] tracking-[0.1em] text-[var(--color-muted)]">
            ESC
          </kbd>
        </div>
        <div id="command-results" role="listbox" className="max-h-[52dvh] overflow-y-auto p-2">
          {results.length ? (
            results.map((command, index) => (
              <button
                key={command.id}
                ref={index === activeIndex ? activeResultRef : null}
                id={`command-${command.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => void select(command)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${
                  index === activeIndex ? 'bg-white/[0.07]' : 'hover:bg-white/[0.07]'
                }`}
              >
                <span
                  className={`text-[0.92rem] transition-colors ${
                    index === activeIndex
                      ? 'text-[var(--color-fg)]'
                      : 'text-[rgba(244,240,255,0.86)] group-hover:text-[var(--color-fg)]'
                  }`}
                >
                  {command.label}
                </span>
                <span className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.14em] uppercase text-[var(--color-muted)]">
                  {command.hint}
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-[0.85rem] text-[var(--color-muted)]">
              No matching controls.
            </p>
          )}
        </div>
        <div
          aria-live="polite"
          className="border-t border-white/[0.08] px-4 py-2.5 font-[var(--font-mono)] text-[0.58rem] tracking-[0.12em] uppercase text-[rgba(244,240,255,0.42)]"
        >
          {notice || '↑ ↓ browse · Home End jump · Enter run'}
        </div>
      </section>
    </div>,
    document.body,
  );
}
