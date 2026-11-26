export const dinnerPhoto = '/projects/scenes/wherever-pizza.jpg';

export function DinnerRating({ onUnavailable }: { onUnavailable: () => void }) {
  return (
    <span className="dinner-rating">
      <span className="dinner-rating-media">
        <img
          className="dinner-rating-photo"
          src={dinnerPhoto}
          alt=""
          loading="lazy"
          onError={onUnavailable}
        />
      </span>
      <span className="dinner-rating-note">
        <span className="dinner-rating-name">Neighborhood Pizza Kitchen</span>
        <WorthCharacter />
        <span className="dinner-rating-verdict">Favorite.</span>
        <span className="dinner-rating-status">Sample rating</span>
      </span>
    </span>
  );
}

export function WorthCharacter() {
  return (
    <svg className="dinner-rating-character" viewBox="0 0 120 110" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 60Q10 59 9 49 M99 58q10-3 11-13" />
        <path d="M44 86v7m-4 2h8 M76 86v7m-4 2h8" />
      </g>
      <path
        d="M20 60c2-14 10-20 14-30C40 14 54 12 64 18c12-5 24 4 28 18 4 10 13 17 12 30-1 19-20 25-43 25S17 81 20 60Z"
        fill="#e4d79a"
        stroke="#e4d79a"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M101 25c-7-4-9-9-5-11 2-1 4 0 5 2 1-2 3-3 5-2 4 2 2 7-5 11Z" fill="#af895e" />
      <g fill="#af895e" opacity="0.65">
        <ellipse cx="36" cy="67" rx="4.5" ry="2.6" />
        <ellipse cx="83" cy="67" rx="4.5" ry="2.6" />
      </g>
      <g stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
        <path d="M44 55q4-5 8 0 M68 55q4-5 8 0" />
        <path d="M55 69q6 7 12-1" />
      </g>
    </svg>
  );
}
