import { openLinkedExhibit } from './garageExhibits/select';
import { PhotoMode } from './ui/photo/PhotoMode';
import { usePhotoMode } from './ui/photo/state';
import { publicAnalyticsUrl } from './analytics';
import { lazy, Suspense, useEffect } from 'react';
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
import { Lineup } from './lineup/Lineup';
import { useLineup } from './lineup/state';
import { useGarageStudio, startFromLink } from './garageStudio/state';
import { OpeningPoster } from './ui/OpeningPoster';
import './ui/reading-flow.css';
import './ui/dialog-motion.css';
import './ui/showroom-layout.css';
import './ui/creative/creative.css';
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

const GarageStudio = lazy(() =>
  import('./garageStudio/GarageStudio').then((m) => ({ default: m.GarageStudio })),
);
const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })));

// `?clean` strips the DOM chrome, for capturing the OG image against a bare canvas.
const isCleanMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');

export function App() {
  const { getScrollT, scrollToSection } = useNavigation(isCleanMode);
  const photoMode = usePhotoMode((state) => state.active);
  const renderStudy = useAppStore((state) => state.renderFinish !== null);
  const lineup = useLineup((state) => state.active);
  const garageStudio = useGarageStudio((state) => state.active);
  useSceneUrl();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('garage') === 'studio' && !location.hash && !useGarageStudio.getState().active) {
      startFromLink(params);
      openLinkedExhibit();
    }
  }, []);
  useShowroomTransition();

  return (
    <>
      <a
        href="#scroll"
        hidden={lineup || garageStudio}
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
          {!garageStudio && <OpeningPoster />}
          <div
            className="portfolio-chrome"
            ref={(element) => {
              if (element) element.inert = photoMode || renderStudy || lineup || garageStudio;
            }}
          >
            <PortfolioHeader
              onLink={(id) => {
                if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
                scrollToSection(id);
                const heading = document
                  .getElementById(id)
                  ?.querySelector<HTMLElement>('h1, h2:not(.sr-only), h3, .contact-email-link');
                if (heading) {
                  if (!heading.matches('a, button')) heading.tabIndex = -1;
                  heading.focus({ preventScroll: true });
                }
              }}
            />
            <CarControls />
            <Sections />
            <CarLoadNotice />
            <CommandMenu onSection={scrollToSection} />
          </div>
          <PhotoMode />
          {!garageStudio && <RenderStudy />}
          {lineup && !garageStudio && <Lineup />}
          {garageStudio && (
            <Suspense fallback={null}>
              <GarageStudio />
            </Suspense>
          )}
        </>
      )}
      <Analytics beforeSend={publicAnalyticsUrl} />
      <SpeedInsights beforeSend={publicAnalyticsUrl} route="/" />
    </>
  );
}
