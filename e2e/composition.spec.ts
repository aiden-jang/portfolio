import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
]) {
  test(`Contact gives its copy clear space beside the car at ${width}px`, async ({ page }) => {
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
    const copy = await page.locator('#sec-contact .panel').boundingBox();
    const header = await page.locator('.portfolio-header').boundingBox();
    expect(copy!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    if (width >= 768) expect(copy!.x + copy!.width).toBeLessThan(width * 0.45);
    else expect(copy!.y + copy!.height).toBeLessThan(height < 740 ? 350 : 420);

    await expect(async () => {
      const bytes = await page.screenshot({ timeout: 5000 });
      const pixels = PNG.sync.read(bytes);
      let inside = 0;
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
              x >= copy!.x &&
              x <= copy!.x + copy!.width &&
              y >= copy!.y &&
              y <= copy!.y + copy!.height
            )
              inside++;
            else outside++;
          }
        }
      }
      expect(outside, 'the red car remains visible outside the text area').toBeGreaterThan(500);
      expect(inside, 'the car does not run behind the contact copy').toBeLessThan(50);
    }).toPass({ timeout: 20_000 });
    await page.screenshot({ path: test.info().outputPath(`contact-${width}.png`) });
  });
}
