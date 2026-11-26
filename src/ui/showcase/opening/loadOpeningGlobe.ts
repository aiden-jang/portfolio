import { createGlobeScene, loadGeography, loadAurora } from '../globe/scene';
import { readEvents, vector } from '../globe/data';
import { loadRecordedWeather } from '../globe/recordedWeatherAssets';
import { subsolarPoint } from '../globe/sun';
import { kamchatkaExample as example } from '../../../data/kamchatkaExample';
const pin = { lon: 159.7106, lat: 53.024 };
export async function loadOpeningGlobe(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const [geo, aurora, events, weather] = await Promise.all([
    loadGeography(signal),
    loadAurora(signal),
    fetch('/projects/atlas-events.json', { signal }).then((r) => r.json()),
    loadRecordedWeather(signal),
  ]);
  if (signal.aborted) {
    weather.radar.close();
    return;
  }
  const sun = subsolarPoint(Date.parse('2026-11-17T23:00:00Z'));
  const featured = {
    ...pin,
    id: example.sources[0].reportId,
    place: example.place,
    time: Date.parse(example.timestamp),
    magnitude: 5.8,
    scale: 'mww',
    depth: example.sources[0].depthKm,
  };
  return createGlobeScene(
    canvas,
    geo,
    readEvents(events).filter((e) => e.id !== featured.id),
    featured,
    vector(sun.lon, sun.lat),
    aurora,
    weather,
  );
}
