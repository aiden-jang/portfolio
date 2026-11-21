import { expect, test } from '@playwright/test';
for (const width of [1440, 390]) {
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
    const code = iodine.locator('.iodine-evidence-line');
    const editedLine = await code.boundingBox();
    await expect(code).toContainText('.trim()');
    await iodine.getByRole('button', { name: 'Undo edit', exact: true }).press('Enter');
    await expect(code).not.toContainText('.trim()');
    await expect(iodine.getByText('Revert feedback queued', { exact: true })).toBeVisible();
    const restoredLine = await code.boundingBox();
    expect(restoredLine!.x).toBeCloseTo(editedLine!.x);
    const replay = iodine.getByRole('button', { name: 'Replay edit', exact: true });
    await expect(replay).toBeFocused();
    await replay.press('Enter');
    await expect(code).toContainText('.trim()');
    const approvals = iodine.getByRole('region', { name: 'What an approval covers' });
    await expect(approvals).toContainText('ls src/components');
    await expect(approvals).toContainText('Approval reused');
    await approvals.getByRole('button', { name: 'Outside scope' }).click();
    await expect(approvals).toContainText('ls docs');
    await expect(approvals).toContainText('Fresh approval needed');
    const screenshot = iodine.getByRole('button', { name: 'Inspect editor detail for iodine' });
    await expect(iodine.locator('.iodine-editor-tile img')).toHaveAttribute(
      'src',
      '/projects/iodine.png',
    );
    await screenshot.press('Enter');
    const editor = page.getByRole('dialog', { name: 'iodine screenshot', exact: true });
    await expect(editor.getByRole('button', { name: 'Close screenshot' })).toBeFocused();
    await expect(editor.getByRole('img')).toHaveAttribute('src', '/projects/iodine.png');
    const editorViewport = editor.getByRole('region', { name: 'iodine screenshot image' });
    await expect.poll(() => editorViewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(170);
    await editor.getByRole('button', { name: 'Fit image', exact: true }).click();
    await expect(editor.getByRole('button', { name: 'Zoom in', exact: true })).toBeVisible();
    await expect.poll(() => editorViewport.evaluate((el) => el.scrollTop)).toBe(0);
    await page.keyboard.press('Escape');
    await expect(screenshot).toBeFocused();
    await page.getByRole('button', { name: 'Pet Bean', exact: true }).click();
    await expect(page.locator('.bean-response')).toHaveText('mrrp.');
    await expect(page.locator('.bean-cameo img')).toHaveJSProperty('complete', true);
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
    const play = drawing.getByRole('button', { name: 'Play round' });
    const canvasBefore = drawing.locator('canvas');
    const startingFrame = await canvasBefore.evaluate((canvas) =>
      (canvas as HTMLCanvasElement).toDataURL(),
    );
    await play.click();
    await expect(drawing.getByText('The guess', { exact: true })).toBeVisible();
    await expect(drawing.getByText('A rocket. With reservations.', { exact: false })).toBeVisible();
    await expect
      .poll(() => canvasBefore.evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL()))
      .not.toBe(startingFrame);
    const reveal = drawing.getByRole('button', { name: 'Reveal word' });
    await expect(drawing.getByText('guitar', { exact: true })).toBeHidden();
    await reveal.click();
    await expect(drawing.getByText('guitar', { exact: true })).toBeVisible();
    const drawingScreenshot = drawing.getByRole('button', { name: 'Inspect screenshot: iguess' });
    await drawingScreenshot.click();
    await expect(page.getByRole('dialog', { name: 'iguess screenshot' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawingScreenshot).toBeFocused();
    await page.getByRole('button', { name: 'How I built it: iguess', exact: true }).click();
    await page.getByRole('button', { name: 'Follow the flow' }).click();
    await expect(page.locator('.flow-explanation')).toContainText('AI Worker');
    const hash = new URL(page.url()).hash;
    await page.getByRole('button', { name: 'Draw', exact: true }).press('ArrowRight');
    expect(new URL(page.url()).hash).toBe(hash);
    await page.keyboard.press('Escape');
    await expect(page.locator('.work-modal-panel')).toHaveCount(0);
    for (const [project, first, second, asset] of [
      ['wherever', 'Cast a vote', 'Dinner is handled', 'wherever-winner'],
      ['platform', 'Choose an app', 'Already signed in', 'platform-app'],
    ] as const) {
      const card = page.locator(`#project-${project}`);
      const step = card.getByRole('button', { name: second, exact: true });
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
    ).toHaveCount(9);
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
    if (/globe-engine|globe-geography|orbit-snapshot/.test(r.url())) assets.push(r.url());
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
