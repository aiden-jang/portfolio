import { expect, it } from 'vitest';
import { eventLink, readEvents, type Snapshot } from './data';
const feature = {
  id: 'us123',
  properties: { mag: 4.2, place: 'Pacific Ocean', magType: 'mw', time: 1794870325904 },
  geometry: { coordinates: [145, 24, 70] as [number, number, number] },
};
it('keeps reported readings and ignores events that cannot be placed honestly', () => {
  const events = readEvents({
    metadata: { generated: 1794876959000 },
    features: [
      feature,
      { ...feature, geometry: { coordinates: [145, NaN, 70] } },
      { ...feature, properties: { ...feature.properties, mag: 1 } },
    ],
  });
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({
    id: 'us123',
    magnitude: 4.2,
    lon: 145,
    lat: 24,
    depth: 70,
    time: feature.properties.time,
  });
});
it('rejects a missing recorded moment instead of presenting it as live data', () => {
  expect(() => readEvents({ metadata: {}, features: [] } as unknown as Snapshot)).toThrow(
    'Snapshot unavailable',
  );
});
it('opens the selected USGS event with the current camera and data filters', () => {
  const event = readEvents({ metadata: { generated: 1794876959000 }, features: [feature] })[0];
  const url = new URL(eventLink(event, { lon: 505, lat: 24, zoom: 1.2 })),
    params = new URLSearchParams(url.hash.slice(1));
  expect(url.origin).toBe('https://everythingisfine.aidenjang.com');
  expect(params.get('at')).toBe('145,24,1.2');
  expect(params.get('e')).toBe('usgs:us123');
  expect(params.get('s')).toBe('usgs');
  expect(params.get('w')).toBe('720');
});
