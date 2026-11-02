// IX2 move harness: production (Webflow IX2) vs staging with Webflow's IX2
// removed and the local dist/ injected. Webflow's IX2 data chunk is blocked
// and the inline start states it publishes are stripped, which is what the
// HTML looks like once the IX2 events are deleted in the Designer.
// Usage: pnpm build && node scripts/ix2-compare.mjs  (screenshots in OUT,
// default ./.motion-compare/ix2). Prints end-state styles side by side.
import { chromium } from '@playwright/test';
import fs from 'fs';
const OUT = process.env.OUT || '.motion-compare/ix2';
const js = fs.readFileSync('dist/index.js', 'utf8'), css = fs.readFileSync('dist/styles.css', 'utf8');
const IX2_CLASSES = ['g-nav-drop-list', 'g-nav-menu-w', 'g-nav-menu-drawer-open', 'g-nav-menu-drawer-close', 'team-card-pop-up', 'home-video-pu', 'deliver-card-center', 'section-stats', 'text-more', 'text-less', 'icon', 'parallax-w'];
const b = await chromium.launch();
async function open(mode, path, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/\.(mp4|webm)(\?|$)/, (r) => r.abort());
  if (mode === 'new') {
    await p.route((u) => u.hostname === 'terawulff.webflow.io', async (r) => {
      if (r.request().resourceType() !== 'document') return r.continue();
      const res = await r.fetch(); let html = await res.text();
      html = html.replace(/<([a-z0-9]+)([^>]*?)\sstyle="[^"]*"([^>]*?class="([^"]*)"[^>]*)>/g, (m, tag, a, rest, cls) => IX2_CLASSES.some((c) => cls.split(' ').includes(c)) ? `<${tag}${a}${rest}>` : m);
      html = html.replace(/<([a-z0-9]+)([^>]*?class="([^"]*)"[^>]*?)\sstyle="[^"]*"([^>]*)>/g, (m, tag, a, cls, rest) => IX2_CLASSES.some((c) => cls.split(' ').includes(c)) ? `<${tag}${a}${rest}>` : m);
      await r.fulfill({ response: res, body: html });
    });
    await p.route(/webflow\.achunk\./, async (r) => { const res = await r.fetch(); const t = await res.text(); if (/eventTypeId:"/.test(t)) return r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }); r.fulfill({ response: res, body: t }); });
    await p.route(/brandvm\.github\.io\/terawulf\/index\.js/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: js }));
    await p.route(/brandvm\.github\.io\/terawulf\/styles\.css/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  }
  await p.goto((mode === 'new' ? 'https://terawulff.webflow.io' : 'https://www.terawulf.com') + path, { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(2500);
  await p.addStyleTag({ content: '#wfc-environment,video{visibility:hidden!important}' });
  return { p, ctx, errs };
}
const style = (sel, i = 0) => (p) => p.evaluate(([sel, i]) => { const e = document.querySelectorAll(sel)[i]; if (!e) return 'missing'; const s = getComputedStyle(e); const r = e.getBoundingClientRect();
  return { disp: s.display, vis: s.visibility, op: (+s.opacity).toFixed(2), h: Math.round(r.height), w: Math.round(r.width), tf: s.transform === 'none' ? (s.scale !== 'none' ? 'scale ' + s.scale : s.rotate !== 'none' ? 'rot ' + s.rotate : s.translate !== 'none' ? 'tr ' + s.translate : 'none') : s.transform.slice(0, 40), filt: s.filter }; }, [sel, i]);
const cases = [
  { name: 'nav-dropdown', path: '/', w: 1440, h: 900, steps: [['click', '.g-nav-drop .w-dropdown-toggle'], ['measure', '.g-nav-drop-list'], ['measure', '.g-nav-drop .icon.is_g-nav-icon'], ['click', '.g-nav-drop .w-dropdown-toggle'], ['measure', '.g-nav-drop-list']] },
  { name: 'mobile-menu', path: '/', w: 390, h: 844, steps: [['click', '.g-nav-menu-drawer'], ['measure', '.g-nav-menu-w'], ['measure', '.g-nav-menu-drawer-close'], ['click', '.g-nav-menu-drawer'], ['measure', '.g-nav-menu-w'], ['measure', '.g-nav-menu-drawer-open']] },
  { name: 'team-popup', path: '/about', w: 1440, h: 900, steps: [['scroll', '.team-card'], ['click', '.team-card'], ['measureVisible', '.team-card-pop-up'], ['clickVisible', '.tpu-pu-close'], ['countVisible', '.team-card-pop-up']] },
  { name: 'video-popup-home', path: '/', w: 1440, h: 900, steps: [['click', '.is_home-video-player'], ['measure', '.home-video-pu'], ['click', '.home-video-pu-close'], ['measure', '.home-video-pu']] },
  { name: 'video-popup-about', path: '/about', w: 1440, h: 900, steps: [['scroll', '.about-intro-visual-w'], ['click', '.about-intro-visual-w'], ['measure', '.home-video-pu'], ['click', '.home-video-pu-close'], ['measure', '.home-video-pu']] },
  { name: 'deliver-card', path: '/our-impact', w: 1440, h: 900, steps: [['scroll', '.deliver-card'], ['measure', '.deliver-card-center'], ['hover', '.deliver-card'], ['measure', '.deliver-card-center'], ['hover', 'h1, .s-page-header'], ['measure', '.deliver-card-center']] },
  { name: 'deliver-card-mobile', path: '/our-impact', w: 390, h: 844, steps: [['scroll', '.deliver-card'], ['measure', '.deliver-card-center']] },
  { name: 'approach', path: '/our-impact', w: 1440, h: 900, steps: [['measure', '.s-approach .parallax-w'], ['scrollMid', '.section.s-approach'], ['measure', '.s-approach .parallax-w'], ['top'], ['measure', '.s-approach .parallax-w']] },
  { name: 'stats-more', path: '/our-sites', w: 1440, h: 900, steps: [['measureFirst', '.section-stats'], ['clickVisible', '.section-stat.is_show-more'], ['measureFirst', '.section-stats'], ['clickVisible', '.section-stat.is_show-more'], ['measureFirst', '.section-stats']] },
  { name: 'stats-more-mobile', path: '/our-sites', w: 390, h: 844, steps: [['measureFirst', '.section-stats'], ['clickVisible', '.section-stat.is_show-more'], ['measureFirst', '.section-stats']] },
];
for (const c of cases) {
  const A = await open('old', c.path, c.w, c.h), B = await open('new', c.path, c.w, c.h); let n = 0;
  console.log(`\n== ${c.name} ${c.w}`);
  for (const [act, sel] of c.steps) {
    const res = [];
    for (const X of [A, B]) {
      const p = X.p;
      if (act === 'click') { await p.locator(sel).first().click(); await p.waitForTimeout(1300); }
      else if (act === 'clickVisible') { await p.locator(sel + ':visible').first().click(); await p.waitForTimeout(1300); }
      else if (act === 'hover') { await p.locator(sel).first().hover(); await p.waitForTimeout(1100); }
      else if (act === 'scroll') { await p.locator(sel).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(600); }
      else if (act === 'scrollMid') { await p.locator(sel).first().evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.3)); await p.waitForTimeout(1600); }
      else if (act === 'top') { await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1600); }
      else if (act === 'measure') res.push(await style(sel)(p));
      else if (act === 'measureFirst') res.push(await style(sel)(p));
      else if (act === 'measureVisible') res.push(await p.evaluate((sel) => { const e = [...document.querySelectorAll(sel)].find((x) => getComputedStyle(x).display !== 'none'); if (!e) return 'none visible'; const s = getComputedStyle(e); return { disp: s.display, op: (+s.opacity).toFixed(2) }; }, sel));
      else if (act === 'countVisible') res.push(await p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((x) => getComputedStyle(x).display !== 'none').length, sel));
    }
    if (res.length) { const same = JSON.stringify(res[0]) === JSON.stringify(res[1]); console.log(`${same ? '  =' : '  ≠'} ${act} ${sel}\n     prod ${JSON.stringify(res[0])}\n     repo ${JSON.stringify(res[1])}`); }
    if (act.startsWith('measure') || act === 'countVisible') { n++; await A.p.screenshot({ path: `${OUT}/${c.name}-${n}-a.png` }); await B.p.screenshot({ path: `${OUT}/${c.name}-${n}-b.png` }); }
  }
  const errs = B.errs.filter((e) => !/Loading chunk/.test(e)); if (errs.length) console.log('  repo errors:', errs.slice(0, 3));
  await A.ctx.close(); await B.ctx.close();
}
await b.close();
