import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { Command } from './commands';

type Props = {
  inputRef: RefObject<HTMLInputElement>;
  query: string;
  results: Command[];
  activeIndex: number;
  onQuery: (query: string) => void;
  onActive: Dispatch<SetStateAction<number>>;
  onSelect: (command: Command) => void | Promise<void>;
  onClose: () => void;
};

export function CommandSearch({
  inputRef,
  query,
  results,
  activeIndex,
  onQuery,
  onActive,
  onSelect,
  onClose,
}: Props) {
  return (
    <div className="command-menu-search">
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === 'ArrowDown' && results.length) {
            event.preventDefault();
            onActive((index) => (index + 1) % results.length);
          }
          if (event.key === 'ArrowUp' && results.length) {
            event.preventDefault();
            onActive((index) => (index - 1 + results.length) % results.length);
          }
          if (event.key === 'Home' && results.length) {
            event.preventDefault();
            onActive(0);
          }
          if (event.key === 'End' && results.length) {
            event.preventDefault();
            onActive(results.length - 1);
          }
          if (event.key === 'Enter' && results[activeIndex]) {
            event.preventDefault();
            void onSelect(results[activeIndex]);
          }
        }}
        placeholder="Find a control…"
        autoComplete="off"
        spellCheck={false}
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
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
