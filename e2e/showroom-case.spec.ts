import { expect, test } from '@playwright/test';
import { recordings } from '../src/showroomCase/recordings';

for (const width of [1440, 390]) {
  test(`Showroom case plays and scrubs the recording at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const phone = width < 768;
    const current = phone ? recordings.phone : recordings.desktop;
    const other = phone ? 'desktop' : 'phone';
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    await page.route('**/*.glb', (route) => route.abort());
    await page.goto('/cases/showroom/');
    await expect(page).toHaveURL(/\/cases\/showroom\/$/);
    await expect(page.getByRole('heading', { name: 'Building the showroom' })).toBeVisible();
    const slider = page.getByRole('slider', { name: 'Scrub from poster to drag' });
    await expect(slider).toBeEnabled();
    const video = page.locator('video');
    await expect(video).toHaveJSProperty('videoWidth', current.width);
    const chapter = (name: string) => page.getByRole('button', { name, exact: true });
    await chapter('First 3D frame').click();
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
      .toBeCloseTo(current.live, 1);
    await expect(chapter('First 3D frame')).toHaveAttribute('aria-current', 'true');
    await chapter('First drag').click();
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
      .toBeGreaterThan(current.dragEnd);
    await expect(chapter('First drag')).toHaveAttribute('aria-current', 'true');
    await slider.focus();
    await slider.press('Home');
    await expect(chapter('Poster')).toHaveAttribute('aria-current', 'true');
    await slider.press('ArrowRight');
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(0);

    const slow = chapter('Slow-load replay');
    await slow.click();
    await expect(slow).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
      .toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Pause replay' }).click();
    await chapter('Poster').click();
    await expect(video).toHaveJSProperty('currentTime', 0);
    await expect(page.locator('#caption')).toContainText('3.3 seconds');

    await page.route(`**/showroom/case/${other}.mp4`, (route) => route.abort(), { times: 1 });
    await chapter(phone ? 'Desktop' : 'Phone').click();
    await expect(slider).toBeDisabled();
    await chapter('Retry').click();
    await expect(slider).toBeEnabled();
    await expect(video).toHaveJSProperty('videoWidth', recordings[other].width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}
