import { ControlIcon } from '../ui/ControlIcon';

export function StudioShotLink({ value, onClose }: { value: string; onClose: () => void }) {
  return (
    <div className="studio-link">
      <input
        aria-label="Exact shot link"
        readOnly
        value={value}
        onFocus={(event) => event.currentTarget.select()}
      />
      <button type="button" onClick={onClose} aria-label="Dismiss shot link">
        <ControlIcon name="close" />
      </button>
    </div>
  );
}
