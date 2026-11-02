// Finsweet loader (finsweet-loader.ts) — fetch fs-bundle.js only where needed.
//
// Finsweet v2 is bundled from npm (webflow-build › recipes/finsweet) but kept
// out of index.js: only /news, /careers and article pages use it, and it is
// ~100 KB. When the page has an element of a bundled attribute, this adds
// <script src="<same base as index.js>fs-bundle.js">, so staging, dev and
// each pinned release always load the matching version. Replaces the four
// v1 CDN scripts on /news and /careers and the v2 CDN loader on articles.
// Names only — importing finsweet-registry here would inline all of Finsweet
// into index.js. Keep in step with `pnpm finsweet add/remove` (tests check).
export const FINSWEET_ATTRIBUTES = ['list', 'selectcustom', 'socialshare'];

export function initFinsweetLoader(): void {
  const selector = FINSWEET_ATTRIBUTES
    .map((name) => `[fs-${name}-element]`)
    .join(', ');
  if (!selector || !document.querySelector(selector)) return;
  // Transition guard: while Webflow still has a Finsweet CDN script (v1
  // attributes-* or the v2 loader), that copy owns the page; starting ours too
  // would initialise the same elements twice. Removing those tags is part of
  // the cutover (docs/audit/finsweet-v2-migration.md).
  if (document.querySelector('script[src*="@finsweet/attributes"]')) return;
  const main = Array.from(document.scripts).find((s) => /\/index\.js(\?|$)/.test(s.src));
  if (!main) return;
  const url = new URL('fs-bundle.js', main.src);
  url.search = new URL(main.src).search; // same cache-buster on staging
  const script = document.createElement('script');
  script.src = url.href;
  script.async = true;
  document.body.appendChild(script);
}
