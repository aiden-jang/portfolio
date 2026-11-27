import { expect, test } from '@playwright/test';
import { captureShowroom } from './showroomFrame';

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
    if (width !== 320) {
      await page.locator('#sec-intro').getByRole('link', { name: 'Featured work' }).click();
      await expect(page.locator('#project-everythingisfine h3')).toBeInViewport();
      await page.screenshot({ path: test.info().outputPath(`projects-${width}.png`) });
      await page.evaluate(() => (location.hash = 'f40-study'));
      await expect(page.getByRole('heading', { name: 'Framing the showroom' })).toBeInViewport();
      await page.screenshot({ path: test.info().outputPath(`about-${width}.png`) });
    }
    await page.evaluate(() => (location.hash = 'sec-contact'));
    await expect(page.locator('.contact-email-link')).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Let’s talk.', exact: true })).toBeAttached();
    await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
    await expect(async () => {
      const { copy, contact, header, email, copyButton, layoutWidth } = await page.evaluate(() => {
        const box = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect().toJSON();
        return {
          copy: box('.contact-copy-block'),
          contact: box('#sec-contact'),
          header: box('.portfolio-header'),
          email: box('.contact-email-link'),
          copyButton: box('.contact-copy'),
          layoutWidth: document.documentElement.clientWidth,
        };
      });
      if (width >= 900) {
        expect(copy.right).toBeLessThan(layoutWidth / 2);
        expect(copy.top - contact.top).toBeCloseTo(Math.max(120, height * 0.17), 0);
      } else {
        expect(Math.abs(copy.left + copy.width / 2 - layoutWidth / 2)).toBeLessThan(2);
        expect(email.top - header.bottom).toBeGreaterThanOrEqual(34);
        expect(email.right).toBeLessThan(copyButton.left);
        expect(copyButton.right).toBeLessThanOrEqual(layoutWidth);
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
      // Use a fresh renderer frame so page chrome cannot affect the pixel measurements.
      const frame = await page.locator('.portfolio-scene canvas').boundingBox();
      const pixels = await captureShowroom(page);
      let outside = 0;
      let carLeft = Infinity;
      let carTop = Infinity;
      for (let y = 0; y < pixels.height; y += 2) {
        for (let x = 0; x < pixels.width; x += 2) {
          const i = (y * pixels.width + x) * 4;
          if (
            pixels.data[i] > 60 &&
            pixels.data[i] > pixels.data[i + 1] * 1.4 &&
            pixels.data[i] > pixels.data[i + 2] * 1.4
          ) {
            const pageX = frame!.x + (x * frame!.width) / pixels.width;
            const pageY = frame!.y + (y * frame!.height) / pixels.height;
            carLeft = Math.min(carLeft, pageX);
            carTop = Math.min(carTop, pageY);
            if (
              pageX < copy!.x ||
              pageX > copy!.x + copy!.width ||
              pageY < copy!.y ||
              pageY > copy!.y + copy!.height
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
