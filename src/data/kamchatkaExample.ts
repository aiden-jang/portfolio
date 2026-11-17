// Recorded USGS usd0015edq and EMSC 20260817_0000423, as used by the app's reconciliation fixture.
export const kamchatkaExample = {
  place: 'Off the east coast of Kamchatka',
  date: '17 Aug 2026',
  timestamp: '2026-08-17T12:38:03.466Z',
  time: '12:38 UTC',
  sources: [
    { name: 'USGS', magnitude: 5.8, scale: 'mww', depthKm: 54.741 },
    { name: 'EMSC', magnitude: 5.8, scale: 'mw', depthKm: 71 },
  ],
  difference: { seconds: 1.554, kilometres: 6.48 },
  report: 'https://earthquake.usgs.gov/earthquakes/eventpage/usd0015edq',
} as const;
