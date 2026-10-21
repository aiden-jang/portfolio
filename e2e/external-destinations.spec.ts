import { expect, test, type Locator, type Page } from '@playwright/test';

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
  const licenses = credits.getByRole('link', { name: 'CC BY 4.0', exact: true });
  await expect(licenses).toHaveCount(10);
  for (const license of await licenses.all())
    await expect(license).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  await expect(credits.getByRole('link', { name: 'Audi R8', exact: true })).toHaveAttribute(
    'href',
    'https://sketchfab.com/3d-models/e17e438f076f4427a58d93aa779edaed',
  );
  await expect(
    credits.getByRole('link', { name: 'Toyota Supra MK IV (1994)', exact: true }),
  ).toHaveAttribute('href', 'https://sketchfab.com/3d-models/eb9bb1eb41db431cb078088ae1ce45f8');
  await expect(
    credits.getByRole('link', { name: 'Porsche 911 (930) Turbo 1975', exact: true }),
  ).toHaveAttribute('href', 'https://sketchfab.com/3d-models/de1ffd344c41481892511f7fd332c136');
  await expect(
    credits.getByRole('link', { name: 'Porsche 917k LM Red | www.vecarz.com', exact: true }),
  ).toHaveAttribute(
    'href',
    'https://sketchfab.com/3d-models/porsche-917k-lm-red-wwwvecarzcom-1b0f1751a3064ea1a015cdfceebf7918',
  );
  await expect(credits.getByRole('link', { name: 'JUSTGAME', exact: true })).toHaveAttribute(
    'href',
    'https://sketchfab.com/3d-models/porsche-917k-abb07de409db42178e3df943dd009103',
  );
  await expect(credits).toContainText('Full mesh detail retained.');
  await expect(credits.getByRole('link', { name: 'Ddiaz Design', exact: true })).toHaveAttribute(
    'href',
    'https://sketchfab.com/3d-models/54f2273c00e94ebdba0f0db1a7945bf2',
  );
  await expect(credits.getByRole('link', { name: 'CC BY-NC-SA 4.0', exact: true })).toHaveAttribute(
    'href',
    'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  );
  await expect(credits).toContainText('Permission for the underlying game assets is unverified.');
});
