// Motion comparison harness (B6): production with IX3 vs staging with IX3
// blocked and the local dist/ injected (?wfc-motion=1), screenshots at matched
// scroll positions. Usage: pnpm build && node scripts/motion-compare.mjs [paths…]
// Output: scratch dir in OUT env (default ./.motion-compare). Then compare
// pairs with ffmpeg ssim. Remove the IX3 gate style and gsap tags only;
// Webflow's inline IX3 start styles are NOT removed (known gap on mobile).
import { chromium } from '@playwright/test';
import fs from 'fs';
const js = fs.readFileSync('dist/index.js','utf8'), css = fs.readFileSync('dist/styles.css','utf8');
const b = await chromium.launch();
async function open(mode, p, w, h) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} }); const pg = await ctx.newPage(); const errs=[];
  pg.on('pageerror', e=>errs.push(e.message));
  await pg.route(/\.(mp4|webm)(\?|$)/, r=>r.abort());
  if (mode==='new') {
    await pg.route(u=>u.hostname==='terawulff.webflow.io', async r => { if (r.request().resourceType()!=='document') return r.continue(); const res = await r.fetch(); let html = await res.text();
      html = html.replace(/<style>[^<]*w-mod-ix3[^<]*<\/style>/g,'').replace(/<script[^>]*gsap\/3\.15\.0[^>]*><\/script>/g,'');
      await r.fulfill({ response: res, body: html }); });
    await pg.route(/webflow\.achunk\./, async r => { const res = await r.fetch(); const t = await res.text(); if (/ScrollTrigger|scrollTriggerConfig|"i-[0-9a-f]{8}"|gsap/.test(t)) return r.fulfill({status:200, contentType:'application/javascript', body:''}); r.fulfill({response:res, body:t}); });
    await pg.route(/brandvm\.github\.io\/terawulf\/index\.js/, r=>r.fulfill({status:200, contentType:'application/javascript', body:js}));
    await pg.route(/brandvm\.github\.io\/terawulf\/styles\.css/, r=>r.fulfill({status:200, contentType:'text/css', body:css}));
  }
  const url = mode==='new' ? 'https://terawulff.webflow.io'+p+'?wfc-motion=1&wfc-dev=0' : 'https://www.terawulf.com'+p;
  await pg.goto(url, {waitUntil:'load', timeout:90000}); await pg.waitForTimeout(4000);
  await pg.addStyleTag({content:'#wfc-environment,canvas,video{visibility:hidden!important}'});
  return {pg, ctx, errs};
}
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['/','/about','/our-operations','/our-expertise','/our-impact','/news'];
for (const [w,h] of [[1440,900],[390,844]]) for (const p of pages) {
  const A = await open('old',p,w,h), B = await open('new',p,w,h);
  const H = await A.pg.evaluate(()=>document.documentElement.scrollHeight);
  const info = await B.pg.evaluate(()=>({ix3:document.documentElement.classList.contains('w-mod-ix3'), wgsap: typeof window.gsap}));
  const rows=[];
  for (let y=0; y<H-h; y+=Math.round(h*0.8)) {
    for (const X of [A,B]) { await X.pg.evaluate(y=>window.scrollTo(0,y), y); }
    await A.pg.waitForTimeout(2600); await B.pg.waitForTimeout(200);
    const fa=(process.env.OUT||'.motion-compare')+'/'+w+(p.replace(/\//g,'_')||'_')+'-'+y+'-a.png', fb=fa.replace('-a.png','-b.png');
    await A.pg.screenshot({path:fa}); await B.pg.screenshot({path:fb}); rows.push([y,fa,fb]);
  }
  fs.writeFileSync((process.env.OUT||'.motion-compare')+'/'+w+(p.replace(/\//g,'_')||'_')+'.json', JSON.stringify(rows));
  console.log(w,p,'positions',rows.length,'new-mode', JSON.stringify(info), 'errors', B.errs.slice(0,3).join(' | ').slice(0,300));
  await A.ctx.close(); await B.ctx.close();
}
await b.close();
