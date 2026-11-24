import { useId, useRef } from 'react';
import { ControlIcon } from '../ui/ControlIcon';

const shortcutGroups = [
  {
    title: 'Garage',
    shortcuts: [
      ['Orbit with the car view focused', '← / →'],
      ['Close tool or Garage', 'Esc'],
    ],
  },
  {
    title: 'Intro',
    shortcuts: [
      ['Browse cars', '← / →'],
      ['Jump to a car', '1–9'],
      ['Switch lighting', 'B'],
      ['Cycle paint', 'C'],
      ['Reset camera', 'V'],
      ['Randomize setup', 'X'],
      ['Open command menu', '⌘K / Ctrl+K / ?'],
      ['Next section', '↓ / PgDn / Space'],
      ['Previous section', '↑ / PgUp'],
      ['First or last section', 'Home / End'],
    ],
  },
] as const;

export function StudioShortcuts() {
  const panel = useRef<HTMLDialogElement>(null);
  const title = useId();

  return (
    <>
      <button
        type="button"
        className="studio-shortcuts-trigger"
        aria-haspopup="dialog"
        onClick={() => panel.current?.showModal()}
      >
        Keyboard shortcuts
      </button>
      <dialog ref={panel} className="studio-shortcuts-panel" aria-labelledby={title}>
        <div className="studio-shortcuts-heading">
          <h3 id={title}>Keyboard shortcuts</h3>
          <button
            type="button"
            aria-label="Close keyboard shortcuts"
            onClick={() => panel.current?.close()}
          >
            <ControlIcon name="close" />
          </button>
        </div>
        {shortcutGroups.map(({ title, shortcuts }) => (
          <section key={title} aria-label={title}>
            <h4>{title}</h4>
            <dl>
              {shortcuts.map(([action, keys]) => (
                <div key={action}>
                  <dt>{action}</dt>
                  <dd>
                    <kbd>{keys}</kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </dialog>
    </>
  );
}
