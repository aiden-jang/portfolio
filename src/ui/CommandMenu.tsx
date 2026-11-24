import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { CARS, type SectionId } from '../config';
import { paintFinish } from '../paint';
import { buildCommands, matchCommands, type Command } from './commands';
import { usePageScrollLock } from './usePageScrollLock';
import { CommandResults } from './CommandResults';
import { CommandSearch } from './CommandSearch';
import { useAppStore } from '../store';
import { useCommandMenuEvents } from './useCommandMenuEvents';
import { useDialogFocus } from './useDialogFocus';

export function CommandMenu({ onSection }: { onSection: (id: SectionId) => void }) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<DOMRect | null>(null);
  const [feedback, setFeedback] = useState<{ text: string } | null>(null);
  usePageScrollLock(open);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const openedByTouch = origin && window.matchMedia('(pointer: coarse)').matches;
  useDialogFocus(open, dialogRef, openedByTouch ? dialogRef : inputRef);
  const sceneUnavailable = useAppStore((state) => state.sceneUnavailable);
  const commands = buildCommands({ onSection, setNotice, sceneUnavailable });

  const results = matchCommands(commands, query);
  useEffect(() => {
    setActiveIndex(0);
    const list = document.getElementById('command-results');
    if (list) list.scrollTop = 0;
  }, [query, open]);

  useCommandMenuEvents(open, setOpen, dialogRef, setOrigin);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 1550);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setNotice('');
    }
  }, [open]);

  const select = async (command: Command) => {
    if (command.closeOnRun !== false) flushSync(() => setOpen(false));
    const before = useAppStore.getState();
    await command.run();
    const { cameraViewVersion, carIndex, activeBodyColor } = useAppStore.getState();
    if (command.id.startsWith('view-') && cameraViewVersion !== before.cameraViewVersion)
      setFeedback({ text: command.label });
    if (command.id === 'repaint' && activeBodyColor !== before.activeBodyColor)
      setFeedback({ text: paintFinish(CARS[carIndex], activeBodyColor).name });
  };
  const shift = origin
    ? Math.max(-136, Math.min(136, (origin.left + origin.width / 2 - innerWidth / 2) * 0.28))
    : 0;
  const panelStyle = {
    '--garage-anchor-x': shift + 'px',
    '--garage-anchor-y': origin ? '24px' : '8px',
  } as CSSProperties;
  return (
    <>
      <div className="garage-feedback" aria-live="polite">
        {feedback?.text}
      </div>
      {open &&
        createPortal(
          <div
            className="dialog-overlay fixed inset-0 z-50 flex items-start justify-center px-4 pt-[min(18vh,9rem)] command-menu-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <section
              ref={dialogRef}
              tabIndex={-1}
              style={panelStyle}
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              className="dialog-panel command-menu-panel w-full max-w-[490px] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_24px_80px_-22px_rgba(0,0,0,0.9)]"
            >
              <CommandSearch
                inputRef={inputRef}
                query={query}
                results={results}
                activeIndex={activeIndex}
                onQuery={setQuery}
                onActive={setActiveIndex}
                onSelect={select}
                onClose={() => setOpen(false)}
              />
              <CommandResults
                results={results}
                activeIndex={activeIndex}
                onActive={setActiveIndex}
                onSelect={select}
                studio={commands.find((command) => command.id === 'garage-studio')}
                onClear={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              />
              <div aria-live="polite" className="command-menu-footer">
                {notice || (
                  <span className="keyboard-hint">↑ ↓ browse · Home End jump · Enter run</span>
                )}
              </div>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
