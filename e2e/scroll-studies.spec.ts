import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`timed demos and scroll studies keep their states at ${width}px`, async ({ page }) => {
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
    function place(selector: string, offset: number) {
      return page.locator(selector).evaluate((element, top) => {
        scrollTo({
          top: scrollY + element.getBoundingClientRect().top - innerHeight * top,
          behavior: 'instant',
        });
      }, offset);
    }
    await place('.orbit-feature', 0.2);
    await expect(page.getByRole('button', { name: 'Retry globe', exact: true })).toBeVisible();
    await expect(recovery).toHaveText('Agent edit');
    await place('#project-iodine', 0.1);
    const parkedEditor = await page.evaluate(() => scrollY);
    await expect(recovery).toHaveText('Edit undone');
    await expect(iodine.locator('video')).toHaveCount(0);
    await expect(recovery).toHaveText('Agent edit');
    await expect(recovery).toHaveText('Edit undone');
    expect(await page.evaluate(() => scrollY)).toBe(parkedEditor);

    const batch = page.locator('.batching-spread');
    await seekScene('.batch-lane', 0.25);
    const position = () => batch.evaluate((el) => Number(el.getAttribute('data-pulse')));
    await expect.poll(position).toBeGreaterThan(0.25);
    const partialBatch = await position();
    // Wait longer than the former settle animation to catch a diagram that still moves at rest.
    await page.waitForTimeout(460);
    expect(await position()).toBe(partialBatch);
    await seekScene('.batch-lane', 0.08);
    await expect.poll(position).toBeLessThan(partialBatch);

    const garden = page.locator('#project-bloomnote');
    await place('#project-bloomnote .bloom-garden-plot', 0.4);
    const parkedGarden = await page.evaluate(() => scrollY);
    await expect(garden).toHaveAttribute('data-study-progress', '1.000');
    expect(await page.evaluate(() => scrollY)).toBe(parkedGarden);
    await place('#project-bloomnote .bloom-garden-plot', 0.6);
    await expect(garden).toHaveAttribute('data-study-progress', '1.000');

    const drawing = page.getByRole('figure', { name: 'Interactive cat drawing round' });
    await seekScene('.duet', 0.19);
    await expect(drawing.getByRole('status')).toHaveText('Cat');
    const drawingPin = page.locator('.duet [data-study-pin]');
    expect(
      await drawingPin.evaluate((el) =>
        Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).top)),
      ),
    ).toBeLessThan(2);
    const parkedDrawing = await page.evaluate(() => scrollY);
    await expect(drawing.getByRole('status')).toHaveText('What is it?');
    await expect(drawing.getByRole('status')).toHaveText('Two ears…');
    await expect(drawing.getByRole('status')).toHaveText('Cat');
    expect(await page.evaluate(() => scrollY)).toBe(parkedDrawing);
    const room = page.locator('#project-mrrp .bean-window');
    await seekScene('.duet', 0.99);
    await expect(room).toHaveAttribute('data-light', 'morning');
    await seekScene('.duet', 0.83);
    await expect(room).toHaveAttribute('data-light', 'evening');
    const quake = page.locator('#project-everythingisfine');
    const verdict = quake.getByRole('complementary', { name: 'Recorded Kamchatka depth readings' });
    await place('#sec-work', 0);
    const parkedScroll = await page.evaluate(() => scrollY);
    await expect(verdict).toHaveCSS('opacity', '1');
    await expect(verdict).toContainText('54.7 km');
    await expect(verdict).toContainText('71.0 km');
    expect(await page.evaluate(() => scrollY)).toBe(parkedScroll);
    await place('#sec-work', 0.8);
    await expect(verdict).toBeHidden();

    await place('#project-iodine', 0.11);
    await expect(recovery).toHaveText('Edit undone');
    await expect(iodine.getByRole('link', { name: 'Read the iodine case study' })).toHaveAttribute(
      'href',
      /edit=restored/,
    );

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
    if (width === 390) {
      const frames = track.locator('canvas');
      await expect(frames).toBeVisible();
      await expect(frames).toHaveCSS('animation-name', 'none');
      await expect(video).not.toHaveAttribute('src', /mp4/);
      const image = () => frames.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
      const clay = await image();
      await scroll(0.57);
      await expect(slider).toHaveValue('54');
      await expect.poll(image).not.toBe(clay);
      const mid = await image();
      await slider.fill('70');
      await expect(slider).toHaveValue('70');
      await scroll(0.95);
      await expect(slider).toHaveValue('100');
      await expect.poll(image).not.toBe(mid);
      await scroll(0);
      await expect(slider).toHaveValue('0');
      await expect.poll(image).toBe(clay);
    } else {
      await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.videoWidth)).toBe(1440);
      const filmProgress = () =>
        video.evaluate((el: HTMLVideoElement) => el.currentTime / el.duration);
      await scroll(0.82);
      await expect.poll(filmProgress).toBeGreaterThan(0.83);
      const beforeFinalTurn = await filmProgress();
      expect(beforeFinalTurn).toBeLessThan(0.89);
      await scroll(0.88);
      await expect.poll(filmProgress).toBeGreaterThan(beforeFinalTurn + 0.055);
      expect(await filmProgress()).toBeLessThan(0.96);
      await expect(video).toBeVisible();
      await scroll(0.95);
      await expect
        .poll(() => video.evaluate((el: HTMLVideoElement) => el.duration - el.currentTime))
        .toBeLessThan(0.06);
      await scroll(0.26);
      await expect.poll(filmProgress).toBeLessThan(0.16);
    }
    await expect(track.locator('.finish-detail')).toHaveCount(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(video).not.toHaveAttribute('src', /mp4/);
    await expect(track.locator('canvas')).toBeHidden();
    await slider.fill('100');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Paint');
    await expect(track.locator('.finish-poster-paint')).toHaveCSS('opacity', '1');

    await place('#project-iodine .recovery', 0.22);
    await expect(recovery).toHaveText('Edit undone');
    await expect(iodine.locator('video')).toHaveCount(0);
    await expect(garden.locator('.bloom-garden-plant img').first()).toHaveCSS('clip-path', 'none');
    await expect(drawing.getByRole('status')).toHaveText('Cat');
  });
}
