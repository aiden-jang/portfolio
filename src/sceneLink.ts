import { copyText, shareLink, type ShareResult } from './browserSharing';
import { useAppStore } from './store';

export function currentSceneUrl(): string {
  const { carIndex, activeBodyColor, themeName } = useAppStore.getState();
  const url = new URL(window.location.href);
  url.searchParams.set('car', String(carIndex));
  url.searchParams.set('paint', activeBodyColor);
  url.searchParams.set('light', themeName);
  return url.toString();
}

export async function copyCurrentSceneUrl(): Promise<boolean> {
  return (await copyText(currentSceneUrl())) === 'copied';
}

export async function shareCurrentScene(): Promise<ShareResult> {
  return shareLink({
    title: 'Aiden Jang’s garage',
    text: 'A car setup from Aiden Jang’s portfolio',
    url: currentSceneUrl(),
  });
}
