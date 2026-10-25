import { useDialogFocus } from './useDialogFocus';
import { useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { type SectionId } from '../config';
import { buildCommands, matchCommands, type Command } from './commands';
import { usePageScrollLock } from './usePageScrollLock';
export const COMMAND_MENU_EVENT = 'portfolio:open-command-menu';

export function CommandMenu({ onSection }: { onSection: (id: SectionId) => void }) {
  const [open, setOpen] = useState(false);
  usePageScrollLock(open);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(open, dialogRef, inputRef);
  const activeResultRef = useRef<HTMLButtonElement>(null);
  const commands = buildCommands({ onSection, setNotice });

  const results = matchCommands(commands, query);
  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    activeResultRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"], dialog[open]') && !dialogRef.current) return;
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
    }
  }, [open]);

  const select = async (command: Command) => {
    if (command.closeOnRun !== false) flushSync(() => setOpen(false));
    await command.run();
  };

  // `aria-hidden` alone does not keep an input out of the tab order in every browser, so the
  // dialog has to leave the tree entirely while closed.
  if (!open) return null;

  return createPortal(
    <div
      className="dialog-overlay fixed inset-0 z-50 flex items-start justify-center px-4 pt-[min(18vh,9rem)] bg-[#05050de6]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="dialog-panel w-full max-w-[490px] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_24px_80px_-22px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
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
            aria-label="Search portfolio controls"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-activedescendant={
              results[activeIndex] ? `command-${results[activeIndex].id}` : undefined
            }
            aria-controls="command-results"
            className="min-w-0 flex-1 bg-transparent font-[var(--font-display)] text-base text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]"
          />
          <button
            type="button"
            className="command-menu-close"
            aria-label="Close controls"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
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
                className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left transition-colors ${
                  index === activeIndex ? 'bg-white/[0.07]' : ''
                }`}
              >
                <span
                  className={`text-[0.92rem] transition-colors ${
                    index === activeIndex ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted)]'
                  }`}
                >
                  {command.label}
                </span>
                <span className="keyboard-hint font-[var(--font-mono)] text-[0.58rem] tracking-[0.14em] uppercase text-[var(--color-muted)]">
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
        <div aria-live="polite" className="command-menu-footer">
          {notice || <span className="keyboard-hint">↑ ↓ browse · Home End jump · Enter run</span>}
        </div>
      </section>
    </div>,
    document.body,
  );
}
