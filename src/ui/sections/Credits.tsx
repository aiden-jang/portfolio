import { CARS } from '../../config';

/** Model-credit list rendered inside the Contact panel. Hidden entirely when
 *  no car in CARS has a `credit` entry. */
export function Credits() {
  const credited = CARS.filter((c) => !!c.credit);
  const licenses = [...new Set(credited.map((c) => c.credit!.license))];
  if (credited.length === 0) return null;
  return (
    <details
      id="credit"
      className="
        group pointer-events-auto mt-5 md:mt-10 pt-3 md:pt-5 border-t border-[var(--color-line)]
        font-[var(--font-mono)] text-[0.6rem] md:text-[0.66rem] tracking-[0.16em] uppercase
        text-[var(--color-muted)] leading-[1.5] md:leading-[1.7] text-left
      "
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[var(--color-fg)] [&::-webkit-details-marker]:hidden">
        <span className="tracking-[0.22em] text-[0.62rem]">
          3D model credits ({credited.length})
        </span>
        <span
          aria-hidden="true"
          className="grid h-6 w-6 place-items-center rounded-full border border-[var(--color-line)] text-[0.85rem] transition-transform duration-200 group-open:rotate-45 group-hover:border-[var(--color-neon)] group-hover:text-[var(--color-neon)]"
        >
          +
        </span>
      </summary>
      <p className="mt-2 text-[0.52rem] tracking-[0.09em] text-[rgba(244,240,255,0.48)]">
        {licenses.length === 1
          ? `All models are ${licenses[0]}.`
          : `Licenses: ${licenses.join(', ')}.`}
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 list-none p-0 m-0 normal-case tracking-normal">
        {credited.map((c) => {
          const credit = c.credit!;
          return (
            <li key={c.name} className="min-w-0 text-[0.64rem] leading-[1.25]">
              <span className="block truncate text-[rgba(244,240,255,0.78)]">{c.name}</span>
              <a
                href={credit.url}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-muted)] no-underline border-b border-transparent hover:text-[var(--color-fg)] hover:border-[var(--color-neon)]"
              >
                by {credit.author}
              </a>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
