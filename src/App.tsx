import { useNavigation } from './hooks/useNavigation';
import { useReveal } from './hooks/useReveal';
import { Scene } from './three/Scene';
import { Brand } from './ui/Brand';
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
      <LoadingBar />
      <Brand />
      <Nav onLink={scrollToSection} />
      <SectionDots onJump={scrollToSection} />
      <Sections />
      <Hint />
    </>
  );
}
