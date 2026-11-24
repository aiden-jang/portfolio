import type { Locator } from '@playwright/test';

export async function openStudioControls(studio: Locator) {
  const closed = studio.getByRole('button', { name: 'More views', exact: true });
  if (await closed.isVisible()) await closed.click();
}

export async function selectStudioExhibit(studio: Locator, name: string) {
  await studio.getByRole('button', { name: 'Studio exhibits', exact: true }).click();
  const gallery = studio.getByRole('dialog', { name: 'Studio exhibits', exact: true });
  const exhibits = gallery.getByRole('group', { name: 'All exhibits' });
  await exhibits.getByRole('button', { name, exact: true }).click();
}

export async function openStudioAdvanced(studio: Locator) {
  await studio.getByRole('button', { name: 'Advanced', exact: true }).click();
  return studio.getByRole('dialog', { name: 'Advanced', exact: true });
}

export async function clickStudioAdvanced(studio: Locator, name: string) {
  const panel = await openStudioAdvanced(studio);
  await panel.getByRole('button', { name, exact: true }).click();
}
