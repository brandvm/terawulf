import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// The loader as pasted into Webflow: comments stripped, REPO and RELEASE
// filled in. Based on wf-template 1.0.0's tests/loader.spec.mjs, adapted to
// TeraWulf's Embed 2a, which pins the release stylesheet (loader.html, 2a).
const source = readFileSync(new URL('../loader.html', import.meta.url), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '').replaceAll('ORG', 'example-org').replaceAll('REPO', 'wf-example');
// Client repos fill REPO (and maybe the org) in, so read them back.
const repo = source.match(/var SITE = "([^"]+)"/)[1];
const org = source.match(/var OWNER = "([^"]+)"/)[1];
if (!source.includes('var RELEASE = null;')) throw new Error('loader.html must ship with `var RELEASE = null;`');
function loader(release, embed = release) {
  // TeraWulf: Embed 2a pins the release stylesheet; a real release keeps it
  // in step with RELEASE (`embed` lets a test leave 2a behind).
  const text = source.replace('var RELEASE = null;', `var RELEASE = ${JSON.stringify(release)};`)
    .replace(/(terawulf|wf-example)@[0-9.]+\/dist\//g, `$1@${embed ?? '0.0.0'}/dist/`);
  return {
    scripts: [...text.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[0]),
    links: [...text.matchAll(/<link\b[^>]*>/g)].map(match => match[0])
      .filter(link => /id="wfc-css/.test(link)).join('\n'),
  };
}
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const stage = `https://${org}.github.io/${repo}/`;
const release = `https://cdn.jsdelivr.net/gh/${org}/${repo}@1.0.0/dist/`;

async function setup(page, {
  url = 'https://example.webflow.io/',
  unavailable = () => false,
  delay = () => 0,
  release = '1.0.0',
  embed = release,
  requests = [],
  consoleErrors = [],
} = {}) {
  const { scripts, links } = loader(release, embed);
  expect(scripts).toHaveLength(3);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  const html = `<!doctype html><html><head>${scripts[0]}</head><body>
    ${links}${scripts[1]}<h1>Example client website</h1>
    ${scripts[2]}</body></html>`;
  await page.route('**/*', async route => {
    const request = route.request();
    if (request.isNavigationRequest()) return route.fulfill({ contentType: 'text/html', body: html });
    if (unavailable(request.url())) return route.abort();
    const wait = delay(request.url());
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    const style = new URL(request.url()).pathname.endsWith('.css');
    return route.fulfill({ contentType: style ? 'text/css' : 'text/javascript', body: style ? css : js });
  });
  await page.goto(url);
  await expect(page.locator('html')).not.toHaveClass(/is-loading/);
  return errors;
}

for (const url of ['https://client.example/', 'https://example.webflow.io/']) test(`public pages never request localhost (${new URL(url).hostname})`, async ({ page }) => {
  const requests = [];
  const errors = await setup(page, { url, requests });
  expect(requests.filter(request => /^https?:\/\/(localhost|127\.0\.0\.1)[:/]/.test(request))).toEqual([]);
  expect(errors).toEqual([]);
});

test('production uses the single RELEASE for both CSS and JS', async ({ page }) => {
  const requests = [];
  await setup(page, { url: 'https://client.example/', requests });
  await expect(page.locator('#wfc-css')).toHaveAttribute('href', release + 'styles.css');
  expect(requests).toContain(release + 'index.js');
  expect(requests.filter(request => request.startsWith(stage))).toEqual([]);
});

test('production downloads the stylesheet once, from the pinned release', async ({ page }) => {
  const requests = [];
  await setup(page, { url: 'https://client.example/', requests });
  // Piece 1's <head> link and Embed 2a carry the same URL: one fetch.
  expect(requests.filter(u => u.includes('styles.css'))).toEqual([release + 'styles.css']);
});

test('production without a RELEASE serves staging and logs an error', async ({ page }) => {
  const requests = [];
  const consoleErrors = [];
  await setup(page, { url: 'https://client.example/', release: null, requests, consoleErrors });
  // Staging changes on every push, so it is cache-busted like on webflow.io.
  await expect(page.locator('#wfc-css')).toHaveAttribute('href', new RegExp('^' + stage + 'styles\\.css\\?v=\\d+$'));
  expect(requests.some(request => request.startsWith(stage + 'index.js'))).toBe(true);
  // 2a's static href is a pinned release, so the preload scanner may still
  // request it; no script may come from jsDelivr.
  expect(requests.filter(request => request.includes('cdn.jsdelivr.net/gh/') && request.endsWith('.js'))).toEqual([]);
  expect(consoleErrors.join('\n')).toContain('RELEASE is not set');
});

test('staging swaps 2a to one cache-busted staging stylesheet', async ({ page }) => {
  const requests = [];
  const errors = await setup(page, { requests });
  await expect(page.locator('#wfc-css')).toHaveAttribute('href', new RegExp('^' + stage + 'styles\\.css\\?v=\\d{5,}$'));
  await expect(page.locator('link[rel=stylesheet]')).toHaveCount(1);
  // 2b and the footer share WFC.v: one staging request, not two.
  expect(requests.filter(request => request.startsWith(stage + 'styles.css'))).toHaveLength(1);
  expect(requests.some(request => request.startsWith(stage + 'index.js'))).toBe(true);
  expect(errors).toEqual([]);
});

test('the Designer custom-code preview counts as staging', async ({ page }) => {
  const requests = [];
  await setup(page, { url: 'https://example.canvas.webflow.com/', requests });
  expect(await page.evaluate(() => window.WFC.staging)).toBe(true);
  expect(requests.some(request => request.startsWith(stage + 'index.js'))).toBe(true);
});

test('a staging bundle that fails to load falls back to the pinned release', async ({ page }) => {
  const errors = await setup(page, { unavailable: url => url.startsWith(stage) && url.includes('index.js') });
  expect(await page.evaluate(() => window.WFC.source)).toBe(release);
  await expect(page.locator('#wfc-css')).toHaveAttribute('href', release + 'styles.css');
  expect(errors).toEqual([]);
});

test('the old ?wfc-dev=1 flag does nothing', async ({ page }) => {
  const requests = [];
  await setup(page, { url: 'https://example.webflow.io/?wfc-dev=1', requests });
  expect(await page.evaluate(() => window.WFC.source)).toBe(stage);
  expect(await page.evaluate(() => 'dev' in window.WFC || 'devBase' in window.WFC)).toBe(false);
  expect(requests.filter(request => request.includes('localhost'))).toEqual([]);
});

for (const [url, origin] of [['https://example.webflow.io/', new URL(stage).origin], ['https://client.example/', 'https://cdn.jsdelivr.net']])
  test(`head code preconnects to the bundle's origin (${new URL(url).hostname})`, async ({ page }) => {
    await setup(page, { url });
    await expect(page.locator('link[rel=preconnect]')).toHaveCount(2);
    for (const href of await page.locator('link[rel=preconnect]').evaluateAll(links => links.map(link => link.href)))
      expect(new URL(href).origin).toBe(origin);
  });

test('on a release domain, the release stylesheet is in <head> and holds first paint', async ({ page }) => {
  const requests = [];
  // The release answers after 1 s: the page must not paint before it (the
  // sheet scales the type, §01), and GitHub Pages is never asked.
  await setup(page, {
    url: 'https://client.example/', requests,
    delay: url => url === release + 'styles.css' ? 1000 : 0,
  });
  const fcp = () => page.evaluate(() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime);
  await expect.poll(fcp).toBeGreaterThan(0);
  const paint = await fcp();
  const loaded = await page.evaluate(href => performance.getEntriesByName(href)[0]?.responseEnd, release + 'styles.css');
  expect(loaded).toBeGreaterThan(900);
  expect(paint).toBeGreaterThanOrEqual(loaded);
  await expect(page.locator('head link[rel=stylesheet]')).toHaveAttribute('href', release + 'styles.css');
  for (const href of await page.locator('link[rel=stylesheet]').evaluateAll(links => links.map(link => link.href)))
    expect(href).toBe(release + 'styles.css');
  expect(requests.filter(request => request.startsWith(stage))).toEqual([]);
});

test('on a release domain, a failed release stylesheet moves 2a to staging and keeps it there', async ({ page }) => {
  // jsDelivr down or blocked: the page keeps the repo CSS from GitHub Pages.
  await setup(page, { url: 'https://client.example/', unavailable: url => url === release + 'styles.css' });
  await expect(page.locator('#wfc-css')).toHaveAttribute('href', stage + 'styles.css');
  await expect.poll(() => page.evaluate(() => Boolean(document.getElementById('wfc-css').sheet))).toBe(true);
  // The footer loader must not point it back at the failed release.
  await page.waitForTimeout(300);
  await expect(page.locator('#wfc-css')).toHaveAttribute('href', stage + 'styles.css');
});

test('a 2a left on an older release is re-pointed and logged', async ({ page }) => {
  const consoleErrors = [];
  await setup(page, { url: 'https://client.example/', embed: '0.9.0', consoleErrors });
  await expect(page.locator('#wfc-css')).toHaveAttribute('href', release + 'styles.css');
  expect(consoleErrors.join('\n')).toContain('update 2a');
});

test('the scroll lock is released when the bundle cannot load', async ({ page }) => {
  await setup(page, { url: 'https://client.example/', unavailable: url => url.endsWith('index.js') });
});

test('no scroll lock: the page can scroll before the bundle boots', async ({ page }) => {
  const { scripts } = loader('1.0.0');
  await page.setContent(`<!doctype html><html><head>${scripts[0]}</head><body style="height:5000px"></body></html>`);
  await expect(page.locator('html')).not.toHaveClass(/is-loading/);
});
