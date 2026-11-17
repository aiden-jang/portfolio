import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../hooks/reducedMotion';

export function Bean() {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [gaze, setGaze] = useState('center');
  const [pet, setPet] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  const pose = pet && !prefersReducedMotion() ? 'pet' : 'sit';
  return (
    <span className="bean-cameo">
      <button
        type="button"
        aria-label="Pet Bean"
        onPointerMove={(e) => {
          if (prefersReducedMotion()) return;
          const r = e.currentTarget.getBoundingClientRect();
          setGaze(e.clientX < r.left + r.width / 2 ? 'left' : 'right');
        }}
        onPointerLeave={() => setGaze('center')}
        onClick={() => {
          clearTimeout(timer.current);
          setPet(true);
          timer.current = setTimeout(() => setPet(false), 1500);
        }}
      >
        <img
          src={`/projects/bean-${pose}-${gaze}.png`}
          width="80"
          height="80"
          alt=""
          draggable={false}
        />
      </button>
      <span className="bean-response" role="status">
        {pet ? 'mrrp.' : ''}
      </span>
    </span>
  );
}
