export function ContactPoster({ className }: { className: string }) {
  return (
    <picture className={className} aria-hidden="true">
      <source
        media="(max-width: 599px) and (max-height: 779px)"
        srcSet="/showroom/contact/short.webp"
      />
      <source media="(max-width: 599px)" srcSet="/showroom/contact/phone.webp" />
      <source media="(max-width: 899px)" srcSet="/showroom/contact/tablet.webp" />
      <source media="(max-aspect-ratio: 7/5)" srcSet="/showroom/contact/compact.webp" />
      <img src="/showroom/contact/desktop.webp" alt="" loading="lazy" decoding="async" />
    </picture>
  );
}
