import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (/webgl/.test(type)) return null;
      return Reflect.apply(get, this, [type, ...args]);
    } as typeof get;
  });
  await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
  await page.route('**/*.glb', (route) => route.abort());
});

function scrollTo(page: Page, top: number) {
  return page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

test('the header remains legible through the showroom cut and links to Contact', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const header = page.locator('.portfolio-header');
  await expect(header).toHaveCSS('background-color', /^rgba\(\d+, \d+, \d+, 0\)$/);
  await scrollTo(page, 44);
  await expect(header).toHaveCSS('background-color', 'rgba(16, 16, 20, 0.38)');
  const root = page.locator('html');
  await scrollTo(page, 810);
  await expect(root).toHaveAttribute('data-showroom-handoff', '');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).not.toHaveAttribute('data-showroom-handoff', '');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .getByRole('navigation', { name: 'Portfolio navigation' })
    .getByRole('link', { name: 'Contact', exact: true })
    .click();
  await expect(page.locator('.contact-email-link')).toBeInViewport();
  await expect
    .poll(() =>
      page.locator('#sec-contact').evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
    )
    .toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Aiden Jang, back to the top' }).press('Enter');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test('the Work index returns to the same project on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#project-bloomnote');
  const scene = page.locator('#project-bloomnote');
  await expect(scene.getByRole('heading')).toBeInViewport();
  await page.getByRole('link', { name: 'Work index' }).click();
  await expect(page.getByRole('heading', { name: 'Work index', exact: true })).toBeVisible();
  await page.goBack();
  await expect(scene.getByRole('heading')).toBeInViewport();
});
