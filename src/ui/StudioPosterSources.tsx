import { STUDIO_TALL_ASPECT } from '../lighting';

const layouts = [
  ['phone-short', '(width < 768px) and (min-aspect-ratio: 1/2)'],
  ['phone-tall', `(width < 768px) and (max-aspect-ratio: ${STUDIO_TALL_ASPECT})`],
  ['phone', '(width < 768px)'],
  ['ultrawide', '(min-aspect-ratio: 21/10)'],
  ['wide', '(min-aspect-ratio: 9/5)'],
] as const;

const base = '/showroom/studio/studio-';

export const STUDIO_POSTER = base + 'desktop.webp';

export function StudioPosterSources({ opening = false }: { opening?: boolean }) {
  return (
    <>
      {layouts.map(([name, media]) => (
        <StudioSource key={name} name={name} media={media} opening={opening} />
      ))}
      {opening && (
        <source
          media="(prefers-reduced-motion: no-preference)"
          srcSet={base + 'desktop-motion.webp'}
        />
      )}
    </>
  );
}

function StudioSource({ name, media, opening }: { name: string; media: string; opening: boolean }) {
  return (
    <>
      {opening && (
        <source
          media={media + ' and (prefers-reduced-motion: no-preference)'}
          srcSet={base + name + '-motion.webp'}
        />
      )}
      <source media={media} srcSet={base + name + '.webp'} />
    </>
  );
}
