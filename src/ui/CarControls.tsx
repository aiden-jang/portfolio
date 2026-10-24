import { CARS, SECTION_IDS, type SectionId } from '../config';
import { useAppStore } from '../store';
import { CameraResetButton } from './CameraResetButton';
import { CarSwitcher, MobileCarSwitcher } from './CarSwitcher';
import { ColorSwatches, MobileColorButton } from './ColorSwatches';
import { CarDetailButton } from './CarDetailButton';
import { HeadlightButton } from './HeadlightButton';
import { RevButton } from './RevButton';
import { SceneShareButton } from './SceneShareButton';
import { MobileThemeButton, ThemeToggle } from './ThemeToggle';
import { SectionDots } from './SectionDots';
import { Hint } from './Hint';
import './car-controls.css';

function CarActionSlot() {
  return (
    <div className="car-action-slot">
      <HeadlightButton />
      <CarDetailButton />
    </div>
  );
}

export function CarControls({ onSection }: { onSection: (id: SectionId) => void }) {
  const carIndex = useAppStore((state) => state.carIndex);
  const fixedLivery = CARS[carIndex].fixedLivery;
  const sectionIndex = useAppStore((state) => state.sectionIndex);
  const visible = sectionIndex === 0 || SECTION_IDS[sectionIndex] === 'sec-contact';
  return (
    <>
      <div
        id="mobile-bar"
        style={visible ? undefined : { display: 'none' }}
        className="
              md:hidden fixed inset-x-0 bottom-0 z-30 pointer-events-none
              flex flex-col items-center gap-2 pt-5 pb-[max(3vh,env(safe-area-inset-bottom))]
              bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/70 to-transparent
            "
      >
        <SectionDots onJump={onSection} placement="bar" />
        {visible && (
          <div className="car-controls-row">
            <MobileCarSwitcher />
            <div className="car-paint-slot">
              {fixedLivery ? <span className="car-livery">Livery</span> : <MobileColorButton />}
            </div>
            <MobileThemeButton />
            <CarActionSlot />
            <RevButton />
          </div>
        )}
      </div>
      {visible && (
        <div
          id="desktop-dock"
          className="
              hidden md:flex justify-center fixed left-1/2 -translate-x-1/2 bottom-[4.5rem] z-20
              pointer-events-none
            "
        >
          <div
            className="
                car-controls-row pointer-events-auto
                rounded-full border border-[var(--color-line)] bg-[rgba(12,12,20,0.55)]
                px-2 py-1 shadow-[0_10px_34px_-14px_rgba(0,0,0,0.7)]
              "
          >
            <CarSwitcher />
            <CarActionSlot />
            <RevButton />
            <CameraResetButton />
            <div className="car-paint-slot">
              {fixedLivery ? (
                <span className="car-livery">Original livery</span>
              ) : (
                <ColorSwatches bordered={false} />
              )}
            </div>
            <ThemeToggle />
            <SceneShareButton />
          </div>
        </div>
      )}
      {visible && <Hint />}
    </>
  );
}
