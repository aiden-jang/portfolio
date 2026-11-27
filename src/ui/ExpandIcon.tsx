import { ControlIcon } from './ControlIcon';
import './expand-icon.css';

export function ExpandIcon() {
  return (
    <span className="image-expand" aria-hidden="true">
      <ControlIcon name="fit" />
    </span>
  );
}
