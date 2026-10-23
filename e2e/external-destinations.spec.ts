import { expect, test, type Locator, type Page } from '@playwright/test';
import { CARS } from '../src/config';

async function expectDestinations(scope: Page | Locator) {
  const links = scope.locator('a[target="_blank"]:not([aria-label*="opens in a new tab"])');
  const destinations = await links.all();
  expect(destinations.length).toBeGreaterThan(0);
  await Promise.all(
    destinations.map((link) => expect(link).toHaveAccessibleDescription('Opens in a new tab')),
  );
}

test('external destinations describe the new tab on the page and in dialogs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
  await expectDestinations(page);

  await page
    .getByRole('button', { name: /Browse cars\./ })
    .filter({ visible: true })
    .click();
  const cars = page.getByRole('dialog', { name: 'Pick your ride.' });
  await expect(cars).toBeVisible();
  await expectDestinations(cars);
  await page.keyboard.press('Escape');

  await page.locator('#nav').getByRole('link', { name: 'Projects', exact: true }).click();
  await page.getByRole('button', { name: 'How I built it: bloomnote', exact: true }).click();
  const story = page.getByRole('dialog');
  await expect(story).toBeVisible();
  await expectDestinations(story);
  await page.keyboard.press('Escape');

  await page.locator('#nav').getByRole('link', { name: 'Contact', exact: true }).click();
  await page.getByRole('button', { name: /3D model credits/ }).click();
  const credits = page.getByRole('dialog', { name: '3D model credits' });
  await expect(credits).toBeVisible();
  await expectDestinations(credits);
  for (const car of CARS) {
    const credit = car.credit!;
    const entry = credits
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: credit.title, exact: true }) });
    await expect(entry.getByRole('link', { name: credit.title, exact: true })).toHaveAttribute(
      'href',
      credit.url,
    );
    await expect(
      entry.getByRole('link', { name: credit.license, exact: true }).first(),
    ).toHaveAttribute('href', credit.licenseUrl);
    if (credit.upstream) {
      await expect(
        entry.getByRole('link', { name: credit.upstream.author, exact: true }),
      ).toHaveAttribute('href', credit.upstream.url);
      if (credit.upstream.licenseUrl)
        await expect(entry.locator(`a[href="${credit.upstream.licenseUrl}"]`)).toHaveCount(
          credit.upstream.licenseUrl === credit.licenseUrl ? 2 : 1,
        );
    }
    if (credit.notice) await expect(entry).toContainText(credit.notice);
  }
  await expect(credits).toContainText('Full mesh detail retained.');
});
