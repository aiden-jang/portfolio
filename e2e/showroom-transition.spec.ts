import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function scrollTo(page: Page, top: number) {
  return page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

for (const width of [1440, 390]) {
  test.describe(`showroom motion at ${width}px`, () => {
    test.use({
      viewport: { width, height: 900 },
      hasTouch: width < 768,
      reducedMotion: 'no-preference',
    });

    test('the dock clears before the stage dims and Contact fades in on arrival', async ({
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
      const glow = () =>
        contact.evaluate((element) => getComputedStyle(element, '::after').opacity);
      const opacityInRange = (selector: string, min: number, max: number) =>
        page.evaluate(
          ({ selector, min, max }) => {
            const element = document.querySelector(selector);
            if (!element) return false;
            const opacity = Number(getComputedStyle(element).opacity);
            return opacity > min && opacity < max;
          },
          { selector, min, max },
        );

      await expect(dock).toBeVisible();
      await expect(dock).toHaveCSS('opacity', '1');
      await scrollTo(page, 58);
      await expect.poll(() => opacityInRange(dockSelector, 0.15, 0.85)).toBe(true);
      await expect(stage).toHaveCSS('opacity', '1');

      await scrollTo(page, 320);
      await expect(dock).toBeHidden();
      await expect.poll(() => opacityInRange('.portfolio-scene', 0.2, 0.95)).toBe(true);
      await scrollTo(page, 0);
      await expect(dock).toBeVisible();
      await expect(dock).toHaveCSS('opacity', '1');

      const contactTop = await contact.evaluate(
        (element) => element.getBoundingClientRect().top + scrollY,
      );
      await scrollTo(page, contactTop - 720);
      await expect.poll(() => opacityInRange('.portfolio-scene', 0.05, 0.6)).toBe(true);
      await expect.poll(glow).toBe('0');

      await scrollTo(page, contactTop);
      await expect(stage).toHaveCSS('opacity', '1');
      await expect.poll(glow).toBe('1');
      await expect(page.getByRole('link', { name: /me@aidenjang.com/ })).toBeInViewport();

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect
        .poll(() => contact.evaluate((element) => getComputedStyle(element, '::after').content))
        .toBe('none');
      await scrollTo(page, 58);
      await expect(dock).toHaveCSS('opacity', '1');
      await expect(stage).toHaveCSS('opacity', '1');
    });
  });
}
