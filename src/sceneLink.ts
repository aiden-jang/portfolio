import { useAppStore } from './store';

// Outside the UI so the desktop and mobile share actions cannot drift apart.
export function currentSceneUrl(): string {
  const { carIndex, activeBodyColor, themeName } = useAppStore.getState();
  const url = new URL(window.location.href);
  url.searchParams.set('car', String(carIndex));
  url.searchParams.set('paint', activeBodyColor);
  url.searchParams.set('light', themeName);
  return url.toString();
}

export async function copyCurrentSceneUrl(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(currentSceneUrl());
    return true;
  } catch {
    return false;
  }
}

export async function shareCurrentScene(): Promise<'shared' | 'copied' | null> {
  const url = currentSceneUrl();
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: 'Aiden Jang’s garage',
        text: 'A car setup from Aiden Jang’s portfolio',
        url,
      });
      return 'shared';
    } catch (error) {
      // Dismissing the share sheet is a choice, not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return null;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return null;
  }
}
