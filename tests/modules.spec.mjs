import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// The TeraWulf modules against minimal markup, using the built bundle.
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');

// A 40×40 PNG: black square on white, so the dot grid has something to draw.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAAAAACpleexAAAAI0lEQVR4nGP4TyRgGFU4YAoZsIBRhaMKRxXiVogfjCqks0IAowOrjRgTzHYAAAAASUVORK5CYII=',
  'base64',
);

async function setup(page, body, { storage } = {}) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  if (storage) await page.addInitScript((s) => sessionStorage.setItem(s, '1'), storage);
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.endsWith('.png')) return route.fulfill({ contentType: 'image/png', body: png });
    return route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><head><style>${css}</style></head><body>${body}<script>${js}</script></body></html>`,
    });
  });
  await page.goto('https://www.terawulf.test/');
  return errors;
}

const modal = `
  <button data-modal-open>Open</button>
  <div data-modal="site" data-modal-delay="100" style="display:none;position:fixed;inset:0">
    <div data-modal-card><a href="#">Link</a><button data-modal-close>Close</button></div>
  </div>`;

test('session modal auto-opens once per session and closes on Escape', async ({ page }) => {
  const errors = await setup(page, modal);
  const el = page.locator('[data-modal="site"]');
  await expect(el).toHaveClass(/is-open/);
  await expect(page.locator('html')).toHaveClass(/modal-open/);
  await expect(page.locator('[data-modal-close]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(el).not.toHaveClass(/is-open/);
  await expect(el).toBeHidden();
  expect(await page.evaluate(() => sessionStorage.getItem('tw_modal_v1'))).toBe('1');
  expect(errors).toEqual([]);
});

test('session modal stays closed when already seen, but manual open works', async ({ page }) => {
  await setup(page, modal, { storage: 'tw_modal_v1' });
  await page.waitForTimeout(300);
  const el = page.locator('[data-modal="site"]');
  await expect(el).not.toHaveClass(/is-open/);
  await page.click('[data-modal-open]');
  await expect(el).toHaveClass(/is-open/);
});

test('dotted canvas paints a lazy source image without polling', async ({ page }) => {
  const errors = await setup(
    page,
    `<div style="position:relative;width:400px;height:300px">
       <img class="interactive-canvas-image" loading="lazy" src="/map.png" style="position:absolute;inset:0;width:100%;height:100%">
       <canvas data-dotted-canvas=" " width="900" height="560" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
     </div>`,
  );
  await expect(page.locator('img.interactive-canvas-image')).toHaveClass(/is-canvas-painted/);
  const painted = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i]) return true;
    return false;
  });
  expect(painted).toBe(true);
  expect(errors).toEqual([]);
});

test('modules no-op on pages without their markup', async ({ page }) => {
  const errors = await setup(page, '<h1>Plain page</h1>');
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
});
