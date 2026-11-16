import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
]) {
  test(`Contact separates its copy and fixed car at ${width}px`, async ({ page }) => {
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
      const copy = await page.locator('.contact-copy-block').boundingBox();
      // Classic scrollbars reserve layout space that viewportSize includes.
      const layoutWidth = await page.evaluate(() => document.documentElement.clientWidth);
      if (width >= 900) {
        expect(copy!.x + copy!.width).toBeLessThan(layoutWidth / 2);
        expect(Math.abs(copy!.y + copy!.height / 2 - height / 2)).toBeLessThan(2);
      } else {
        expect(Math.abs(copy!.x + copy!.width / 2 - layoutWidth / 2)).toBeLessThan(2);
        const contact = await page.locator('#sec-contact').boundingBox();
        expect(copy!.y - contact!.y).toBeCloseTo(112, 0);
      }
    }).toPass({ timeout: 5000 });
    const copy = await page.locator('.contact-copy-block').boundingBox();
    const header = await page.locator('.portfolio-header').boundingBox();
    const footer = await page.locator('.contact-footer').boundingBox();
    expect(copy!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    expect(copy!.y + copy!.height).toBeLessThan(footer!.y);
    await expect(page.getByRole('link', { name: 'me@aidenjang.com' })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Copy email address' })).toBeInViewport();
    await expect(
      page.locator('.contact-policy-links').getByRole('link', { name: 'Privacy' }),
    ).toHaveAttribute('href', /\/privacy#legal-cookies-and-analytics$/);
    await expect(
      page.locator('.contact-policy-links').getByRole('link', { name: 'Terms' }),
    ).toHaveCount(0);

    await expect(async () => {
      const bytes = await page.screenshot({ timeout: 5000 });
      const pixels = PNG.sync.read(bytes);
      let outside = 0;
      let carLeft = pixels.width;
      let carTop = pixels.height;
      for (let y = 0; y < pixels.height; y += 2) {
        for (let x = 0; x < pixels.width; x += 2) {
          const i = (y * pixels.width + x) * 4;
          if (
            pixels.data[i] > 60 &&
            pixels.data[i] > pixels.data[i + 1] * 1.4 &&
            pixels.data[i] > pixels.data[i + 2] * 1.4
          ) {
            carLeft = Math.min(carLeft, x);
            carTop = Math.min(carTop, y);
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
      if (width >= 900) expect(carLeft).toBeGreaterThan(copy!.x + copy!.width + 8);
      else expect(carTop).toBeGreaterThan(copy!.y + copy!.height + 8);
    }).toPass({ timeout: 20_000 });
    await page.screenshot({ path: test.info().outputPath(`contact-${width}.png`) });
    await page.getByRole('link', { name: 'Privacy', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: /3D model credits/ })).toBeInViewport();
    if (width < 900)
      await expect(page.locator('.portfolio-header')).not.toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
    await page.screenshot({ path: test.info().outputPath(`contact-footer-${width}.png`) });
    await page.getByRole('button', { name: 'Copy email address' }).focus();
    await expect(async () => {
      const focused = await page.getByRole('button', { name: 'Copy email address' }).boundingBox();
      const banner = await page.locator('.portfolio-header').boundingBox();
      expect(focused!.y).toBeGreaterThanOrEqual(banner!.y + banner!.height);
    }).toPass({ timeout: 5000 });
  });
}
