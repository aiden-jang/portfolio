import { forwardRef, type PointerEvent } from 'react';

type Props = {
  boxed: boolean;
  onPet: () => void;
  onBox: () => void;
  onMouse: () => void;
};
type ToyDrag = {
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
};

export const BeanRoomTargets = forwardRef<HTMLDivElement, Props & { toyDrag?: ToyDrag }>(
  function BeanRoomTargets({ boxed, onPet, onBox, onMouse, toyDrag }, ref) {
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
          {...toyDrag}
        >
          <span aria-hidden="true">Toy mouse</span>
        </button>
      </div>
    );
  },
);
