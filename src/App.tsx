import { publicAnalyticsUrl } from './analytics';
import { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useNavigation } from './hooks/useNavigation';
import { useSceneUrl } from './hooks/useSceneUrl';
import { CarControls } from './ui/CarControls';
import { useReveal } from './hooks/useReveal';
import { PortfolioHeader } from './ui/PortfolioHeader';
import { CommandMenu } from './ui/CommandMenu';
import { FilmGrain } from './ui/FilmGrain';
import { CarLoadNotice } from './ui/CarLoadNotice';
import { SceneBoundary } from './ui/SceneBoundary';
import { Sections } from './ui/Sections';
import { SectionDots } from './ui/SectionDots';
import './ui/reading-flow.css';
import './ui/portfolio-surfaces.css';
import './ui/contact.css';
import './ui/dialog-motion.css';

const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })));

// `?clean` strips the DOM chrome, for capturing the OG image against a bare canvas.
const isCleanMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');

export function App() {
  const { getScrollT, scrollToSection } = useNavigation(isCleanMode);
  useSceneUrl();
  useReveal();

  return (
    <>
      <a
        href="#scroll"
        className="
          sr-only focus:not-sr-only
          focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:pointer-events-auto
          focus:px-4 focus:py-2 focus:rounded-full
          focus:bg-[var(--color-bg)] focus:border focus:border-[var(--color-neon)]
          focus:font-[var(--font-mono)] focus:text-[0.72rem] focus:tracking-[0.2em]
          focus:uppercase focus:text-[var(--color-fg)] focus:no-underline
        "
      >
        Skip to content
      </a>
      <SceneBoundary>
        <Suspense
          fallback={
            <p className="scene-loading-note" role="status">
              Bringing in the car. Everything else is ready.
            </p>
          }
        >
          <Scene getScrollT={getScrollT} />
        </Suspense>
      </SceneBoundary>
      <div className="vignette" aria-hidden="true" />
      <FilmGrain />
      {!isCleanMode && (
        <>
          <PortfolioHeader onLink={scrollToSection} />
          <CarControls />
          <SectionDots onJump={scrollToSection} />
          <Sections />
          <CarLoadNotice />
          <CommandMenu onSection={scrollToSection} />
        </>
      )}
      <Analytics beforeSend={publicAnalyticsUrl} />
      <SpeedInsights beforeSend={publicAnalyticsUrl} route="/" />
    </>
  );
}
