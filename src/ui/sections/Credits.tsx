import { CARS } from '../../config';

/** Model-credit list rendered inside the Contact panel. Hidden entirely when
 *  no car in CARS has a `credit` entry. */
export function Credits() {
  const credited = CARS.filter((c) => !!c.credit);
  if (credited.length === 0) return null;
  return (
    <div
      id="credit"
      aria-live="polite"
      className="
        mt-5 md:mt-10 pt-3 md:pt-5 border-t border-[var(--color-line)]
        font-[var(--font-mono)] text-[0.6rem] md:text-[0.66rem] tracking-[0.16em] uppercase
        text-[var(--color-muted)] leading-[1.5] md:leading-[1.7] text-left
      "
    >
      <span className="block text-[var(--color-fg)] mb-1.5 tracking-[0.32em] text-[0.62rem]">
        Model Credits
      </span>
      <ul className="list-none p-0 m-0">
        {credited.map((c) => {
          const credit = c.credit!;
          return (
            <li key={c.name} className="py-0.5 md:py-1">
              {c.name} ·{' '}
              <a
                href={credit.url}
                target="_blank"
                rel="noopener"
                className="text-inherit no-underline border-b border-transparent hover:text-[var(--color-fg)] hover:border-[var(--color-neon)]"
              >
                {credit.author}
              </a>{' '}
              · {credit.license}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
