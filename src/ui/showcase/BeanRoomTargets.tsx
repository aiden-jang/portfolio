import { forwardRef } from 'react';

type Props = {
  boxed: boolean;
  onPet: () => void;
  onBox: () => void;
  onMouse: () => void;
};

export function BeanRoomButtons({
  boxed,
  onPet,
  onBox,
  onMouse,
  disabled,
}: Props & { disabled: boolean }) {
  return (
    <>
      <button type="button" disabled={disabled} onClick={onPet}>
        Pet
      </button>
      <button type="button" disabled={disabled} onClick={onMouse}>
        Toy mouse
      </button>
      <button type="button" disabled={disabled} aria-pressed={boxed} onClick={onBox}>
        Box
      </button>
    </>
  );
}

export const BeanRoomTargets = forwardRef<HTMLDivElement, Props>(function BeanRoomTargets(
  { boxed, onPet, onBox, onMouse },
  ref,
) {
  return (
    <div className="bean-hotspots" ref={ref} role="group" aria-label="Play in Bean’s room">
      <button
        type="button"
        className="bean-target"
        data-object="bean"
        onClick={onPet}
        aria-label="Pet Bean"
      >
        <span aria-hidden="true">Pet Bean</span>
      </button>
      <button
        type="button"
        className="bean-target"
        data-object="box"
        onClick={onBox}
        aria-label="Cardboard box"
        aria-pressed={boxed}
      >
        <span aria-hidden="true">{boxed ? 'Come out' : 'Cardboard box'}</span>
      </button>
      <button
        type="button"
        className="bean-target"
        data-object="mouse"
        onClick={onMouse}
        aria-label="Play with the toy mouse"
      >
        <span aria-hidden="true">Toy mouse</span>
      </button>
    </div>
  );
});
