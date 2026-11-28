import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`screenshot inspection enlarges the complete image at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#sec-work');
    const trigger = page.getByRole('button', {
      name: 'Inspect screenshot: meanwhile.',
      exact: true,
    });
    await trigger.click();
    const viewer = page.getByRole('dialog', { name: 'meanwhile. screenshot', exact: true });
    const image = viewer.getByRole('img');
    await expect(image).toHaveAttribute('src', '/projects/everythingisfine.jpg');
    const fitted = (await image.boundingBox())!.width;
    await viewer.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await expect.poll(async () => (await image.boundingBox())!.width).toBeGreaterThan(fitted * 1.4);
    await viewer.getByRole('button', { name: 'Fit image', exact: true }).click();
    await expect.poll(async () => (await image.boundingBox())!.width).toBeCloseTo(fitted, 0);
    const area = viewer.getByRole('region', { name: 'meanwhile. screenshot image' });
    const horizontalScroll = () => area.evaluate((el) => el.scrollLeft);
    const imageBox = (await image.boundingBox())!;
    const areaBox = (await area.boundingBox())!;
    const y = Math.floor(Math.min(imageBox.height, areaBox.height) / 2);
    await image.click({ position: { x: Math.floor(imageBox.width * 0.82), y } });
    await expect(viewer.getByRole('button', { name: 'Fit image', exact: true })).toBeVisible();
    const right = await horizontalScroll();
    await viewer.getByRole('button', { name: 'Fit image', exact: true }).click();
    await image.click({ position: { x: Math.floor(imageBox.width * 0.18), y } });
    await expect.poll(horizontalScroll).toBeLessThan(right - 30);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });
}

test('phone reader keeps source and sharing available with independent Escape dismissal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => {} },
      configurable: true,
    });
  });
  await page.goto('/work/');
  const trigger = page.getByRole('link', { name: 'Shared sign-in — Project notes', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  const more = dialog.getByLabel('Source and sharing', { exact: true });
  const close = dialog.getByRole('button', { name: 'Close', exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(more).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(more).toBeFocused();
  await more.press('Enter');
  const menu = dialog.locator('.story-secondary-panel');
  await expect(menu.getByRole('link', { name: 'Source code', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Share link', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Link copied', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(more).toBeFocused();
  await expect(menu.getByRole('link', { name: 'Source code', exact: true })).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.press('Enter');
  await expect(close).toBeFocused();
  await close.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(trigger).toBeFocused();
});
