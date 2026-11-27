import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './StudioIcon';

export function FlowerNoteEditor({
  initial,
  onGrow,
  onCancel,
}: {
  initial: string;
  onGrow: (note: string) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(initial);
  useLayoutEffect(() => {
    input.current?.focus({ preventScroll: true });
  }, []);
  return (
    <form
      className="studio-note-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (text.trim()) onGrow(text.trim());
        else {
          input.current?.setCustomValidity('Write a short note first.');
          input.current?.reportValidity();
        }
      }}
    >
      <label htmlFor={id}>A note for someone</label>
      <textarea
        id={id}
        ref={input}
        rows={3}
        maxLength={105}
        required
        value={text}
        placeholder="You made my day when…"
        onChange={(event) => {
          event.currentTarget.setCustomValidity('');
          setText(event.target.value);
        }}
      />
      <div className="studio-note-tools">
        <button type="submit" className="studio-grow">
          Grow a flower <Icon name="arrow" size={16} />
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
