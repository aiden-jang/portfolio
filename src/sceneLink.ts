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
