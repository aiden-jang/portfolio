import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { CARS, SECTION_IDS } from './config';
import { useNavigation } from './hooks/useNavigation';
import { useReveal } from './hooks/useReveal';
import { BODY_COLOR_SWATCHES, useAppStore, type ActiveBodyColor } from './store';
import type { ThemeName } from './types';
// Lazy so the ~1 MB Three/R3F chunk stays off the critical path and the copy paints first.
const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })));
import { PortfolioHeader } from './ui/PortfolioHeader';
import { CarSwitcher, MobileCarSwitcher } from './ui/CarSwitcher';
import { GarageMenu } from './ui/GarageMenu';
import { CommandMenu } from './ui/CommandMenu';
import { FilmGrain } from './ui/FilmGrain';
import { Hint } from './ui/Hint';
import { LoadingBar } from './ui/LoadingBar';
import { SceneBoundary } from './ui/SceneBoundary';
import { Sections } from './ui/Sections';
import { SectionDots } from './ui/SectionDots';

// `?clean` strips the DOM chrome, for capturing the OG image against a bare canvas.
const isCleanMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');

export function App() {
  const { getScrollT, scrollToSection } = useNavigation();
  const setCarIndex = useAppStore((state) => state.setCarIndex);
  const setThemeName = useAppStore((state) => state.setThemeName);
  const applyBodyColor = useAppStore((state) => state.applyBodyColor);
  const hasBodyMaterial = useAppStore((state) => state.hasBodyMaterial);
  const carIndex = useAppStore((state) => state.carIndex);
  const activeBodyColor = useAppStore((state) => state.activeBodyColor);
  const themeName = useAppStore((state) => state.themeName);
  const sectionIndex = useAppStore((state) => state.sectionIndex);
  const showCarControls = SECTION_IDS[sectionIndex] !== 'sec-work';
  const scenePaintRef = useRef<ActiveBodyColor | null>(null);
  const [sceneReady, setSceneReady] = useState(false);

  // Query params rather than a hash, so a shared garage survives alongside a `#work/...` link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const carIndex = Number(params.get('car'));
    if (Number.isInteger(carIndex) && carIndex >= 0 && carIndex < CARS.length)
      setCarIndex(carIndex);

    const light = params.get('light');
    if (light === 'dusk' || light === 'night') setThemeName(light as ThemeName);

    const paint = params.get('paint');
    if (paint === 'original' || BODY_COLOR_SWATCHES.some((swatch) => swatch.hex === paint)) {
      scenePaintRef.current = paint;
    }
    setSceneReady(true);
  }, [setCarIndex, setThemeName]);

  // Rebuilt from the current URL, not replaced, so `?clean` and any case-study hash survive.
  useEffect(() => {
    if (!sceneReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set('car', String(carIndex));
    url.searchParams.set('paint', activeBodyColor);
    url.searchParams.set('light', themeName);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [activeBodyColor, carIndex, sceneReady, themeName]);

  // Paint has to wait for the GLB to expose its material. Clearing the ref after the first apply
  // keeps a later car change from silently reverting to the shared link's color.
  useEffect(() => {
    if (!hasBodyMaterial || !scenePaintRef.current) return;
    applyBodyColor(scenePaintRef.current);
    scenePaintRef.current = null;
  }, [applyBodyColor, hasBodyMaterial]);

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
        <Suspense fallback={null}>
          <Scene getScrollT={getScrollT} />
        </Suspense>
        {/* Inside the boundary, or a WebGL failure leaves the bar stuck at 0% forever. */}
        <LoadingBar />
      </SceneBoundary>
      <div className="vignette" aria-hidden="true" />
      <FilmGrain />
      {!isCleanMode && (
        <>
          <PortfolioHeader onLink={scrollToSection} />
          {/* Sections reserve this strip with their own bottom padding, so keep the two in step. */}
          <div
            id="mobile-bar"
            style={showCarControls ? undefined : { display: 'none' }}
            className="
              md:hidden fixed inset-x-0 bottom-0 z-30 pointer-events-none
              flex flex-col items-center gap-2 pt-5 pb-[max(3vh,env(safe-area-inset-bottom))]
              bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/70 to-transparent
            "
          >
            <SectionDots onJump={scrollToSection} placement="bar" />
            {showCarControls && (
              <div className="flex items-center gap-2">
                <MobileCarSwitcher />
                <GarageMenu />
              </div>
            )}
          </div>
          {showCarControls && (
            <div
              id="desktop-dock"
              className="
              hidden md:flex justify-center fixed left-1/2 -translate-x-1/2 bottom-[4.5rem] z-20
              pointer-events-none
            "
            >
              <div
                className="
                pointer-events-auto flex items-center gap-1
                rounded-full border border-[var(--color-line)] bg-[rgba(12,12,20,0.55)]
                px-2 py-1 shadow-[0_10px_34px_-14px_rgba(0,0,0,0.7)]
              "
              >
                <CarSwitcher />
                <GarageMenu />
              </div>
            </div>
          )}
          <SectionDots onJump={scrollToSection} placement="rail" />
          <Sections />
          {showCarControls && <Hint />}
          <CommandMenu onSection={scrollToSection} />
        </>
      )}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
