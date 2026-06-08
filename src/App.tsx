import { useNavigation } from './hooks/useNavigation';
import { useReveal } from './hooks/useReveal';
import { Scene } from './three/Scene';
import { Brand } from './ui/Brand';
import { Hint } from './ui/Hint';
import { Nav } from './ui/Nav';
import { Sections } from './ui/Sections';

/** Composition root: 3D canvas + DOM chrome side-by-side. */
export function App() {
  const { getScrollT, scrollToSection } = useNavigation();
  useReveal();

  return (
    <>
      <Scene getScrollT={getScrollT} />
      <Brand />
      <Nav onLink={scrollToSection} />
      <Sections />
      <Hint />
    </>
  );
}
