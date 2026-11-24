type WindSample = [lon: number, lat: number, east: number, north: number];
export type RecordedWeather = { radar: ImageBitmap; wind: WindSample[] };

export async function loadRecordedWeather(signal: AbortSignal): Promise<RecordedWeather> {
  const [radar, wind] = await Promise.all([
    fetch('/projects/atlas-radar.webp', { signal }).then((r) => {
      if (!r.ok) throw Error('Recorded radar unavailable');
      return r.blob();
    }),
    fetch('/projects/atlas-wind.json', { signal }).then(async (r) => {
      if (!r.ok) throw Error('Recorded wind unavailable');
      return (await r.json()).wind as WindSample[];
    }),
  ]);
  return { radar: await createImageBitmap(radar), wind };
}
