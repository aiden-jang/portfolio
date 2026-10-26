import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
]) {
  test(`Contact centers its copy over a visible car at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    await page.goto('/');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await page.screenshot({ path: test.info().outputPath(`intro-${width}.png`) });
    const jump = async (name: string) => {
      if (width < 768) {
        await page.locator('.portfolio-menu summary').click();
        await page
          .getByRole('navigation', { name: 'Mobile navigation' })
          .getByRole('link', { name, exact: true })
          .click();
      } else await page.locator('#nav').getByRole('link', { name, exact: true }).click();
    };
    if (width !== 320) {
      await jump('Projects');
      await expect(page.locator('#sec-work h2')).toBeInViewport();
      await page.screenshot({ path: test.info().outputPath(`projects-${width}.png`) });
      await jump('About');
      await expect(page.locator('#sec-about h2')).toBeInViewport();
      await page.screenshot({ path: test.info().outputPath(`about-${width}.png`) });
    }
    await jump('Contact');
    await expect(page.locator('#sec-contact h2')).toBeInViewport();
    await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
    await expect(async () => {
      const copy = await page.locator('#sec-contact .panel').boundingBox();
      // Classic scrollbars reserve layout space that viewportSize includes.
      const layoutWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(Math.abs(copy!.x + copy!.width / 2 - layoutWidth / 2)).toBeLessThan(2);
      expect(Math.abs(copy!.y + copy!.height / 2 - height / 2)).toBeLessThan(2);
    }).toPass({ timeout: 5000 });
    const copy = await page.locator('#sec-contact .panel').boundingBox();
    const header = await page.locator('.portfolio-header').boundingBox();
    const footer = await page.locator('.contact-footer').boundingBox();
    expect(copy!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    expect(copy!.y + copy!.height).toBeLessThan(footer!.y);
    await expect(page.getByRole('link', { name: 'me@aidenjang.com' })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Copy email address' })).toBeInViewport();

    await expect(async () => {
      const bytes = await page.screenshot({ timeout: 5000 });
      const pixels = PNG.sync.read(bytes);
      let outside = 0;
      for (let y = 0; y < pixels.height; y += 2) {
        for (let x = 0; x < pixels.width; x += 2) {
          const i = (y * pixels.width + x) * 4;
          if (
            pixels.data[i] > 60 &&
            pixels.data[i] > pixels.data[i + 1] * 1.4 &&
            pixels.data[i] > pixels.data[i + 2] * 1.4
          ) {
            if (
              x < copy!.x ||
              x > copy!.x + copy!.width ||
              y < copy!.y ||
              y > copy!.y + copy!.height
            )
              outside++;
          }
        }
      }
      expect(outside, 'the red car remains visible outside the text area').toBeGreaterThan(500);
    }).toPass({ timeout: 20_000 });
    await page.screenshot({ path: test.info().outputPath(`contact-${width}.png`) });
  });
}
