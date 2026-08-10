import { lazy, Suspense, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { CARS } from './config';
import { useNavigation } from './hooks/useNavigation';
import { useReveal } from './hooks/useReveal';
import { BODY_COLOR_SWATCHES, useAppStore, type ActiveBodyColor } from './store';
import type { ThemeName } from './types';
// Lazy-loaded so the ~1 MB Three/R3F bundle isn't on the critical path — the DOM chrome and
// section content paint immediately, then the canvas mounts when its chunk arrives.
const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })));
import { Brand } from './ui/Brand';
import { CameraResetButton } from './ui/CameraResetButton';
import { CarSwitcher, MobileCarSwitcher } from './ui/CarSwitcher';
import { ColorSwatches, MobileColorButton } from './ui/ColorSwatches';
import { CommandMenu } from './ui/CommandMenu';
import { FilmGrain } from './ui/FilmGrain';
import { Hint } from './ui/Hint';
import { LoadingBar } from './ui/LoadingBar';
import { Nav } from './ui/Nav';
import { ResumeButton } from './ui/ResumeButton';
import { RevButton } from './ui/RevButton';
import { SceneBoundary } from './ui/SceneBoundary';
import { SceneShareButton } from './ui/SceneShareButton';
import { MobileThemeButton, ThemeToggle } from './ui/ThemeToggle';
import { MobileCommandButton } from './ui/MobileCommandButton';
import { Sections } from './ui/Sections';
import { SectionDots } from './ui/SectionDots';

/** `?clean` URL param strips all DOM chrome — used to grab a clean canvas
 *  screenshot for the OG image, and handy for demos / press shots. */
const isCleanMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');

/** Composition root: 3D canvas + DOM chrome side-by-side. */
export function App() {
  const { getScrollT, scrollToSection } = useNavigation();
  const setCarIndex = useAppStore((state) => state.setCarIndex);
  const setThemeName = useAppStore((state) => state.setThemeName);
  const applyBodyColor = useAppStore((state) => state.applyBodyColor);
  const hasBodyMaterial = useAppStore((state) => state.hasBodyMaterial);
  const scenePaintRef = useRef<ActiveBodyColor | null>(null);

  // A shared garage URL is intentionally just query params, so it also works
  // alongside case-study hashes and the existing `?clean` screenshot mode.
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
  }, [setCarIndex, setThemeName]);

  // Paint cannot be applied until the selected GLB has loaded and exposed its
  // material. Do this once for a shared link; later car changes stay in the
  // visitor's control rather than unexpectedly reapplying the initial paint.
  useEffect(() => {
    if (!hasBodyMaterial || !scenePaintRef.current) return;
    applyBodyColor(scenePaintRef.current);
    scenePaintRef.current = null;
  }, [applyBodyColor, hasBodyMaterial]);

  useReveal();

  return (
    <>
      {/* First focusable element: lets keyboard users jump past the chrome
       *  straight into the page content. Hidden until focused. */}
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
        {/* Inside the boundary so a WebGL failure also clears the loading bar,
            which would otherwise sit stuck at 0% with the scene never arriving. */}
        <LoadingBar />
      </SceneBoundary>
      <div className="vignette" aria-hidden="true" />
      <FilmGrain />
      {!isCleanMode && (
        <>
          <Brand onHome={() => scrollToSection('sec-intro')} />
          <Nav onLink={scrollToSection} />
          {/* Mobile-only floating resume CTA. Desktop renders ResumeButton
           *  inside Nav so it shares the top-right chrome row. */}
          <div
            id="mobile-resume"
            className="md:hidden fixed top-[max(4vh,env(safe-area-inset-top))] right-[5vw] z-20 flex items-center gap-2"
          >
            <MobileCommandButton />
            <ResumeButton />
          </div>
          {/* Mobile bottom bar: section progress + car + color in one
           *  bottom-anchored stack, so the pieces never overlap each other
           *  across phone sizes (sections reserve this zone with their bottom
           *  padding). The soft gradient lets content fade under the controls
           *  instead of colliding with them. Desktop renders these inside Nav
           *  and the dot rail on the right edge. */}
          <div
            id="mobile-bar"
            className="
              md:hidden fixed inset-x-0 bottom-0 z-30 pointer-events-none
              flex flex-col items-center gap-2 pt-5 pb-[max(3vh,env(safe-area-inset-bottom))]
              bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/70 to-transparent
            "
          >
            <SectionDots onJump={scrollToSection} placement="bar" />
            {/* Car switcher + color + background on one line to keep it compact. */}
            <div className="flex items-center gap-2">
              <MobileCarSwitcher />
              <MobileColorButton />
              <MobileThemeButton />
            </div>
          </div>
          {/* Desktop car + color dock. These used to sit in the top-right Nav
           *  row, but that made the nav wide enough to overlap the brand on
           *  most laptop widths. Bottom-center, just above the Hint, keeps them
           *  discoverable while the top row stays clear. Mobile has its own
           *  copy in the bottom bar above. */}
          <div
            id="desktop-dock"
            className="
              hidden md:flex justify-center fixed left-1/2 -translate-x-1/2 bottom-[4.5rem] z-20
              pointer-events-none
            "
          >
            {/* One cohesive control bar: car | color | background. */}
            <div
              className="
                pointer-events-auto flex items-center gap-1
                rounded-full border border-[var(--color-line)] bg-[rgba(12,12,20,0.55)]
                px-2 py-1 shadow-[0_10px_34px_-14px_rgba(0,0,0,0.7)]
              "
            >
              <CarSwitcher />
              <span aria-hidden="true" className="w-px h-5 bg-[var(--color-line)] mx-0.5" />
              <RevButton />
              <span aria-hidden="true" className="w-px h-5 bg-[var(--color-line)] mx-0.5" />
              <CameraResetButton />
              <span aria-hidden="true" className="w-px h-5 bg-[var(--color-line)] mx-0.5" />
              <ColorSwatches bordered={false} />
              <span aria-hidden="true" className="w-px h-5 bg-[var(--color-line)] mx-0.5" />
              <ThemeToggle />
              <span aria-hidden="true" className="w-px h-5 bg-[var(--color-line)] mx-0.5" />
              <SceneShareButton />
            </div>
          </div>
          <SectionDots onJump={scrollToSection} placement="rail" />
          <Sections />
          <Hint />
          <CommandMenu onSection={scrollToSection} />
        </>
      )}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
