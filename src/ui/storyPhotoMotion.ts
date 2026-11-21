type Photo = {
  frame: Element;
  bounds: DOMRect;
  src: string;
  position: string;
  radius: string;
};

function visible(frame: Element, bounds: DOMRect) {
  const scroll = frame.closest('.story-scroll-area')?.getBoundingClientRect();
  const top = Math.max(0, scroll?.top ?? 0);
  const bottom = Math.min(innerHeight, scroll?.bottom ?? innerHeight);
  return bounds.width > 0 && bounds.top >= top - 1 && bounds.bottom <= bottom + 1;
}

function photo(frame: Element | null | undefined): Photo | null {
  const img = frame?.querySelector('img');
  if (!frame || !img) return null;
  const bounds = frame.getBoundingClientRect();
  if (!visible(frame, bounds)) return null;
  return {
    frame,
    bounds,
    src: img.currentSrc || img.src,
    position: frame.matches('[data-story-source="bloomnote"]')
      ? '50% 0%'
      : getComputedStyle(img).objectPosition,
    radius: frame.matches('[data-story-source="iodine"]')
      ? getComputedStyle(frame.parentElement!).borderRadius
      : getComputedStyle(frame).borderRadius,
  };
}

export function storySource(origin: HTMLElement | null) {
  return photo(origin?.closest('article')?.querySelector('[data-story-source]'));
}

export function storyDestination() {
  return photo(document.querySelector('[data-story-cover] .reader-cover-frame'));
}

export function moveStoryPhoto(from: Photo | null, to: Photo | null, duration: number) {
  if (!from || !to || from.src !== to.src) return null;
  const flight = document.createElement('img');
  flight.src = from.src;
  flight.alt = '';
  flight.setAttribute('aria-hidden', 'true');
  flight.className = 'story-photo-flight';
  const frame = ({ bounds, position, radius }: Photo) => ({
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    objectPosition: position,
    borderRadius: radius,
  });
  const hide = (element: Element) => (element as HTMLElement).style;
  const originOpacity = hide(from.frame).opacity;
  const destinationOpacity = hide(to.frame).opacity;
  hide(from.frame).opacity = '0';
  hide(to.frame).opacity = '0';
  document.body.append(flight);
  const animation = flight.animate([frame(from), frame(to)], {
    duration,
    easing: 'cubic-bezier(.22,.85,.19,1)',
    fill: 'both',
  });
  const cleanup = () => {
    flight.remove();
    hide(from.frame).opacity = originOpacity;
    hide(to.frame).opacity = destinationOpacity;
  };
  void animation.finished.then(cleanup, cleanup);
  return animation;
}
