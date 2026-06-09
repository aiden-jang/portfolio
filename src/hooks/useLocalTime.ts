import { useEffect, useState } from 'react';

const FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/New_York',
});

/** Live NYC clock that updates roughly every 30 seconds. Used in the brand
 *  block so the page shows the author's local time. */
export function useLocalTime(): string {
  const [time, setTime] = useState(() => FORMATTER.format(new Date()));
  useEffect(() => {
    const tick = () => setTime(FORMATTER.format(new Date()));
    // Align the first update to the next minute boundary, then poll every 30s.
    const ms = 60_000 - (Date.now() % 60_000);
    const firstId = window.setTimeout(() => {
      tick();
      const intervalId = window.setInterval(tick, 30_000);
      // Stash so cleanup can clear it.
      (firstId as unknown as { _i?: number })._i = intervalId;
    }, ms);
    return () => {
      window.clearTimeout(firstId);
      const i = (firstId as unknown as { _i?: number })._i;
      if (i) window.clearInterval(i);
    };
  }, []);
  return time;
}
