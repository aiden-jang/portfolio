import { expect, test } from '@playwright/test';
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
    await page.getByRole('button', { name: 'Show an event', exact: true }).click();
    const link = page.getByRole('link', { name: 'Open this event' });
    await expect(link).toBeVisible();
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
    const currentCode = iodine.locator('[data-current="true"] code');
    const otherCode = iodine.locator('[data-current="false"] code');
    await expect(currentCode).toContainText('.trim()');
    if (width >= 768) await expect(otherCode).toBeVisible();
    else await expect(otherCode).toBeHidden();
    await iodine.getByRole('button', { name: 'Undo edit', exact: true }).press('Enter');
    await expect(currentCode).not.toContainText('.trim()');
    await expect(iodine.getByText('Snapshot restored', { exact: true })).toBeVisible();
    if (width >= 768) await expect(otherCode).toBeVisible();
    else await expect(otherCode).toBeHidden();
    const replay = iodine.getByRole('button', { name: 'Replay edit', exact: true });
    await expect(replay).toBeFocused();
    await replay.press('Enter');
    await expect(currentCode).toContainText('.trim()');
    const screenshot = iodine.getByRole('button', { name: 'View editor screenshot for iodine' });
    await expect(screenshot.locator('img')).toHaveAttribute('src', '/projects/iodine.png');
    await screenshot.press('Enter');
    const editor = page.getByRole('dialog', { name: 'iodine screenshot', exact: true });
    await expect(editor.getByRole('button', { name: 'Close screenshot' })).toBeFocused();
    await expect(editor.getByRole('img')).toHaveAttribute('src', '/projects/iodine.png');
    await page.keyboard.press('Escape');
    await expect(screenshot).toBeFocused();
    await page.getByRole('button', { name: 'Pet Bean', exact: true }).click();
    await expect(page.locator('.bean-response')).toHaveText('mrrp.');
    await expect(page.locator('.bean-cameo img')).toHaveJSProperty('complete', true);
    const bloomnote = page.locator('#project-bloomnote');
    await expect(bloomnote.getByRole('blockquote')).toContainText('For that brilliant laugh');
    const garden = bloomnote.getByRole('button', { name: 'View full garden' });
    await garden.click();
    await expect(page.getByRole('dialog', { name: 'bloomnote screenshot' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(garden).toBeFocused();
    await page.getByRole('button', { name: 'How I built it: iguess', exact: true }).click();
    await page.getByRole('button', { name: 'Follow the flow' }).click();
    await expect(page.locator('.flow-explanation')).toContainText('AI Worker');
    const hash = new URL(page.url()).hash;
    await page.getByRole('button', { name: 'Draw', exact: true }).press('ArrowRight');
    expect(new URL(page.url()).hash).toBe(hash);
    await page.keyboard.press('Escape');
    await expect(page.locator('.work-modal-panel')).toHaveCount(0);
    expect(await page.locator('.garage-project').count()).toBe(9);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`showcase-${width}.png`) });
  });
}
test('globe waits for featured work and a failed start keeps the preview and retry', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const assets: string[] = [];
  page.on('request', (r) => {
    if (/globe-engine|globe-geography|orbit-snapshot/.test(r.url())) assets.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('#sec-intro h1')).toBeVisible();
  expect(assets).toEqual([]);
  await page.route('**/projects/globe-geography.bin.gz', (r) =>
    r.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.locator('#sec-work').scrollIntoViewIfNeeded();
  await expect(page.locator('.orbit-feature')).toHaveAttribute('data-globe-phase', 'error', {
    timeout: 60000,
  });
  await expect(page.locator('.orbit-feature .screenshot-image')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry globe', exact: true })).toBeVisible();
  await page.unroute('**/projects/globe-geography.bin.gz');
  await page.getByRole('button', { name: 'Retry globe', exact: true }).click();
  await expect(page.locator('.orbit-feature')).toHaveAttribute('data-globe-phase', 'ready', {
    timeout: 60000,
  });
  await expect(page.getByRole('button', { name: 'Resume rotation' })).toBeVisible();
});
