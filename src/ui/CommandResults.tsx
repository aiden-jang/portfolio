import { COMMAND_GROUPS, commandGroup, type Command } from './commands';

type Props = {
  results: Command[];
  activeIndex: number;
  onActive: (index: number) => void;
  onSelect: (command: Command) => Promise<void>;
  studio?: Command;
  onClear: () => void;
};

export function CommandResults({
  results,
  activeIndex,
  onActive,
  onSelect,
  studio,
  onClear,
}: Props) {
  if (!results.length)
    return (
      <>
        <div id="command-results" role="listbox" className="sr-only" />
        <div className="command-empty">
          <p role="status">No matching controls.</p>
          <div>
            <button type="button" onClick={onClear}>
              Clear search
            </button>
            {studio && (
              <button type="button" onClick={() => void onSelect(studio)}>
                Explore Studio
              </button>
            )}
          </div>
        </div>
      </>
    );
  return (
    <div id="command-results" role="listbox" className="command-results">
      {COMMAND_GROUPS.map((group) => {
        const entries = results.flatMap((command, index) =>
          commandGroup(command) === group ? [{ command, index }] : [],
        );
        return entries.length ? (
          <div key={group} role="group" aria-label={group}>
            <p className="command-group-label" aria-hidden="true">
              {group}
            </p>
            {entries.map(({ command, index }) => (
              <button
                key={command.id}
                id={`command-${command.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => void onSelect(command)}
                onMouseEnter={() => onActive(index)}
              >
                <span>{command.label}</span>
                <span className="keyboard-hint">{command.hint}</span>
              </button>
            ))}
          </div>
        ) : null;
      })}
    </div>
  );
}
