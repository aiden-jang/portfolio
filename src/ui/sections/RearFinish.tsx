import { useEffect, useRef } from 'react';
import { clamp } from '../../math';
import { easedProgress } from '../../hooks/useScrollStudy';
import { ContactSection } from './Contact';
import { Section } from './shared';
import './about.css';
import './about-framing.css';
import './rear-finish.css';

const artwork = import.meta.glob('../../../wing-art/*/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;
const lastFrame = 12;
const paintStart = 0.035;
const originalPaintEnd = 0.82;
const paintDistance = (originalPaintEnd - paintStart) * 0.75;
const savedTravel = originalPaintEnd - paintStart - paintDistance;
const travel = 1 - savedTravel;
const paintFrom = paintStart / travel;
const paintTo = (paintStart + paintDistance) / travel;
const formats = {
  short: '(max-width: 599px) and (max-height: 779px)',
  phone: '(max-width: 599px)',
};

function framePath(size: string, frame: number) {
  return artwork[`../../../wing-art/${size}-rear/${frame}.jpg`];
}

function FinishStill({ frame }: { frame: number }) {
  return (
    <picture className={frame === 0 ? 'rear-clay' : 'rear-paint'}>
      <source media={formats.short} srcSet={framePath('short', frame)} />
      <source media={formats.phone} srcSet={framePath('phone', frame)} />
      <img src={framePath('desktop', frame)} alt="" decoding="async" />
    </picture>
  );
}

export function RearFinish() {
  const ending = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const baseFrame = useRef<HTMLCanvasElement>(null);
  const blendFrame = useRef<HTMLCanvasElement>(null);
  const slider = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = ending.current!;
    const lane = track.current!;
    const base = baseFrame.current!;
    const blend = blendFrame.current!;
    const input = slider.current!;
    const contact = root.querySelector<HTMLElement>('#sec-contact')!;
    const emailLink = contact.querySelector<HTMLAnchorElement>('.contact-email-link')!;
    const baseContext = base.getContext('2d', { alpha: false });
    const blendContext = blend.getContext('2d', { alpha: false });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const short = matchMedia(formats.short);
    const narrow = matchMedia(formats.phone);
    let format = '';
    let frames: HTMLImageElement[] = [];
    let ready = false;
    let next = 0;
    let manual = 0;
    let alive = true;
    let nearby = false;
    let baseIndex = -1;
    let blendIndex = -1;
    let span = 0;
    let lastProgress = -1;
    let lastHandoff = -1;
    let lastShade = -1;
    let lastOffset = -1;

    function schedule() {
      if (!next) next = requestAnimationFrame(render);
    }

    function load(size: string) {
      ready = false;
      baseIndex = blendIndex = -1;
      root.removeAttribute('data-frames-ready');
      const pending = Array.from({ length: lastFrame + 1 }, (_, index) => {
        const image = new Image();
        image.src = framePath(size, index);
        return image;
      });
      void Promise.all(pending.map((image) => image.decode())).then(
        () => {
          if (!alive || format !== size) return;
          frames = pending;
          base.width = blend.width = frames[0].naturalWidth;
          base.height = blend.height = frames[0].naturalHeight;
          ready = Boolean(baseContext && blendContext);
          schedule();
        },
        () => {
          // Keep the responsive clay and painted stills if a sequence cannot be decoded.
        },
      );
    }

    function measure() {
      span = Math.max(0, lane.offsetHeight - (lane.firstElementChild as HTMLElement).offsetHeight);
      schedule();
    }

    function paintArtwork(progress: number) {
      if (!ready || !baseContext || !blendContext || progress <= 0 || progress >= 1) {
        root.removeAttribute('data-frames-ready');
        return;
      }

      const position = progress * lastFrame;
      const low = Math.floor(position);
      const high = low + 1;
      // The canvas pixels change only at frame boundaries. Opacity blends between them.
      if (baseIndex !== low) {
        baseContext.drawImage(frames[low], 0, 0);
        baseIndex = low;
      }
      if (blendIndex !== high) {
        blendContext.drawImage(frames[high], 0, 0);
        blendIndex = high;
      }
      blend.style.opacity = String(position - low);
      root.setAttribute('data-frames-ready', '');
    }

    function render() {
      next = 0;
      if (nearby) {
        const size = short.matches ? 'short' : narrow.matches ? 'phone' : 'desktop';
        if (size !== format) {
          format = size;
          load(size);
        }
      }
      const fixed = reduced.matches || !span;
      const contactTop = contact.getBoundingClientRect().top;
      const timeline = fixed ? 0 : clamp(-lane.getBoundingClientRect().top / span, 0, 1);
      const handoff = fixed
        ? Number(contactTop <= innerHeight * 0.55)
        : easedProgress(timeline, (0.84 - savedTravel) / travel, (0.97 - savedTravel) / travel);
      const closing = fixed
        ? handoff
        : easedProgress(timeline, paintTo, (0.9 - savedTravel) / travel);
      const contactEntered = handoff > 0;

      const offset = clamp(contactTop, 0, innerHeight);
      if (offset !== lastOffset) {
        lastOffset = offset;
        contact.style.setProperty('--contact-offset', offset + 'px');
      }
      if (handoff !== lastHandoff) {
        lastHandoff = handoff;
        contact.style.setProperty('--handoff', String(handoff));
      }
      if (closing !== lastShade) {
        lastShade = closing;
        lane.style.setProperty('--finish-exit', String(closing));
        lane.toggleAttribute('data-finish-ended', closing === 1);
      }
      if (contactEntered !== root.hasAttribute('data-contact-entered')) {
        const focused = document.activeElement;
        root.toggleAttribute('data-contact-entered', contactEntered);
        if (contactEntered && lane.contains(focused)) {
          emailLink.focus({ preventScroll: true });
        } else if (!contactEntered && contact.contains(focused)) {
          input.focus({ preventScroll: true });
        }
      }

      const progress = fixed
        ? contactEntered
          ? 1
          : manual
        : clamp((timeline - paintFrom) / (paintTo - paintFrom), 0, 1);
      const changed = progress !== lastProgress;
      if (changed) {
        const value = Math.round(progress * 100);
        const text = String(value);
        lastProgress = progress;
        root.dataset.finish = String(progress);
        lane.style.setProperty('--finish-paint', String(progress));
        base.parentElement!.style.setProperty('--finish-paint', String(progress));
        const label = value === 0 ? 'Clay' : value === 100 ? 'Paint' : value + '% paint';
        if (input.value !== text) input.value = text;
        if (input.getAttribute('aria-valuetext') !== label)
          input.setAttribute('aria-valuetext', label);
      }
      if (changed || (ready && baseIndex < 0 && progress > 0 && progress < 1)) {
        paintArtwork(progress);
      }
    }

    function scrub() {
      manual = input.valueAsNumber / 100;
      if (span && !reduced.matches) {
        const start = scrollY + lane.getBoundingClientRect().top;
        scrollTo({
          top: start + span * (paintFrom + manual * (paintTo - paintFrom)),
          behavior: 'instant',
        });
      }
      schedule();
    }

    function onScroll() {
      if (nearby) schedule();
    }

    function showFocusedContact() {
      if (!root.hasAttribute('data-contact-entered') && document.activeElement === emailLink) {
        contact.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        nearby = entries[entries.length - 1].isIntersecting;
        schedule();
      },
      { rootMargin: '700px 0px' },
    );
    observer.observe(root);
    const geometry = new ResizeObserver(measure);
    geometry.observe(lane);
    geometry.observe(lane.firstElementChild!);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    reduced.addEventListener('change', schedule);
    input.addEventListener('input', scrub);
    contact.addEventListener('focusin', showFocusedContact);
    measure();
    return () => {
      alive = false;
      observer.disconnect();
      geometry.disconnect();
      cancelAnimationFrame(next);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', measure);
      reduced.removeEventListener('change', schedule);
      input.removeEventListener('input', scrub);
      contact.removeEventListener('focusin', showFocusedContact);
    };
  }, []);

  return (
    <div ref={ending} className="rear-finish">
      <div className="rear-finish-layer" aria-hidden="true">
        <div className="rear-finish-stage">
          <FinishStill frame={0} />
          <FinishStill frame={lastFrame} />
          <canvas ref={baseFrame} />
          <canvas ref={blendFrame} />
        </div>
      </div>
      <Section id="sec-about" side="left" desktopVertical="top" mobileVertical="top">
        <div className="about-copy pointer-events-auto">
          <figure
            id="f40-study"
            className="about-framing-study"
            aria-labelledby="finish-study-title"
          >
            <div
              className="scroll-film-track"
              ref={track}
              style={{
                height: `calc(var(--stage-height) + var(--scroll-travel) * ${travel})`,
              }}
            >
              <div className="scroll-film">
                <div className="film-heading">
                  <h3 id="finish-study-title">I build tools that make complex work easier.</h3>
                </div>
                <div className="scroll-film-range">
                  <span aria-hidden="true">Clay</span>
                  <input
                    ref={slider}
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="0"
                    aria-label="Ferrari finish"
                    aria-valuetext="Clay"
                  />
                  <span aria-hidden="true">Paint</span>
                </div>
              </div>
            </div>
          </figure>
        </div>
      </Section>
      <ContactSection sharedBackdrop />
    </div>
  );
}
