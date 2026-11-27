import type { createGlobeScene } from './scene';
import type { GlobeEvent } from './data';
type Globe = Pick<ReturnType<typeof createGlobeScene>, 'project'>;

export function alignGlobeReading(
  canvas: HTMLCanvasElement,
  art: HTMLElement | null,
  globe: Globe,
  focused?: GlobeEvent,
) {
  if (art && focused) {
    const surface = canvas.getBoundingClientRect();
    const marker = globe.project(focused.lon, focused.lat, surface);
    const bounds = art.getBoundingClientRect();
    if (marker && bounds.width && bounds.height) {
      art.style.setProperty('--event-x', `${((marker.x - bounds.left) / bounds.width) * 100}%`);
      art.style.setProperty('--event-y', `${((marker.y - bounds.top) / bounds.height) * 100}%`);
    }
  } else if (art?.style.getPropertyValue('--event-x')) {
    art.style.removeProperty('--event-x');
    art.style.removeProperty('--event-y');
  }
}

export function visibleGlobeEvents(
  canvas: HTMLCanvasElement,
  selectable: GlobeEvent[],
  globe: Globe,
) {
  const rect = canvas.closest('.preview-thumbnail')!.getBoundingClientRect();
  return selectable.flatMap((event) => {
    const at = globe.project(event.lon, event.lat);
    return at &&
      at.x > rect.left + 12 &&
      at.x < rect.right - 12 &&
      at.y > rect.top + 12 &&
      at.y < rect.bottom - 65
      ? [{ event, ...at }]
      : [];
  });
}
