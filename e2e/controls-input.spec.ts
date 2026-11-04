import { expect, test } from '@playwright/test';

test('control search leaves composition keys to the input before running a command', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-13T18:00:00Z'));
  await page.goto('/');
  await page
    .getByRole('button', { name: 'All controls', exact: true })
    .filter({ visible: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Command menu', exact: true });
  const search = dialog.getByRole('combobox', { name: 'Search portfolio controls' });
  const active = await search.getAttribute('aria-activedescendant');
  await search.dispatchEvent('keydown', { key: 'ArrowDown', isComposing: true });
  await expect(search).toHaveAttribute('aria-activedescendant', active!);
  await search.fill('about');
  await search.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
  await expect(dialog).toBeVisible();
  await expect(search).toBeFocused();
  await search.dispatchEvent('keydown', { key: 'Escape', isComposing: true });
  await expect(dialog).toBeVisible();
  await search.dispatchEvent('keydown', { key: 'Enter', keyCode: 229 });
  await expect(dialog).toBeVisible();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`controls-search-${width}.png`) });
  }
  await search.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('#sec-about')).toBeInViewport();
});
