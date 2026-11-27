import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function scrollTo(page: Page, top: number) {
  return page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
]) {
  test.describe(`showroom motion at ${width}px`, () => {
    test.use({
      viewport: { width, height },
      hasTouch: width < 768,
      reducedMotion: 'no-preference',
    });

    test('the globe cuts over the showroom and Contact shows its own fixed frame', async ({
      page,
    }) => {
      // The browser checks the stage's CSS opacity without continuously drawing the 3D scene.
      await page.addInitScript(() => {
        Object.defineProperty(document, 'hidden', { get: () => true });
      });
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      const dockSelector = width < 768 ? '#mobile-bar' : '#desktop-dock';
      const dock = page.locator(dockSelector);
      const stage = page.locator('.portfolio-scene');
      const contact = page.locator('#sec-contact');
      const root = page.locator('html');
      const work = page.locator('#sec-work');
      const workTop = await work.evaluate((el) => scrollY + el.getBoundingClientRect().top);

      await expect(dock).toBeVisible();
      await expect(dock).toHaveCSS('opacity', '1');
      await scrollTo(page, workTop - height * 0.755);
      await expect(root).toHaveAttribute('data-showroom-handoff', '');
      await expect(root).not.toHaveAttribute('data-before-globe-cut');
      await expect
        .poll(() =>
          page.evaluate(() =>
            Boolean(
              document
                .elementFromPoint(innerWidth / 2, innerHeight * 0.65)
                ?.closest('#project-everythingisfine'),
            ),
          ),
        )
        .toBe(true);
      await expect(stage).toHaveCSS('opacity', '1');

      await work.evaluate((section) => {
        scrollBy({ top: section.getBoundingClientRect().top + 3, behavior: 'instant' });
      });
      await expect(root).not.toHaveAttribute('data-showroom-handoff');
      await expect(dock).toBeHidden();
      await scrollTo(page, 0);
      await expect(dock).toBeVisible();
      await expect(dock).toHaveCSS('opacity', '1');

      const contactTop = await contact.evaluate((el) => scrollY + el.getBoundingClientRect().top);
      await scrollTo(page, contactTop);
      await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
      await expect(root).not.toHaveAttribute('data-showroom-handoff');
      await expect(stage).toHaveCSS('opacity', '1');
      await expect(page.getByRole('link', { name: /me@aidenjang.com/ })).toBeInViewport();

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await scrollTo(page, workTop - height * 0.755);
      await expect(root).not.toHaveAttribute('data-showroom-handoff');
      await expect(stage).toHaveCSS('translate', 'none');
      await scrollTo(page, 58);
      await expect(dock).toHaveCSS('opacity', '1');
      await expect(stage).toHaveCSS('opacity', '1');
    });
  });
}
