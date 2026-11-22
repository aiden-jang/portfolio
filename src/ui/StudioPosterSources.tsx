import { STUDIO_TALL_ASPECT } from '../lighting';

const layouts = [
  ['phone-short', '(width < 768px) and (min-aspect-ratio: 1/2)'],
  ['phone-tall', `(width < 768px) and (max-aspect-ratio: ${STUDIO_TALL_ASPECT})`],
  ['phone', '(width < 768px)'],
  ['ultrawide', '(min-aspect-ratio: 21/10)'],
  ['wide', '(min-aspect-ratio: 9/5)'],
] as const;

const base = '/showroom/studio/studio-';

const corvetteBase = '/showroom/corvette/corvette-';

export const CORVETTE_POSTER = corvetteBase + 'desktop.webp';
export const STUDIO_POSTER = base + 'desktop.webp';

export function StudioPosterSources({
  opening = false,
  corvette = false,
}: {
  opening?: boolean;
  corvette?: boolean;
}) {
  const prefix = corvette ? corvetteBase : base;
  return (
    <>
      {layouts.map(([name, media]) => (
        <StudioSource key={name} name={name} media={media} opening={opening} prefix={prefix} />
      ))}
      {opening && (
        <source
          media="(prefers-reduced-motion: no-preference)"
          srcSet={prefix + 'desktop-motion.webp'}
        />
      )}
    </>
  );
}

function StudioSource({
  name,
  media,
  opening,
  prefix,
}: {
  name: string;
  media: string;
  opening: boolean;
  prefix: string;
}) {
  return (
    <>
      {opening && (
        <source
          media={media + ' and (prefers-reduced-motion: no-preference)'}
          srcSet={prefix + name + '-motion.webp'}
        />
      )}
      <source media={media} srcSet={prefix + name + '.webp'} />
    </>
  );
}
