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
import { Sections } from './ui/Sections';
import { SectionDots } from './ui/SectionDots';

/** Composition root: 3D canvas + DOM chrome side-by-side. */
export function App() {
  const { getScrollT, scrollToSection } = useNavigation();
  useReveal();

  return (
    <>
      <Scene getScrollT={getScrollT} />
      <FilmGrain />
      <LoadingBar />
      <Brand />
      <Nav onLink={scrollToSection} />
      <SectionDots onJump={scrollToSection} />
      <Sections />
      <Hint />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
