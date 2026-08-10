import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SECTION_IDS, type SectionId } from '../config';
import { copyCurrentSceneUrl } from '../sceneLink';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      ...SECTION_IDS.map((id) => ({
        id,
        label: `Go to ${SECTION_LABELS[id]}`,
        hint: 'section',
        keywords: `${SECTION_LABELS[id]} navigate`,
        run: () => onSection(id),
      })),
      {
        id: 'next-car',
        label: 'Next car',
        hint: '→',
        keywords: 'car vehicle switch',
        run: () => useAppStore.getState().cycleCar(),
      },
      {
        id: 'previous-car',
        label: 'Previous car',
        hint: '←',
        keywords: 'car vehicle switch',
        run: () => useAppStore.getState().prevCar(),
      },
      {
        id: 'repaint',
        label: 'Change paint color',
        hint: 'C',
        keywords: 'paint color body repaint',
        run: () => useAppStore.getState().cycleBodyColor(),
      },
      {
        id: 'theme',
        label: 'Toggle studio lighting',
        hint: 'B',
        keywords: 'theme background night day lighting',
        run: () => useAppStore.getState().toggleTheme(),
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
        label: 'Copy this garage link',
        hint: 'link',
        keywords: 'share copy car paint lighting garage',
        closeOnRun: false,
        run: async () => {
          const copied = await copyCurrentSceneUrl();
          setNotice(copied ? 'Garage link copied' : 'Could not copy the link');
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
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
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
              if (event.key === 'Enter' && results[0]) void select(results[0]);
            }}
            placeholder="Jump somewhere, change the scene…"
            className="min-w-0 flex-1 bg-transparent font-[var(--font-display)] text-[0.96rem] text-[var(--color-fg)] outline-none placeholder:text-[rgba(244,240,255,0.36)]"
          />
          <kbd className="rounded border border-white/[0.12] px-1.5 py-0.5 font-[var(--font-mono)] text-[0.58rem] tracking-[0.1em] text-[var(--color-muted)]">
            ESC
          </kbd>
        </div>
        <div className="max-h-[52dvh] overflow-y-auto p-2">
          {results.length ? (
            results.map((command) => (
              <button
                key={command.id}
                type="button"
                onClick={() => void select(command)}
                className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.07]"
              >
                <span className="text-[0.92rem] text-[rgba(244,240,255,0.86)] group-hover:text-[var(--color-fg)]">
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
          {notice || 'Press enter to run the first match'}
        </div>
      </section>
    </div>,
    document.body,
  );
}
