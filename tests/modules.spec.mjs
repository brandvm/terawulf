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

async function setup(page, body, { storage, path = '/', init } = {}) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  if (storage) await page.addInitScript((s) => sessionStorage.setItem(s, '1'), storage);
  if (init) await page.addInitScript(init);
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.endsWith('.png')) return route.fulfill({ contentType: 'image/png', body: png });
    if (/\.(mp4|webm)$/.test(url)) return route.fulfill({ contentType: 'video/mp4', body: '' });
    return route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><head><style>${css}</style></head><body>${body}<script>${js}</script></body></html>`,
    });
  });
  await page.goto('https://www.terawulf.test' + path);
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

// Records play()/pause() calls without needing a decodable video file.
const spyMedia = () => {
  window.__media = [];
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { get() { return !this.__playing; } });
  HTMLMediaElement.prototype.play = function () { this.__playing = true; window.__media.push(['play', this.className, this.muted]); return Promise.resolve(); };
  HTMLMediaElement.prototype.pause = function () { this.__playing = false; window.__media.push(['pause', this.className]); this.dispatchEvent(new Event('pause')); };
};

const popup = (trigger) => `
  ${trigger}
  <div data-popup-video-w style="display:none">
    <video loop playsinline data-popup-video controls class="home-hero-video">
      <source src="https://cdn.example/popup.mp4" type="video/mp4">
    </video>
    <div data-popup-video-close>Close</div>
  </div>`;

for (const [page_, trigger] of [
  ['Home', '<a href="#" class="button-link is_home-video-player">Watch</a>'],
  ['About/Careers', '<div class="about-intro-visual-w">Watch</div>'],
]) {
  test(`popup video (${page_}): no source until clicked, then plays unmuted from the start`, async ({ page }) => {
    const errors = await setup(page, popup(trigger), { init: spyMedia });
    const source = page.locator('[data-popup-video] source');
    await expect(source).not.toHaveAttribute('src', /./);
    expect(await page.locator('[data-popup-video]').evaluate((v) => v.preload)).toBe('none');
    await page.click('.is_home-video-player, .about-intro-visual-w');
    await expect(source).toHaveAttribute('src', 'https://cdn.example/popup.mp4');
    expect(await page.evaluate(() => window.__media)).toContainEqual(['play', 'home-hero-video', false]);
    expect(page.url()).not.toContain('#');
    await page.evaluate(() => document.querySelector('[data-popup-video-close]').click());
    expect(await page.evaluate(() => window.__media.at(-1)[0])).toBe('pause');
    expect(errors).toEqual([]);
  });
}

const bgVideo = (id) => `
  <div class="w-background-video" id="${id}" style="height:400px">
    <video autoplay loop muted playsinline><source src="https://cdn.example/${id}.mp4"></video>
  </div>`;

test('autoplay videos below the first screen load only when scrolled near, and pause off screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors = await setup(page, bgVideo('top') + '<div style="height:3000px"></div>' + bgVideo('far'), { init: spyMedia });
  await expect(page.locator('#top source')).toHaveAttribute('src', /top\.mp4/);
  await expect(page.locator('#far source')).not.toHaveAttribute('src', /./);
  await page.evaluate(() => { window.__media = []; document.getElementById('far').scrollIntoView(); });
  await expect(page.locator('#far source')).toHaveAttribute('src', /far\.mp4/);
  await expect.poll(() => page.evaluate(() => window.__media.map((m) => m[0]))).toContain('play');
  await expect.poll(() => page.evaluate(() => window.__media.filter((m) => m[0] === 'pause').length)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('reduced motion: autoplay videos stay paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page, bgVideo('top'), { init: spyMedia });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__media.some((m) => m[0] === 'play'))).toBe(false);
  expect(await page.locator('#top video').evaluate((v) => v.autoplay)).toBe(false);
});

test('a visitor pause is respected (no auto-resume)', async ({ page }) => {
  await setup(page, bgVideo('top'));
  await page.waitForTimeout(300);
  await page.evaluate(() => { const v = document.querySelector('#top video'); v.dispatchEvent(new Event('pause')); window.__resumed = 0; v.play = () => { window.__resumed++; return Promise.resolve(); }; });
  await page.evaluate(() => window.scrollTo(0, 5000));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__resumed)).toBe(0);
});

test('dotted canvas waits until it is near the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await setup(page, `<div style="height:4000px"></div>
    <div style="position:relative;width:400px;height:300px">
      <img class="interactive-canvas-image" src="/map.png" style="position:absolute;inset:0;width:100%;height:100%">
      <canvas data-dotted-canvas style="position:absolute;inset:0;width:100%;height:100%"></canvas>
    </div>`);
  await page.waitForTimeout(300);
  await expect(page.locator('img.interactive-canvas-image')).not.toHaveClass(/is-canvas-painted/);
  await page.evaluate(() => document.querySelector('canvas').scrollIntoView());
  await expect(page.locator('img.interactive-canvas-image')).toHaveClass(/is-canvas-painted/);
});

test('/our-operations reloads only when a Webflow breakpoint is crossed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await setup(page, '<h1>Ops</h1>', { path: '/our-operations' });
  await page.evaluate(() => { window.__marker = 1; });
  await page.setViewportSize({ width: 1440, height: 600 }); // height only (mobile address bar)
  await page.setViewportSize({ width: 1100, height: 600 }); // same desktop breakpoint
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.__marker)).toBe(1);
  await page.setViewportSize({ width: 900, height: 600 }); // crosses 991px
  await expect.poll(() => page.evaluate(() => window.__marker)).toBeUndefined();
});

test('other pages never reload on resize', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await setup(page, '<h1>About</h1>', { path: '/about' });
  await page.evaluate(() => { window.__marker = 1; });
  await page.setViewportSize({ width: 400, height: 800 });
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.__marker)).toBe(1);
});

for (const path of ['/about', '/our-sites']) {
  test(`${path}: lands on the #anchor after load`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = await setup(page, '<div style="height:3000px"></div><h2 id="team">Team</h2><div style="height:3000px"></div>', { path: path + '#team' });
    await expect.poll(() => page.evaluate(() => Math.round(document.getElementById('team').getBoundingClientRect().top))).toBeLessThan(50);
    expect(errors).toEqual([]);
  });
}

test('no hash: no scroll, no console error', async ({ page }) => {
  const errors = await setup(page, '<h1>Plain</h1>', { path: '/about' });
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(errors).toEqual([]);
});

test('popup video: keyboard and screen-reader support', async ({ page }) => {
  await setup(page, popup('<div class="about-intro-visual-w">Preview</div>').replace('<div data-popup-video-close>Close</div>', '<div data-popup-video-close></div>'), { init: spyMedia });
  const trigger = page.locator('.about-intro-visual-w');
  await expect(trigger).toHaveAttribute('role', 'button');
  await expect(trigger).toHaveAttribute('tabindex', '0');
  const close = page.locator('[data-popup-video-close]');
  await expect(close).toHaveAttribute('role', 'button');
  await expect(close).toHaveAttribute('aria-label', 'Close video');
  await expect(page.locator('[data-popup-video-w]')).toHaveAttribute('role', 'dialog');
  await trigger.focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.__media.some((m) => m[0] === 'play'))).toBe(true);
  // Webflow's interaction would show it; simulate, then Escape closes it and focus returns
  await page.evaluate(() => { document.querySelector('[data-popup-video-w]').style.display = 'block'; });
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.__media.at(-1)[0])).toBe('pause');
  await expect(trigger).toBeFocused();
});

test('popup video: a trigger that wraps a Play link is not made a second button', async ({ page }) => {
  await setup(page, popup('<div class="about-intro-visual-w"><a href="#" class="is_about-video-player">Play</a></div>'), { init: spyMedia });
  await expect(page.locator('.about-intro-visual-w')).not.toHaveAttribute('role', 'button');
  await page.locator('.is_about-video-player').focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.__media.some((m) => m[0] === 'play'))).toBe(true);
  expect(page.url()).not.toContain('#');
});

test('session modal: dialog semantics and keyboard close', async ({ page }) => {
  await setup(page, modal.replace('<button data-modal-close>Close</button>', '<h2>Notice</h2><div data-modal-close></div>'));
  const el = page.locator('[data-modal="site"]');
  await expect(el).toHaveAttribute('role', 'dialog');
  await expect(el).toHaveAttribute('aria-modal', 'true');
  await expect(el).toHaveAttribute('aria-labelledby', 'wfc-modal-title');
  await expect(el).toHaveClass(/is-open/);
  const close = page.locator('[data-modal-close]');
  await expect(close).toHaveAttribute('aria-label', 'Close');
  await expect(close).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(el).not.toHaveClass(/is-open/);
});

test('dotted canvas: reduced motion keeps the dots still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page, `<div style="position:relative;width:400px;height:300px">
      <img class="interactive-canvas-image" src="/map.png" style="position:absolute;inset:0;width:100%;height:100%">
      <canvas data-dotted-canvas style="position:absolute;inset:0;width:100%;height:100%"></canvas></div>`);
  await expect(page.locator('img.interactive-canvas-image')).toHaveClass(/is-canvas-painted/);
  const snap = () => page.evaluate(() => document.querySelector('canvas').toDataURL());
  const before = await snap();
  await page.mouse.move(50, 50); await page.mouse.move(350, 250, { steps: 10 });
  await page.waitForTimeout(100);
  expect(await snap()).toBe(before);
});

// play()/pause() stubs: the test videos have no media, so fake the state and
// fire the same events a real element would.
const fakeMedia = () => {
  const paused = new WeakMap();
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get() { return paused.has(this) ? paused.get(this) : true; },
  });
  HTMLMediaElement.prototype.play = function () {
    paused.set(this, false); this.dispatchEvent(new Event('play')); return Promise.resolve();
  };
  HTMLMediaElement.prototype.pause = function () {
    if (paused.get(this) === false) { paused.set(this, true); this.dispatchEvent(new Event('pause')); }
  };
};

const hero = `
  <section style="position:relative;height:100vh">
    <video autoplay muted loop playsinline><source src="/hero.mp4" type="video/mp4"></video>
    <button type="button" data-video-toggle><i class="ph-bold ph-pause" aria-hidden="true"></i></button>
  </section>
  <video data-popup-video><source src="/popup.mp4"></video>`;

test('video toggle: pauses and plays the hero video, label and icon follow, pause sticks', async ({ page }) => {
  const errors = await setup(page, hero, { init: fakeMedia });
  const btn = page.locator('[data-video-toggle]');
  const icon = btn.locator('i');
  await expect(btn).toHaveAttribute('aria-label', 'Pause background video'); // playing (autoplay module)
  await expect(icon).toHaveClass(/ph-pause/);
  await btn.click();
  await expect(btn).toHaveAttribute('aria-label', 'Play background video');
  await expect(icon).toHaveClass(/ph-play/);
  expect(await page.evaluate(() => document.querySelector('section video').paused)).toBe(true);
  expect(await page.evaluate(() => document.querySelector('[data-popup-video]').paused)).toBe(true);
  // A visitor pause is never auto-resumed when the video scrolls back in.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await expect(btn).toHaveAttribute('aria-label', 'Play background video');
  await btn.press('Enter');
  await expect(btn).toHaveAttribute('aria-label', 'Pause background video');
  expect(errors).toEqual([]);
});

test('video toggle: reduced motion starts paused with a Play label', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page, hero, { init: fakeMedia });
  await expect(page.locator('[data-video-toggle]')).toHaveAttribute('aria-label', 'Play background video');
});
