# Batch 6: icons and accessibility

Webflow part staged on terawulff.webflow.io on 2026-10-09; production is
unchanged until "publish". The icon part ships as repo release **v1.3.0**
(needs merge + tag + Embed 2a edit, below).

## A. Accessibility (Webflow, staged)

| Where | Change | axe rule fixed |
| --- | --- | --- |
| G \| Footer (component, all pages) | `aria-label` on the 4 social icon links: "TeraWulf on Instagram / LinkedIn / YouTube / X" | link-name (88 hits) |
| G \| Navigation (component) | Mobile menu button `aria-label="Menu"` | link-name |
| G \| Navigation (component) | **Skip link** "Skip to main content" → `#main`, first focusable element; class `G \| Skip Link` (Designer class: fixed, off-screen, `:focus` slides it in, brand navy `#112135`) | WCAG 2.4.1 |
| Every page | `id="main"` on `G \| Main W`; **News: `G \| Main W` was a `div`, now `main`** | landmark |
| Nav Resources menu, Home, News, Resources template | `Resources \| Main` card wrappers were `<main>` → `div` (News had 17 `main`, articles 8, every page 2) | landmark-one-main / no-duplicate |
| Home, News (CMS lists) | Card overlay links `aria-label` bound to the CMS **Title** | link-name (38) |
| Connect | Labels wired to fields (`for` was empty on all 6): Full-Name, Company, Phone, Email, Reason-for-Inquiry, Message; email + 4 social icon links named | select-name (critical), link-name |
| Resources template | Share buttons named ("Share on X / Facebook / LinkedIn / Pinterest", "Share by email"). All five were tested and work | link-name |

Verified on staging: axe `link-name`, `select-name`, `label` clean on 11
pages × 2 widths, except the footer CTA buttons (34) whose text IX3
SplitText hides — fixed by B6. One `main` per page with `id="main"`;
first Tab shows the skip link, Enter jumps to `#main`. Screenshots vs
current production: same heights and card counts, SSIM ≥ 0.998.

404 uses its own header (no G | Navigation), so it has no skip link.

Not in this batch:
- **Hero video pause control** (WCAG 2.2.2): adds a visible button to the
  approved hero design → needs a design decision.
- aria-prohibited-attr / colour-contrast / aria-hidden-focus: all from IX3
  SplitText (aria-label on divs, words measured mid-fade) → B6.

## B. Phosphor icons (repo, release v1.3.0)

Before: three render-blocking CDN stylesheets on every page (regular, light,
bold: ~250 KB CSS) + two full icon fonts (~300 KB). Light was never used.

After: the 13 glyphs the site uses, subset into two fonts (1.3 KB + 0.8 KB),
inlined in `dist/styles.css` (esbuild `.woff2` → dataurl). Rules copied from
`@phosphor-icons/web@2.1.1`; families renamed `wfc-phosphor(-bold)`.
Pixel-identical to the CDN version for all 13 icons (isolated 2× test);
Phosphor requests per page 5 → 0 (route-injected test on production pages).

Icons in use — regular: magnifying-glass, x, list, youtube-logo, x-logo,
linkedin-logo, instagram-logo; bold: arrow-right, arrow-up-right,
calendar-dots, x, play, caret-down.

### Adding an icon later

1. Find its codepoint in `https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/{regular|bold}/style.css`.
2. Re-subset (fonttools): `pyftsubset Phosphor.woff2 --unicodes=U+e30c,… --flavor=woff2 --layout-features='' --no-hinting --desubroutinize --output-file=src/fonts/phosphor-regular-subset.woff2` (all codepoints of that weight, not just the new one).
3. Add its `.ph.ph-name:before { content: "\e…"; }` rule in `src/styles.css` §05.
4. `pnpm build`, release.

### Release steps (after merge)

1. Tag `v1.3.0` on the merge commit (CI green).
2. Webflow Embed 2a (G | Components): delete the three Phosphor `<link>`s,
   change `@1.2.0` → `@1.3.0`.
3. Site head: `RELEASE = "1.3.0"`.
4. Staging check, then "publish". Rollback: put both strings back to 1.2.0
   and re-add the three links (`docs/audit/step-1b/g-embed-code-2a.html`).
