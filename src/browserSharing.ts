export type ShareResult = 'shared' | 'copied' | 'failed' | null;

export async function copyText(text: string): Promise<'copied' | 'failed'> {
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

export async function shareLink(data: ShareData & { url: string }): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      // Dismissing the native share sheet is a choice, not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return null;
    }
  }
  return copyText(data.url);
}
