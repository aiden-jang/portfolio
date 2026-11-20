import type { Locator } from '@playwright/test';

export async function openStudioControls(studio: Locator) {
  const closed = studio.getByRole('button', { name: 'Controls', exact: true });
  if (await closed.isVisible()) await closed.click();
}

export async function selectStudioExhibit(studio: Locator, name: string) {
  await studio.getByRole('button', { name: 'Studio exhibits', exact: true }).click();
  const gallery = studio.getByRole('dialog', { name: 'Studio exhibits', exact: true });
  const exhibits = gallery.getByRole('group', { name: 'All exhibits' });
  await exhibits.getByRole('button', { name, exact: true }).click();
}
