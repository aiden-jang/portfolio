import { PhotoMode } from './ui/photo/PhotoMode';
import { usePhotoMode } from './ui/photo/state';
import { publicAnalyticsUrl } from './analytics';
import { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useNavigation } from './hooks/useNavigation';
import { useSceneUrl } from './hooks/useSceneUrl';
import { CarControls } from './ui/CarControls';
import { useShowroomTransition } from './hooks/useShowroomTransition';
import { PortfolioHeader } from './ui/PortfolioHeader';
import { CommandMenu } from './ui/CommandMenu';
import { CarLoadNotice } from './ui/CarLoadNotice';
import { SceneBoundary } from './ui/SceneBoundary';
import { Sections } from './ui/Sections';
import { useAppStore } from './store';
import { RenderStudy } from './ui/RenderStudy';
import { OpeningPoster } from './ui/OpeningPoster';
import './ui/reading-flow.css';
import './ui/dialog-motion.css';
import './ui/showroom-layout.css';
import './ui/project-presentation.css';
import './ui/reading-presentation.css';
import './ui/garage-responsive.css';
import './ui/studio-layout.css';
import './ui/studio-motion.css';
import './ui/showcase/showcase.css';
import './ui/car-zoom.css';
import './ui/product-confidence.css';
import './ui/cinematic-presentation.css';
import './ui/featured-work.css';
import './ui/featured-story.css';

const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })));

// `?clean` strips the DOM chrome, for capturing the OG image against a bare canvas.
const isCleanMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');

export function App() {
  const { getScrollT, scrollToSection } = useNavigation(isCleanMode);
  const photoMode = usePhotoMode((state) => state.active);
  const renderStudy = useAppStore((state) => state.renderFinish !== null);
  useSceneUrl();
  useShowroomTransition();

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
      {!isCleanMode && (
        <>
          <OpeningPoster />
          <div
            className="portfolio-chrome"
            ref={(element) => {
              if (element) element.inert = photoMode || renderStudy;
            }}
          >
            <PortfolioHeader onLink={scrollToSection} />
            <CarControls />
            <Sections />
            <CarLoadNotice />
            <CommandMenu onSection={scrollToSection} />
          </div>
          <PhotoMode />
          <RenderStudy />
        </>
      )}
      <Analytics beforeSend={publicAnalyticsUrl} />
      <SpeedInsights beforeSend={publicAnalyticsUrl} route="/" />
    </>
  );
}
