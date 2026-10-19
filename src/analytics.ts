/** Scene settings, incoming query values and fragments are not analytics dimensions. */
export function publicAnalyticsUrl<T extends { url: string }>(event: T): T | null {
  const privacy =
    typeof navigator === 'undefined'
      ? null
      : (navigator as Navigator & { globalPrivacyControl?: boolean });
  if (privacy?.globalPrivacyControl || privacy?.doNotTrack === '1') return null;
  try {
    const url = new URL(event.url);
    if (url.hostname !== 'www.aidenjang.com' && url.hostname !== 'aidenjang.com') return null;
    url.pathname = '/';
    url.search = '';
    url.hash = '';
    url.username = '';
    url.password = '';
    return { ...event, url: url.href };
  } catch {
    return null;
  }
}
