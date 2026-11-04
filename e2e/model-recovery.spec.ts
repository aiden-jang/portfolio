import { expect, test } from '@playwright/test';

test('a failed car download preserves the portfolio and can retry the original model', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/models/ferrari-f120-f40.glb', (route) => {
    requests++;
    return requests === 1 ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.continue();
  });
  await page.goto('/');
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
