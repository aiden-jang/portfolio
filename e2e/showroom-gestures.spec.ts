import { expect, test, type CDPSession } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

type Point = { x: number; y: number };

async function swipe(device: CDPSession, path: Point[], during?: () => Promise<void>) {
  await device.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [path[0]!] });
  try {
    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1]!;
      const to = path[i]!;
      for (let step = 1; step <= 8; step++) {
        await device.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [
            {
              x: from.x + ((to.x - from.x) * step) / 8,
              y: from.y + ((to.y - from.y) * step) / 8,
            },
          ],
        });
      }
    }
    await during?.();
  } finally {
    await device.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
}

test('a phone keeps an orbit through a vertical turn and still scrolls on a new swipe', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Native touch injection uses Chromium DevTools.');
  await page.goto('/');
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  await expect(page.getByText('Swipe sideways to orbit.')).toBeVisible();
  const input = await context.newCDPSession(page);
  await swipe(
    input,
    [
      { x: 280, y: 480 },
      { x: 160, y: 481 },
      { x: 116, y: 370 },
    ],
    async () => {
      await expect(page.locator('body')).toHaveClass(/orbiting/);
      expect(await page.evaluate(() => scrollY)).toBeLessThan(5);
    },
  );
  await expect(page.locator('body')).not.toHaveClass(/orbiting/);
  await swipe(input, [
    { x: 340, y: 600 },
    { x: 344, y: 365 },
  ]);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(80);
  await expect(page.locator('body')).not.toHaveClass(/orbiting/);
});

test('a slow Studio switch retains the outgoing photo and name with reduced motion', async ({
  page,
}) => {
  let releaseDownload: () => void = () => {};
  const blocked = new Promise<void>((resolve) => {
    releaseDownload = resolve;
  });
  let requested = false;
  await page.route('**/models/bmw-g82-m4-adro.glb', async (route) => {
    requested = true;
    await blocked;
    await route.continue();
  });

  try {
    await page.goto('/?garage=studio&car=0');
    const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
    await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
    await studio.getByRole('button', { name: 'Choose car', exact: true }).click();
    await page
      .locator('.car-browser-grid')
      .getByRole('button', { name: /BMW M4 ADRO/ })
      .click();
    await expect.poll(() => requested).toBe(true);
    await expect(studio.getByRole('heading', { name: 'Ferrari F40' })).toBeVisible();
    await expect(studio.getByRole('status')).toContainText('Loading BMW M4 ADRO');
    const outgoing = page.locator('.studio-car-swap');
    await expect(outgoing).toBeVisible();
    releaseDownload();
    await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
    await expect(studio.getByRole('heading', { name: 'BMW M4 ADRO' })).toBeVisible();
    await expect(outgoing).toHaveCount(0);
  } finally {
    releaseDownload();
  }
});
