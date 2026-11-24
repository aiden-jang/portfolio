import { expect, test } from '@playwright/test';
for (const width of [1440, 390]) {
  test(`room reveal follows a scroll nudge without jumping at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const duet = page.locator('.duet');
    const seek = (progress: number) =>
      duet.evaluate((stage, amount) => {
        const pin = stage.querySelector<HTMLElement>('[data-study-pin]')!;
        const travel = (stage as HTMLElement).offsetHeight - pin.offsetHeight;
        scrollTo({
          top:
            scrollY +
            stage.getBoundingClientRect().top -
            parseFloat(getComputedStyle(pin).top) +
            travel * amount,
          behavior: 'instant',
        });
      }, progress);
    await seek(0.6);
    await expect(duet).toHaveAttribute('data-duet-progress', '0.53');
    const step = duet.evaluate(async (stage) => {
      const room = stage.querySelector<HTMLElement>('#project-mrrp')!;
      const radius = () => parseFloat(room.style.getPropertyValue('--iris'));
      let previous = radius();
      let largest = 0;
      const end = performance.now() + 400;
      do {
        await new Promise(requestAnimationFrame);
        const current = radius();
        largest = Math.max(largest, Math.abs(current - previous));
        previous = current;
      } while (performance.now() < end);
      return largest / radius();
    });
    await seek(0.665);
    expect(await step).toBeLessThan(0.28);
    await expect(duet).toHaveAttribute('data-duet-progress', '0.75');
    await seek(0.52);
    await expect(duet.locator('#project-mrrp')).toHaveAttribute('inert', '');
  });

  test(`Bean's visible controls work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/#project-mrrp', { waitUntil: 'domcontentloaded' });
    const room = page.locator('#project-mrrp');
    const controls = room.getByRole('group', { name: 'Spend a moment with Bean' });
    const status = room.getByRole('status');
    await controls.getByRole('button', { name: 'Pet', exact: true }).click();
    await expect(status).toHaveText('Bean leans in and gives you a little mrrp.');
    await controls.getByRole('button', { name: 'Toy mouse' }).click();
    await expect(status).toHaveText('Bean crouches and pounces on the toy mouse.');
    const box = controls.getByRole('button', { name: 'Box', exact: true });
    await box.click();
    await expect(box).toHaveAttribute('aria-pressed', 'true');
  });

  test(`project interactions preserve their examples and navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/#sec-work');
    const globe = page.locator('.orbit-feature');
    await page.getByRole('button', { name: 'Explore globe', exact: true }).click();
    await expect(globe).toHaveAttribute('data-globe-phase', 'ready', { timeout: 60000 });
    await page.locator('.orbit-preview').hover();
    await page.getByRole('button', { name: 'Show Kamchatka', exact: true }).click();
    const link = page.getByRole('link', { name: 'Open this event' });
    await expect(link).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Selected earthquake' })).toContainText(
      /[A-Z][a-z]{2} \d{1,2}, 20\d{2}/,
    );
    await expect(link).toHaveAccessibleDescription('Opens in a new tab');
    const url = new URL((await link.getAttribute('href'))!);
    expect(url.hostname).toBe('meanwhile.aidenjang.com');
    expect(new URLSearchParams(url.hash.slice(1)).get('e')).toMatch(/^usgs:/);
    await page.getByRole('button', { name: 'Close event details' }).click();
    const canvas = page.locator('#globe-view');
    await canvas.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Explore globe', exact: true })).toBeFocused();
    await expect(canvas).toHaveCount(0);
    const iodine = page.locator('#project-iodine');
    await expect(iodine.getByRole('status')).toHaveText('Edit undone');
    await expect(iodine.getByRole('button', { name: /^(Undo|Replay) edit$/ })).toHaveCount(0);
    const room = page.locator('#project-mrrp');
    await room.locator('.bean-window').scrollIntoViewIfNeeded();
    await room.getByRole('button', { name: 'Pet Bean', exact: true }).click();
    await expect(room.getByRole('img', { name: /Bean’s room/ })).toBeVisible();
    await expect(room.getByRole('status')).toHaveText('Bean leans in and gives you a little mrrp.');
    await room.getByRole('button', { name: 'Play with the toy mouse' }).press('Enter');
    await expect(room.getByRole('status')).toHaveText(
      'Bean crouches and pounces on the toy mouse.',
    );
    const box = room.getByRole('button', { name: 'Cardboard box' });
    await box.click();
    await expect(box).toHaveAttribute('aria-pressed', 'true');
    await expect(room.getByRole('status')).toHaveText(
      'Bean hides in the box, then peeks over the edge.',
    );
    await box.press('Enter');
    await expect(box).toHaveAttribute('aria-pressed', 'false');
    await room.getByRole('button', { name: 'Sit together' }).click();
    await expect(room.getByRole('button', { name: 'Sit together' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await room.getByRole('button', { name: 'Morning light' }).click();
    await expect(room.getByRole('status')).toHaveText('Morning in Bean’s room.');
    const bloomnote = page.locator('#project-bloomnote');
    await expect(bloomnote.getByRole('blockquote')).toContainText('For that brilliant laugh');
    await bloomnote.getByRole('button', { name: 'Anemone' }).click();
    await expect(bloomnote.getByRole('blockquote')).toContainText('tide journal');
    await bloomnote.getByRole('button', { name: 'Gerbera' }).press('Enter');
    await expect(bloomnote.getByRole('blockquote')).toContainText('For that brilliant laugh');
    const garden = bloomnote.getByRole('button', { name: 'View full garden' });
    await garden.click();
    await expect(page.getByRole('dialog', { name: 'bloomnote screenshot' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(garden).toBeFocused();
    const worth = page.getByRole('button', { name: 'Inspect screenshot: worth', exact: true });
    await expect(worth.locator('img').last()).toHaveAttribute(
      'src',
      '/projects/worth-verdict.webp',
    );
    await worth.click();
    await expect(
      page.getByRole('dialog', { name: 'worth screenshot' }).getByRole('img'),
    ).toHaveAttribute('src', '/projects/worth.jpg');
    await page.keyboard.press('Escape');
    await expect(worth).toBeFocused();

    const drawing = page.getByRole('figure', { name: 'Recorded iguess drawing round' });
    await expect(drawing.getByRole('status')).toHaveText('Guitar');
    await page.getByRole('button', { name: 'How I built it: iguess', exact: true }).click();
    await page.getByRole('button', { name: 'Follow the flow' }).click();
    await expect(page.locator('.flow-explanation')).toContainText('AI Worker');
    const hash = new URL(page.url()).hash;
    await page.getByRole('button', { name: 'Draw', exact: true }).press('ArrowRight');
    expect(new URL(page.url()).hash).toBe(hash);
    await page.keyboard.press('Escape');
    await expect(page.locator('.work-modal-panel')).toHaveCount(0);
    for (const [project, first, second, asset] of [
      ['platform', 'Choose an app', 'Already signed in', 'platform-app'],
    ] as const) {
      const card = page.locator(`#project-${project}`);
      await card.getByText('View screenshots', { exact: true }).click();
      const step = card.getByRole('button', { name: second, exact: true });
      await expect(card.getByRole('button', { name: first, exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await step.click();
      await expect(step).toHaveAttribute('aria-pressed', 'true');
      const trigger = card.getByRole('button', { name: `Inspect screenshot: ${second}` });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: `${project} screenshot` });
      const image = dialog.getByRole('img');
      await expect(image).toHaveAttribute('src', `/projects/${asset}.webp`);
      await expect
        .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth))
        .toBeGreaterThan(0);
      await dialog.getByRole('button', { name: 'Previous', exact: false }).click();
      await expect(dialog.getByText(`1 / 2 · ${first}`)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
    await expect(
      page.locator(':is(.project-featured-group, #sec-more-work) article[id^="project-"]'),
    ).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`showcase-${width}.png`) });
  });
}
test('globe waits for featured work and a failed start keeps the preview and retry', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const assets: string[] = [];
  page.on('request', (r) => {
    if (/globe-engine|globe-geography|atlas-events/.test(r.url())) assets.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('#sec-intro h1')).toBeVisible();
  expect(assets).toEqual([]);
  await page.route('**/projects/globe-geography.bin.gz', (r) =>
    r.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.locator('.orbit-preview').scrollIntoViewIfNeeded();
  await expect(page.locator('.orbit-feature')).toHaveAttribute('data-globe-phase', 'error', {
    timeout: 60000,
  });
  await expect(page.locator('.orbit-feature .screenshot-image')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry globe', exact: true })).toBeVisible();
  await page.unroute('**/projects/globe-geography.bin.gz');
  await page.getByRole('button', { name: 'Retry globe', exact: true }).click();
  await expect(page.locator('.orbit-feature')).toHaveAttribute('data-globe-phase', 'ready', {
    timeout: 60000,
  });
  await expect(page.getByRole('button', { name: 'Resume rotation' })).toBeVisible();
});
