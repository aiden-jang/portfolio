import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
]) {
  test(`the actual drawing lands in Bean’s room at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.route('**/*.glb', (route) => route.abort());
    await page.goto('/#project-iguess');
    const desk = page.locator('#project-iguess');
    const canvas = desk.locator('#drawing-board');
    await canvas.focus();
    await canvas.press('ArrowRight');
    await canvas.press('ArrowDown');
    await expect(canvas).toHaveAttribute('data-mark-count', '1');
    const marks = await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
    await desk.getByRole('button', { name: 'Hang my drawing' }).click();
    const room = page.locator('#project-mrrp');
    const frame = room.locator('.framed-print');
    await expect(room.getByRole('button', { name: 'Pet Bean' })).toBeInViewport();
    await expect
      .poll(() => frame.evaluate((el) => (el as HTMLCanvasElement).toDataURL()))
      .toBe(marks);
    const status = room.getByRole('status');
    await room.getByRole('button', { name: 'Pet Bean' }).click();
    await expect(status).toContainText('Bean leans into your hand');
    await room.getByRole('button', { name: 'Play with the toy mouse' }).press('Enter');
    await expect(status).toContainText('pounces on her mouse');
    await room.getByRole('button', { name: 'Play with the cardboard box' }).click();
    await expect(status).toContainText('Two ears peek');
    await room.getByRole('button', { name: 'Morning light' }).click();
    await expect(status).toContainText('Morning light');
    await room.getByRole('button', { name: 'Return to drawing pad' }).click();
    await expect(canvas).toHaveAttribute('data-mark-count', '1');
    await desk.getByRole('button', { name: 'Undo last mark' }).click();
    await expect(canvas).toHaveAttribute('data-mark-count', '0');
  });
}

for (const width of [1440, 390]) {
  test(`project interactions preserve their examples and navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/#sec-work');
    const globe = page.locator('.orbit-feature');
    await page.getByRole('button', { name: 'Explore globe', exact: true }).click();
    await expect(globe).toHaveAttribute('data-globe-phase', 'ready', { timeout: 60000 });
    await page.locator('.orbit-preview').hover();
    await page.getByRole('button', { name: 'Show Kamchatka', exact: true }).click();
    const link = page.getByRole('link', { name: 'Open this event' });
    await expect(link).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Selected earthquake' })).toContainText(
      /[A-Z][a-z]{2} \d{1,2}, 20\d{2}/,
    );
    await expect(link).toHaveAccessibleDescription('Opens in a new tab');
    const url = new URL((await link.getAttribute('href'))!);
    expect(url.hostname).toBe('meanwhile.aidenjang.com');
    expect(new URLSearchParams(url.hash.slice(1)).get('e')).toMatch(/^usgs:/);
    await page.getByRole('button', { name: 'Close event details' }).click();
    const canvas = page.locator('#globe-view');
    await canvas.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Explore globe', exact: true })).toBeFocused();
    await expect(canvas).toHaveCount(0);
    const iodine = page.locator('#project-iodine');
    await expect(iodine.getByRole('status')).toHaveText('Edit undone');
    await iodine.getByRole('button', { name: 'Reset edit' }).click();
    await expect(iodine.getByRole('status')).toHaveText('Agent edit');
    await expect(iodine.locator('.recovery-line mark')).toHaveText('.trim()');
    await iodine.getByRole('button', { name: 'Undo edit' }).click();
    await expect(iodine.getByRole('status')).toHaveText('Edit undone');
    const garden = page
      .locator('#project-bloomnote')
      .getByRole('button', { name: 'View full garden' });
    await garden.click();
    await expect(page.getByRole('dialog', { name: 'Full garden' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(garden).toBeFocused();
  });
}
