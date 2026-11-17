type Flower = {
  petalColors: string[];
  centerColor: string;
  petalCount: number;
  petalShape: string;
};

// The Gerbera head uses bloomnote's own petal and seed geometry.
export function GerberaHead({ flower }: { flower: Flower }) {
  const { petalColors: colors, centerColor, petalCount, petalShape } = flower;
  const width = petalShape === 'star' ? 6 : 12;
  const length = petalShape === 'small' ? 23 : 30;
  return (
    <g data-botanical="wildflower">
      {Array.from({ length: petalCount }, (_, i) => (
        <path
          key={i}
          transform={`rotate(${(i * 360) / petalCount})`}
          d={`M${-width / 2} -3 C${-width} ${-3 - length * 0.6} ${-width * 0.6} ${-3 - length} 0 ${-3 - length} C${width * 0.6} ${-3 - length} ${width} ${-3 - length * 0.6} ${width / 2} -3 Q0 0 ${-width / 2} -3Z`}
          fill={colors[i % colors.length]}
          stroke={colors[(i + 1) % colors.length]}
          strokeWidth=".65"
        />
      ))}
      <circle r="6" fill={centerColor} />
      {Array.from({ length: 19 }, (_, i) => {
        const angle = i * 2.39996,
          r = Math.sqrt(i / 19) * 6 * 0.83;
        return (
          <circle
            key={i}
            cx={Math.cos(angle) * r}
            cy={Math.sin(angle) * r}
            r=".65"
            fill={colors[2]}
            opacity=".65"
          />
        );
      })}
    </g>
  );
}
