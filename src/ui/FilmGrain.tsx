// Inline SVG noise as a data URL. fractalNoise + stitchTiles makes it tile
// seamlessly so the animated translate doesn't expose edges.
const NOISE_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/></filter>" +
  "<rect width='100%' height='100%' filter='url(%23n)'/></svg>";

/** Full-viewport subtle noise overlay. Gives the flat dark background a
 *  "filmic" texture instead of pure void. Animated with discrete `steps()`
 *  so it jitters frame-to-frame the way real film grain does. */
export function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      className="fixed -inset-[10%] z-[100] pointer-events-none opacity-[0.06] mix-blend-overlay [animation:filmgrain_0.7s_steps(8)_infinite]"
      style={{
        backgroundImage: `url("${NOISE_SVG}")`,
        backgroundSize: '200px 200px',
      }}
    />
  );
}
