import { expect, test } from '@playwright/test';

test('Contact shows its fixed car and email while the F40 is loading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/models/ferrari-f120-f40.glb', async (route) => {
    await held;
    await route.continue();
  });
  await page.goto('/#sec-contact', { waitUntil: 'domcontentloaded' });
  const poster = page.locator('#sec-contact .contact-poster img');
  try {
    await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
    await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(390);
    await expect(page.locator('.car-loading-progress')).toBeHidden();
    await page.getByRole('link', { name: /me@aidenjang.com/ }).click({ trial: true });
  } finally {
    release();
  }
  await expect(poster).toHaveCount(0);
});

test('a failed car download preserves the portfolio and can retry the original model', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/models/ferrari-f120-f40.glb', (route) => {
    requests++;
    return requests === 1 ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.continue();
  });
  await page.goto('/?car=0');
  const notice = page.getByRole('alert').filter({ hasText: /Couldn.t load Ferrari F40/ });
  await expect(notice).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('#sec-intro')).toBeVisible();
  await notice.getByRole('button', { name: 'Retry car', exact: true }).click();
  await expect(notice).toHaveCount(0);
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  expect(requests).toBe(2);
  await expect(
    page.getByRole('button', { name: /Browse cars. Ferrari F40/ }).filter({ visible: true }),
  ).toBeEnabled();
});
