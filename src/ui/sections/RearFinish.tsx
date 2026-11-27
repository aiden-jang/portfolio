import { useEffect, useRef } from 'react';
import { clamp } from '../../math';
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
  const frame = useRef<HTMLCanvasElement>(null);
  const slider = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = ending.current!;
    const lane = track.current!;
    const canvas = frame.current!;
    const input = slider.current!;
    const contact = root.querySelector<HTMLElement>('#sec-contact')!;
    const emailLink = contact.querySelector<HTMLAnchorElement>('.contact-email-link')!;
    const context = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
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
    let drawn = -1;

    function schedule() {
      if (!next) next = requestAnimationFrame(render);
    }

    function load(size: string) {
      ready = false;
      drawn = -1;
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
          canvas.width = frames[0].naturalWidth;
          canvas.height = frames[0].naturalHeight;
          ready = Boolean(context);
          schedule();
        },
        () => {
          // Keep the responsive clay and painted stills if a sequence cannot be decoded.
        },
      );
    }

    function rangeTravel() {
      return Math.max(0, lane.offsetHeight - (lane.firstElementChild as HTMLElement).offsetHeight);
    }

    function render() {
      next = 0;
      const size = short.matches ? 'short' : narrow.matches ? 'phone' : 'desktop';
      if (nearby && size !== format) {
        format = size;
        load(size);
      }
      const travel = rangeTravel();
      const fixed = reduced.matches || !travel;
      const laneBounds = lane.getBoundingClientRect();
      const approach =
        narrow.matches && !reduced.matches
          ? Math.min(innerHeight * 0.21, Math.max(0, laneBounds.top) * 0.45)
          : 0;
      root.style.setProperty('--arrival-offset', -approach + 'px');
      const contactTop = contact.getBoundingClientRect().top;
      const handoff = fixed
        ? Number(contactTop <= window.innerHeight * 0.55)
        : clamp((-laneBounds.top / travel - 0.8) / 0.18, 0, 1);
      const contactEntered = handoff > 0;
      root.style.setProperty('--handoff', String(handoff));
      root.style.setProperty(
        '--contact-offset',
        Math.min(window.innerHeight, Math.max(0, contactTop)) + 'px',
      );
      if (contactEntered !== root.hasAttribute('data-contact-entered')) {
        const focused = document.activeElement;
        root.toggleAttribute('data-contact-entered', contactEntered);
        if (contactEntered && lane.contains(focused)) {
          emailLink.focus({ preventScroll: true });
        } else if (!contactEntered && contact.contains(focused)) {
          input.focus({ preventScroll: true });
        }
      }
      // Finish the paint while the stage is still pinned, then let the page bring in the email.
      const progress = fixed
        ? contactEntered
          ? 1
          : manual
        : clamp((-laneBounds.top / travel - 0.06) / 0.74, 0, 1);
      root.style.setProperty('--finish-paint', String(progress));
      root.dataset.finish = String(progress);
      const value = Math.round(progress * 100);
      input.value = String(value);
      input.setAttribute(
        'aria-valuetext',
        value === 0 ? 'Clay' : value === 100 ? 'Paint' : value + '% paint',
      );
      const index = progress * lastFrame;
      if (!ready || !context || drawn === index || !nearby) return;
      const low = Math.floor(index);
      const high = Math.ceil(index);
      context.drawImage(frames[low], 0, 0);
      if (low !== high) {
        context.globalAlpha = index - low;
        context.drawImage(frames[high], 0, 0);
        context.globalAlpha = 1;
      }
      drawn = index;
      root.setAttribute('data-frames-ready', '');
    }

    function scrub() {
      manual = input.valueAsNumber / 100;
      const travel = rangeTravel();
      if (travel && !reduced.matches) {
        const start = scrollY + lane.getBoundingClientRect().top;
        scrollTo({ top: start + travel * (0.06 + manual * 0.74), behavior: 'instant' });
      }
      schedule();
    }

    function showFocusedContact() {
      if (!root.hasAttribute('data-contact-entered') && document.activeElement === emailLink) {
        contact.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        nearby = entries[entries.length - 1].isIntersecting;
        if (nearby) schedule();
      },
      { rootMargin: '700px 0px' },
    );
    observer.observe(root);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    input.addEventListener('input', scrub);
    contact.addEventListener('focusin', showFocusedContact);
    render();
    return () => {
      alive = false;
      observer.disconnect();
      cancelAnimationFrame(next);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
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
          <canvas ref={frame} />
        </div>
      </div>
      <Section id="sec-about" side="left" desktopVertical="top" mobileVertical="top">
        <div className="about-copy pointer-events-auto">
          <figure
            id="f40-study"
            className="about-framing-study"
            aria-labelledby="finish-study-title"
          >
            <div className="scroll-film-track" ref={track}>
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
                <div className="about-framing-notes">
                  <span>
                    Model by{' '}
                    <a href="https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95">
                      vecarz
                    </a>
                    , CC BY 4.0.
                  </span>
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
