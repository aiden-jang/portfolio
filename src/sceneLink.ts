import { useAppStore } from './store';

/** Build a permalink to the current 3D garage state. Kept outside the UI so
 * desktop and mobile share actions always produce the exact same URL. */
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

/** Use the platform share sheet when it exists, then fall back to a copied
 * permalink. The scene still travels as a normal URL, so recipients can open
 * the exact car, paint, and lighting setup without an account. */
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
      // Dismissing the native sheet is a normal choice, not a failed share.
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
