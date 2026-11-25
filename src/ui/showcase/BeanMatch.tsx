// Sitting pose from the mrrp room renderer.
const sitting = [
  '..ww..........ww..',
  '.wffw........wffw.',
  '.wfpfw......wfpfw.',
  '.wffffwwwwwwffffw.',
  '.wfdffffdffffdfw..',
  '.wfbbbbbbbbbbbbfw.',
  '.wfbchebbbbhecbfw.',
  '.wfbceebbbbeecbfw.',
  '.wfbbbbnnbbbbbfw..',
  '.wffbbbmmmbbbffw..',
  '..wfdffffffffdfw..',
  '..wfbbbbbbbbbbfw..',
  '..wfbbbbbbbbbbfw..',
  '..wfdbbbbbbbbdfw..',
  '..wffbbbbbbbbffw..',
  '..wfdffffffffdfw..',
  '.wwbbwwffffwwbbww.',
  '..wwddddddddddww..',
  '..wwwwwwwwwwwwww..',
];
const ink: Record<string, string> = {
  w: '#513728',
  f: '#e39348',
  d: '#b96d38',
  b: '#fbefdb',
  e: '#7cb342',
  n: '#bb7961',
  m: '#5b3e30',
  p: '#e9a29e',
  h: '#fff7e7',
  c: '#ebb092',
};
export function BeanMatch() {
  return (
    <svg className="bean-match" viewBox="0 0 18 19" aria-hidden="true" shapeRendering="crispEdges">
      {sitting.flatMap((row, y) =>
        Array.from(row, (key, x) =>
          key === '.' ? null : (
            <rect
              key={y * 20 + x}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={ink[key]}
              className={
                key === 'e' || key === 'h' ? (y === 6 ? 'match-lid' : 'match-eye') : undefined
              }
            />
          ),
        ),
      )}
    </svg>
  );
}
