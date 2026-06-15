import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useNavigation } from './hooks/useNavigation';
import { useReveal } from './hooks/useReveal';
import { Scene } from './three/Scene';
import { Brand } from './ui/Brand';
import { ColorSwatches } from './ui/ColorSwatches';
import { FilmGrain } from './ui/FilmGrain';
import { Hint } from './ui/Hint';
import { LoadingBar } from './ui/LoadingBar';
import { Nav } from './ui/Nav';
import { ResumeButton } from './ui/ResumeButton';
import { Sections } from './ui/Sections';
import { SectionDots } from './ui/SectionDots';

/** `?clean` URL param strips all DOM chrome — used to grab a clean canvas
 *  screenshot for the OG image, and handy for demos / press shots. */
const isCleanMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('clean');

/** Composition root: 3D canvas + DOM chrome side-by-side. */
export function App() {
  const { getScrollT, scrollToSection } = useNavigation();
  useReveal();

  return (
    <>
      <Scene getScrollT={getScrollT} />
      <div className="vignette" aria-hidden="true" />
      <FilmGrain />
      <LoadingBar />
      {!isCleanMode && (
        <>
          <Brand />
          <Nav onLink={scrollToSection} />
          {/* Mobile-only floating résumé CTA — desktop renders ResumeButton
           *  inside Nav so it shares the top-right chrome row. */}
          <div className="md:hidden fixed top-[4vh] right-[5vw] z-20">
            <ResumeButton />
          </div>
          {/* Mobile-only color swatches — desktop renders them inside Nav.
           *  Pinned low so they sit in the one-handed thumb zone. */}
          <div className="md:hidden fixed left-1/2 -translate-x-1/2 bottom-[7vh] z-20">
            <ColorSwatches bordered={false} />
          </div>
          <SectionDots onJump={scrollToSection} />
          <Sections />
          <Hint />
        </>
      )}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
