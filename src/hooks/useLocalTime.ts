import { useEffect, useState } from 'react';

const FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/New_York',
});

export function useLocalTime(): string {
  const [time, setTime] = useState(() => FORMATTER.format(new Date()));
  useEffect(() => {
    const tick = () => setTime(FORMATTER.format(new Date()));
    // First tick is aligned to the next minute, so the displayed minute never lags by up to 30s.
    const ms = 60_000 - (Date.now() % 60_000);
    let intervalId: number | undefined;
    const firstId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 30_000);
    }, ms);
    return () => {
      window.clearTimeout(firstId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);
  return time;
}
