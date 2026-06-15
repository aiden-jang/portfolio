import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useNavigation } from './hooks/useNavigation';
import { useReveal } from './hooks/useReveal';
import { Scene } from './three/Scene';
import { Brand } from './ui/Brand';
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
