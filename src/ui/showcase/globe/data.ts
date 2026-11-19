import { Vector3 } from 'three';

export type GlobePose = { lon: number; lat: number; zoom: number };
export type PickedEvent = {
  id: string;
  place: string;
  magnitude: number;
  scale: string;
  time: number;
  depth: number;
  url: string;
};
export type Snapshot = {
  metadata: { generated: number };
  features: {
    id: string;
    properties: { mag: number; place: string; magType: string; time: number };
    geometry: { coordinates: [number, number, number] };
  }[];
};
export type GlobeEvent = Omit<PickedEvent, 'url'> & { lon: number; lat: number };
export const vector = (lon: number, lat: number, radius = 1) => {
  const phi = (lat * Math.PI) / 180,
    lam = (lon * Math.PI) / 180;
  return new Vector3(
    Math.cos(phi) * Math.sin(lam),
    Math.sin(phi),
    Math.cos(phi) * Math.cos(lam),
  ).multiplyScalar(radius);
};
export function readEvents(snapshot: Snapshot): GlobeEvent[] {
  if (!Number.isFinite(snapshot.metadata?.generated) || !Array.isArray(snapshot.features))
    throw Error('Snapshot unavailable');
  return snapshot.features.flatMap((f) => {
    const [lon, lat, depth] = f.geometry?.coordinates ?? [],
      p = f.properties;
    if (
      ![lon, lat, p?.mag, p?.time].every(Number.isFinite) ||
      p.mag < 2.5 ||
      Math.abs(lat) > 90 ||
      !f.id
    )
      return [];
    return [
      {
        id: f.id,
        lon,
        lat,
        depth,
        place: p.place,
        magnitude: p.mag,
        scale: p.magType,
        time: p.time,
      },
    ];
  });
}
export function eventLink(event: GlobeEvent, pose: GlobePose): string {
  const round = (n: number) => Number(n.toFixed(2));
  const lon = pose.lon - 360 * Math.floor((pose.lon + 180) / 360);
  return `https://meanwhile.aidenjang.com/#at=${round(lon)},${round(pose.lat)},${round(pose.zoom)}&m=2.5&w=720&s=usgs&r=thermal&v=explore&e=usgs:${encodeURIComponent(event.id)}`;
}
