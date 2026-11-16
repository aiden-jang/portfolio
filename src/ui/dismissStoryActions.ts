export function dismissStoryActions(root: HTMLElement | null): boolean {
  const menu = root?.querySelector<HTMLDetailsElement>('.story-secondary-menu[open]');
  if (!menu) return false;
  menu.open = false;
  menu.querySelector('summary')?.focus();
  return true;
}
