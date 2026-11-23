import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`the examples and F40 study respond to scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.startsWith('webgl')) return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/#sec-work');
    const iodine = page.locator('#project-iodine');
    const recovery = iodine.getByRole('status');
    async function seekScene(id: string, progress: number) {
      await page.locator(id).evaluate((element, amount) => {
        const body = element.querySelector<HTMLElement>('[data-study-pin]')!;
        const travel = (element as HTMLElement).offsetHeight - body.offsetHeight;
        const inset = parseFloat(getComputedStyle(body).top);
        scrollTo({
          top: scrollY + element.getBoundingClientRect().top - inset + travel * amount,
          behavior: 'instant',
        });
      }, progress);
    }
    await seekScene('#project-iodine', 0.62);
    await expect(iodine).toHaveAttribute('data-scene-progress', '0.780');
    await expect(recovery).toHaveText('File restored');
    await seekScene('#project-iodine', 0.49);
    await expect(iodine).toHaveAttribute('data-scene-progress', '0.300');
    await expect(recovery).toHaveText('Agent edit');

    const drawing = page.getByRole('figure', { name: 'Recorded iguess drawing round' });
    await seekScene('.duet', 0.45);
    await expect(drawing.getByRole('status')).toHaveText('Guitar');
    const drawingPin = page.locator('.duet [data-study-pin]');
    expect(
      await drawingPin.evaluate((el) =>
        Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).top)),
      ),
    ).toBeLessThan(2);
    await seekScene('.duet', 0.3);
    await expect(drawing.getByRole('status')).toContainText('A rocket');
    await seekScene('.duet', 0.1);
    await expect(drawing.getByRole('status')).toHaveText('What is it?');
    const room = page.locator('#project-mrrp .bean-window');
    await seekScene('.duet', 0.94);
    await expect(room).toHaveAttribute('data-light', 'morning');
    await seekScene('.duet', 0.71);
    await expect(room).toHaveAttribute('data-light', 'evening');
    const verdict = page.locator('#project-everythingisfine .quake-journey-readings');
    await seekScene('#project-everythingisfine', 0.78);
    const parkedScroll = await page.evaluate(() => scrollY);
    await expect(verdict).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => scrollY)).toBe(parkedScroll);
    const quake = page.locator('#project-everythingisfine');
    async function nudgeSettledReading(progress: number) {
      const settled = await quake.getAttribute('data-study-progress');
      await seekScene('#project-everythingisfine', progress);
      await page.evaluate(
        () =>
          new Promise<void>((done) =>
            requestAnimationFrame(() => requestAnimationFrame(() => done())),
          ),
      );
      expect(await quake.getAttribute('data-study-progress')).toBe(settled);
    }
    await expect(quake).toHaveAttribute('data-study-progress', '0.940');
    await nudgeSettledReading(0.8);
    await nudgeSettledReading(0.82);
    await seekScene('#project-everythingisfine', 0.56);
    await expect(verdict).toHaveCSS('opacity', '0');
    await expect(page.locator('#project-everythingisfine')).toHaveAttribute(
      'data-quake-view',
      'globe',
    );
    await expect(quake).toHaveAttribute('data-study-progress', '0.430');
    await nudgeSettledReading(0.54);
    const track = page.locator('.scroll-film-track');
    const video = track.locator('video');
    const slider = track.getByRole('slider');
    const scroll = (amount: number) =>
      track.evaluate((element, amount) => {
        const travel = element.clientHeight - element.firstElementChild!.clientHeight;
        scrollTo({
          top: scrollY + element.getBoundingClientRect().top + travel * amount,
          behavior: 'instant',
        });
      }, amount);
    await scroll(0);
    await expect(slider).toHaveValue('0');
    const stage = await track.locator('.scroll-film').boundingBox();
    expect(stage!.width).toBeGreaterThanOrEqual(width - 1);
    expect(stage!.height).toBeGreaterThanOrEqual(843);
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.videoWidth))
      .toBe(width === 390 ? 416 : 1152);
    const time = () => video.evaluate((el: HTMLVideoElement) => el.currentTime);
    await scroll(0.82);
    await expect.poll(time).toBeGreaterThan(3.3);
    const beforeFinalTurn = await time();
    expect(beforeFinalTurn).toBeLessThan(3.6);
    await scroll(0.88);
    await expect.poll(time).toBeGreaterThan(beforeFinalTurn + 0.21);
    expect(await time()).toBeLessThan(3.95);
    await scroll(0.95);
    await expect.poll(time).toBeGreaterThan(3.96);
    await expect(video).toBeVisible();
    await expect(track.locator('.finish-detail')).toHaveCount(0);
    await scroll(0.26);
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
      .toBeLessThan(1.5);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(video).not.toHaveAttribute('src', /mp4/);
    await slider.fill('100');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Paint');
    await expect(track.locator('.finish-poster-paint')).toHaveCSS('opacity', '1');

    await expect(recovery).toHaveText('File restored');
    await expect(drawing.getByRole('status')).toHaveText('Guitar');
  });
}
