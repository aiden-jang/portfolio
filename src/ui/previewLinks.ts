export function previewIndex(value: string | null, name: string, count: number): number | null {
  if (!value) return null;
  const [project, index, extra] = value.split(':');
  if (project !== name || extra !== undefined || !/^\d+$/.test(index ?? '')) return null;
  const number = Number(index);
  return number < count ? number : null;
}

export function previewLink(href: string, name: string, index: number): string {
  const url = new URL(href);
  url.searchParams.set('preview', `${name}:${index}`);
  url.hash = `project-${name}`;
  return url.href;
}
