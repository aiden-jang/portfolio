import type { Ref } from 'react';
import { bloomFlowers } from './bloomFlowers';

export function BloomPlot({
  label,
  selected,
  onSelect,
  grown,
  plotRef,
}: {
  label: string;
  selected: number | null;
  onSelect: (index: number) => void;
  grown?: boolean;
  plotRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={plotRef}
      className="bloom-garden-plot"
      role="group"
      aria-label={label}
      data-grown={grown || undefined}
    >
      {bloomFlowers.map((flower, index) => (
        <button
          key={flower.name}
          type="button"
          className={'bloom-garden-flower bloom-garden-flower-' + index}
          disabled={selected === null}
          aria-pressed={index === selected}
          onClick={() => onSelect(index)}
        >
          <span className="bloom-garden-plant">
            <img src={flower.image} alt="" loading="lazy" decoding="async" />
          </span>
          <span className="bloom-garden-name">{flower.name}</span>
        </button>
      ))}
    </div>
  );
}
