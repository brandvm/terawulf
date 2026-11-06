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

test('autoplay refused (Low Power Mode): starts on the first tap, not before', async ({ page }) => {
  const refuse = () => {
    window.__allow = false; window.__played = 0;
    HTMLMediaElement.prototype.play = function () {
      if (!window.__allow) return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
      window.__played++; return Promise.resolve();
    };
  };
  const errors = await setup(page, bgVideo('top'), { init: refuse });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__played)).toBe(0);
  await page.evaluate(() => { window.__allow = true; });
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await expect.poll(() => page.evaluate(() => window.__played)).toBe(1);
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  expect(await page.evaluate(() => window.__played)).toBe(1);
  expect(errors).toEqual([]);
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

test('finsweet loader names match the bundled registry', () => {
  const loader = readFileSync(new URL('../src/modules/finsweet-loader.ts', import.meta.url), 'utf8');
  const registry = readFileSync(new URL('../src/modules/finsweet-registry.ts', import.meta.url), 'utf8');
  const names = JSON.parse(loader.match(/FINSWEET_ATTRIBUTES = (\[[^\]]*\])/)[1].replace(/'/g, '"')).sort();
  const bundled = [...registry.matchAll(/^\s+(\w+): \(\) => import/gm)].map((m) => m[1]).sort();
  expect(names).toEqual(bundled);
});

test('finsweet bundle loads only where an attribute is used', async ({ page }) => {
  const requested = [];
  page.on('request', (r) => { if (r.url().includes('fs-bundle.js')) requested.push(r.url()); });
  await setup(page, '<p>No Finsweet here</p>');
  await page.waitForTimeout(200);
  expect(requested).toEqual([]);
});

test('finsweet bundle stays off while a Finsweet CDN script is on the page', async ({ page }) => {
  const requested = [];
  page.on('request', (r) => { if (r.url().includes('fs-bundle.js')) requested.push(r.url()); });
  await setup(page, '<div fs-selectcustom-element="dropdown"></div><script src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-selectcustom@1/selectcustom.js"></script>');
  await page.waitForTimeout(200);
  expect(requested).toEqual([]);
});

test('bundled GSAP plugins never register on Webflow\'s window.gsap', async ({ page }) => {
  // Stand-in for Webflow's GSAP while IX3 is still on.
  const stub = () => {
    window.__registered = 0;
    window.gsap = { version: 'webflow', registerPlugin: () => { window.__registered++; } };
  };
  const errors = await setup(page, '<p>Page</p>', { init: stub });
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__registered)).toBe(0);
  expect(await page.evaluate(() => window.gsap.version)).toBe('webflow');
  expect(await page.evaluate(() => 'ScrollTrigger' in window || '__wfcGsap' in window)).toBe(false);
  expect(errors).toEqual([]);
});

// About image overlays as Webflow publishes them (Designer style: absolute,
// full height, no width), one in the first screen and one far below.
const overlays = (wid = '') => `
  <style>.image-overlay{position:absolute;inset:0 0 auto auto;height:100%;background:#fff}</style>
  <div id="near" style="position:relative;width:400px;height:300px"><img src="/a.png"><div ${wid} class="image-overlay is_left"></div></div>
  <div style="height:3000px"></div>
  <div id="far" style="position:relative;width:400px;height:300px"><img src="/b.png"><div class="image-overlay is_left"></div></div>`;
const overlayWidth = (page, id) => page.locator(`#${id} .image-overlay`).evaluate((el) => el.getBoundingClientRect().width);

test('image overlay wipe: covers each image, then wipes it once in view (IX2 e-19 timing)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors = await setup(page, overlays());
  await expect(page.locator('#far .image-overlay')).toHaveAttribute('data-wipe', 'armed');
  expect(await overlayWidth(page, 'far')).toBe(400);
  expect(await page.locator('#far .image-overlay').evaluate((el) => getComputedStyle(el).transition))
    .toContain('width 2s cubic-bezier(0.64, 0.05, 0, 1)');
  await expect(page.locator('#near .image-overlay')).toHaveAttribute('data-wipe', 'done');
  await expect.poll(() => overlayWidth(page, 'near'), { timeout: 4000 }).toBe(0);
  await page.locator('#far').scrollIntoViewIfNeeded();
  await expect(page.locator('#far .image-overlay')).toHaveAttribute('data-wipe', 'done');
  await expect.poll(() => overlayWidth(page, 'far'), { timeout: 4000 }).toBe(0);
  expect(errors).toEqual([]);
});

test('image overlay wipe: stays off while the IX2 event is still published', async ({ page }) => {
  await setup(page, overlays('data-w-id="6529e6da-ebda-ec47-5d22-502f4eace32d"'));
  await page.waitForTimeout(200);
  expect(await page.locator('.image-overlay[data-wipe]').count()).toBe(0);
});

test('image overlay wipe: reduced motion leaves the images uncovered', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page, overlays());
  await page.waitForTimeout(200);
  expect(await page.locator('.image-overlay[data-wipe]').count()).toBe(0);
  expect(await overlayWidth(page, 'far')).toBe(0);
});

test('motion: split text pieces are inline blocks and block lines, as IX3 wrote them', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // About page id, so the page-scoped "Wulf Section" line reveal applies too.
  const errors = await setup(page, `<script>document.documentElement.setAttribute('data-wf-page','69ceb1e6dace149b16d5387b')</script>
    <h2 data-gsap="text-animate" style="font-size:29px">Energy first infrastructure</h2>
    <div style="height:2000px"></div>
    <section class="section s-wulf-value"><div class="wulf-value-left"><p>Power secured campuses built for scale and long term growth</p></div></section>
    <div style="height:2000px"></div>`);
  await expect.poll(() => page.locator('.gsap_split_letter').count()).toBeGreaterThan(0);
  const style = (sel) => page.locator(sel).first().evaluate((e) => [getComputedStyle(e).display, getComputedStyle(e).position]);
  expect(await style('.gsap_split_word')).toEqual(['inline-block', 'relative']);
  expect(await style('.gsap_split_letter')).toEqual(['inline-block', 'relative']);
  await page.locator('.s-wulf-value').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('[class*="gsap_split_line"]').count()).toBeGreaterThan(0);
  expect(await style('.gsap_split_line-mask')).toEqual(['block', 'relative']);
  expect(await style('.wulf-value-left .gsap_split_line:not([class*="mask"])')).toEqual(['block', 'relative']);
  expect(errors).toEqual([]);
});

test('motion: a heading inside a line reveal is split first and stays one heading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // The section is in range at load, its h2 only later: the line reveal
  // must still split the h2 first (as IX3 did) instead of cutting it in two.
  const errors = await setup(page, `<script>document.documentElement.setAttribute('data-wf-page','69ceb1e6dace149b16d5387b')</script>
    <div style="height:1000px"></div>
    <section class="section s-wulf-value"><div class="wulf-value-left">
      <div style="height:1900px"></div>
      <div><h2 data-gsap="text-animate" style="font-size:29px;width:200px">Unmatched Energy Expertise</h2></div>
    </div></section>
    <div style="height:2000px"></div>`);
  await expect.poll(() => page.locator('[class*="gsap_split_line"]').count()).toBeGreaterThan(0);
  await page.locator('h2').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(await page.locator('h2').count()).toBe(1);
  expect(await page.locator('h2').first().textContent()).toContain('Unmatched Energy Expertise');
  expect(errors).toEqual([]);
});

// ---- Webflow IX2 replacements (nav, menu, pop-ups, hover, approach, stats).
// Designer styles these modules rely on, as published.
const ix2Css = `<style>
  .g-nav-drop-list{display:none;overflow:hidden}.g-nav-drop-list.w--open{display:block}
  @media (max-width:991px){.g-nav-menu-w{display:none;max-height:50vh;overflow:scroll}}
  .g-nav-menu-drawer-close{display:none}
  .team-card-pop-up{display:none;position:fixed;inset:0}
  .home-video-pu{display:none;position:fixed;inset:0}
  .deliver-card{display:flex;position:relative;height:200px}.deliver-card-center{display:none;position:absolute;pointer-events:none}
  .section-stats{overflow:hidden;height:auto}
</style>`;
// Stand-in for Webflow's IX2 store with the given event selectors.
const webflowIx2 = (selectors) => `window.Webflow={require:(m)=>m==='ix2'?{store:{getState:()=>({ixData:{events:Object.fromEntries(${JSON.stringify(selectors)}.map((s,i)=>['e-'+i,{target:{selector:s}}]))}})}}:undefined};`;

test('ix2: nav dropdown animates open and stays shown while it closes', async ({ page }) => {
  const errors = await setup(page, ix2Css + `<div class="g-nav-drop"><div class="w-dropdown-toggle"><svg class="icon is_g-nav-icon" width="10" height="10"></svg>About</div>
    <nav class="g-nav-drop-list"><a href="#">One</a><a href="#">Two</a></nav></div>`);
  const list = page.locator('.g-nav-drop-list');
  await expect(page.locator('.g-nav-drop')).toHaveAttribute('data-wfc-dropdown', '');
  await page.evaluate(() => document.querySelectorAll('.w-dropdown-toggle, .g-nav-drop-list').forEach((e) => e.classList.add('w--open')));
  await expect.poll(() => list.evaluate((e) => e.getAnimations().length)).toBe(1);
  await expect.poll(() => page.locator('.icon').evaluate((e) => getComputedStyle(e).rotate), { timeout: 3000 }).toBe('135deg');
  await page.evaluate(() => document.querySelectorAll('.w--open').forEach((e) => e.classList.remove('w--open')));
  await expect(list).toHaveAttribute('data-wfc-closing', '');
  expect(await list.evaluate((e) => getComputedStyle(e).display)).toBe('block');
  await expect(list).not.toHaveAttribute('data-wfc-closing', /.*/, { timeout: 3000 });
  await expect(list).toBeHidden();
  expect(errors).toEqual([]);
});

test('ix2: mobile menu opens and closes with aria-expanded and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await setup(page, ix2Css + `<a href="#" class="g-nav-menu-drawer" aria-label="Menu"><div class="g-nav-menu-drawer-open">=</div><div class="g-nav-menu-drawer-close">x</div></a>
    <div class="g-nav-menu-w"><a href="/about">About</a></div>`);
  const drawer = page.locator('.g-nav-menu-drawer'), menu = page.locator('.g-nav-menu-w');
  await expect(drawer).toHaveAttribute('aria-expanded', 'false');
  await drawer.click();
  await expect(drawer).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  await expect(page.locator('.g-nav-menu-drawer-close')).toBeVisible();
  await expect(page.locator('.g-nav-menu-drawer-open')).toBeHidden();
  expect(await drawer.getAttribute('aria-controls')).toBe(await menu.getAttribute('id'));
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden({ timeout: 3000 });
  await expect(drawer).toBeFocused();
  expect(page.url()).not.toContain('#');
  expect(errors).toEqual([]);
});

test('ix2: team pop-up opens from its card (also after being moved), focus and Escape', async ({ page }) => {
  const errors = await setup(page, ix2Css + `<div class="wrap"><div class="team-card"><div class="team-card-info">Jane Doe</div></div>
    <div class="team-card-pop-up"><div class="tpu-pu-close">x</div><p>Bio one</p></div></div>
    <div class="wrap"><div class="team-card"><div class="team-card-info">John Roe</div></div></div>
    <div class="team-card-pop-up" id="moved"><div class="tpu-pu-close">x</div><p>Bio two</p></div>`);
  const cards = page.locator('.team-card');
  await expect(cards.nth(1)).toHaveAttribute('role', 'button');
  await cards.nth(1).click();
  await expect(page.locator('#moved')).toBeVisible();
  await expect(page.locator('#moved')).toHaveAttribute('aria-label', 'John Roe');
  await expect(page.locator('#moved .tpu-pu-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#moved')).toBeHidden({ timeout: 3000 });
  await expect(cards.nth(1)).toBeFocused();
  await cards.nth(0).click();
  await expect(page.locator('.wrap .team-card-pop-up')).toBeVisible();
  await page.locator('.wrap .tpu-pu-close').click();
  await expect(page.locator('.wrap .team-card-pop-up')).toBeHidden({ timeout: 3000 });
  expect(errors).toEqual([]);
});

test('ix2: video pop-up shows on its trigger and hides on close', async ({ page }) => {
  const errors = await setup(page, ix2Css + `<a href="#" class="button-link is_home-video-player">Watch</a>
    <div class="home-video-pu" data-popup-video-w><video data-popup-video><source src="https://cdn.example/v.mp4"></video><div class="home-video-pu-close" data-popup-video-close>x</div></div>`, { init: spyMedia });
  const pu = page.locator('.home-video-pu');
  await page.waitForTimeout(200);
  await page.click('.is_home-video-player');
  await expect(pu).toBeVisible();
  await expect.poll(() => pu.evaluate((e) => +getComputedStyle(e).opacity), { timeout: 3000 }).toBe(1);
  await page.click('.home-video-pu-close');
  await expect(pu).toBeHidden({ timeout: 3000 });
  expect(errors).toEqual([]);
});

test('ix2: Deliver Card centre shows on hover and keyboard focus (768 px and up)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors = await setup(page, ix2Css + `<a href="#" class="deliver-card"><div class="deliver-card-center">image</div><p>Text</p></a><p id="away">Away</p>`);
  const center = page.locator('.deliver-card-center');
  await expect(page.locator('.deliver-card')).toHaveAttribute('data-wfc-hover', '');
  await expect(center).toBeHidden();
  await page.hover('.deliver-card');
  await expect.poll(() => center.evaluate((e) => +getComputedStyle(e).opacity), { timeout: 3000 }).toBe(1);
  await page.hover('#away');
  await expect(center).toBeHidden({ timeout: 3000 });
  await page.focus('.deliver-card');
  await expect(center).toBeVisible({ timeout: 3000 });
  expect(errors).toEqual([]);
});

test('ix2: approach section zooms in view and resets out of view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors = await setup(page, `<div style="height:2000px"></div><section class="section s-approach" style="height:600px;overflow:hidden"><div class="parallax-w" style="height:100%"></div></section><div style="height:2000px"></div>`);
  const s = page.locator('.s-approach');
  await expect(s).not.toHaveAttribute('data-wfc-in', /.*/);
  await s.evaluate((e) => window.scrollTo(0, e.offsetTop - 200));
  await expect(s).toHaveAttribute('data-wfc-in', '');
  await expect.poll(() => page.locator('.parallax-w').evaluate((e) => getComputedStyle(e).scale), { timeout: 3000 }).toBe('1.2');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(s).not.toHaveAttribute('data-wfc-in', /.*/);
  expect(errors).toEqual([]);
});

test('ix2: stats "show more" starts collapsed, expands and collapses', async ({ page }) => {
  const errors = await setup(page, ix2Css + `<div class="section-stats"><div style="height:60px">Row</div>
    <a href="#" class="section-stat link-underline is_show-more"><span class="text-more">More</span><span class="text-less">Less</span></a>
    <div style="height:300px">More rows</div></div>`);
  const panel = page.locator('.section-stats'), btn = page.locator('.is_show-more');
  expect(await panel.evaluate((e) => e.getBoundingClientRect().height)).toBe(80);
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => panel.evaluate((e) => Math.round(e.getBoundingClientRect().height)), { timeout: 3000 }).toBeGreaterThan(300);
  await btn.click();
  await expect.poll(() => panel.evaluate((e) => Math.round(e.getBoundingClientRect().height)), { timeout: 3000 }).toBe(80);
  expect(page.url()).not.toContain('#');
  expect(errors).toEqual([]);
});

test('ix2: every replacement stays off while Webflow IX2 still runs it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const live = ['.g-nav-drop', '.g-nav-menu-drawer', '.team-card', '.tpu-pu-close', '.deliver-card', '.section.s-approach', '.section-stat.link-underline.is_show-more', '.button-link.is_home-video-player', '.about-intro-visual-w', '.home-video-pu-close'];
  const errors = await setup(page, `<script>${webflowIx2(live)}</script>` + ix2Css + `
    <div class="g-nav-drop"><nav class="g-nav-drop-list"></nav></div>
    <a href="#x" class="g-nav-menu-drawer">M</a><div class="g-nav-menu-w">menu</div>
    <div class="team-card">c</div><div class="team-card-pop-up"></div>
    <div class="deliver-card"><div class="deliver-card-center"></div></div>
    <section class="section s-approach"><div class="parallax-w"></div></section>
    <div class="section-stats"><a href="#y" class="section-stat link-underline is_show-more">m</a></div>`);
  await page.waitForTimeout(300);
  const marks = await page.evaluate(() => document.querySelectorAll('[data-wfc-dropdown],[data-wfc-hover],[data-wfc-scale],[aria-expanded],[role="dialog"]').length);
  expect(marks).toBe(0);
  await page.click('.g-nav-menu-drawer');
  await expect(page.locator('.g-nav-menu-w')).toBeHidden();
  expect(errors).toEqual([]);
});
