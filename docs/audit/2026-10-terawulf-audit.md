# TeraWulf — live-site audit, 2026-10-09

This is a read-only audit of www.terawulf.com (Webflow site `69cc1149c7144d8f6b6c386a`) against the `brandvm/wf-template` workflow. **Nothing was changed in Webflow.** Every fix below needs approval item by item, gets staged on terawulff.webflow.io first, and is then published with `safe-publish`.

**Sources:**
- Local Lighthouse 12 runs (the PageSpeed API quota was exhausted for the day).
- `wf:a11y --live --all-widths`, which runs axe across 13 pages at 3 widths.
- A crawl of 168 pages: the sitemap, /news pages 1–30, and every resource they link to. It covered 263 internal and 243 external links.
- Reads of the Webflow CMS and sitemap data, plus raw HTML.

Raw data: [`2026-10-resources-indexing.csv`](2026-10-resources-indexing.csv).

## Summary

| Area | State | Impact | Main fix |
| --- | --- | --- | --- |
| Mobile performance | Lighthouse **59** (your test: 69), LCP **8.7 s**, FCP 4.5 s, 6.5 MB | High | Show the hero right away (IX3 gate), unblock icon CSS, lighter hero video |
| Desktop performance | Lighthouse **86** (your test: 81), LCP 1.9 s | Medium | Same fixes |
| Hero / LCP | LCP element is the **hero logo `<img loading="lazy">`**; 77% of LCP is render delay | High | Load it eagerly with `fetchpriority=high` and give it a size; stop hiding it until IX3 starts |
| Video | Hero WebM 7.6 MB is chosen first, with `preload=auto` and no poster; popup MP4 is 31 MB | High | Put the MP4 first, add a poster and smaller encode, set `preload=none` on the popup |
| Schema | `Organization` + `tickerSymbol`; Careers `@id` uses `/career` | Medium | Change to `Corporation` (same `@id`), fix the Careers URL |
| Accessibility | Axe serious/critical failures on every page (68 page×width combos) | Medium | ARIA on SplitText, link names, select label, contrast |
| Redirects / links | 2-hop redirect; `/wulf-mining` link; 9 hard-dead external links | Medium | One-hop 301s, fix CMS links |
| Indexing | 207 of 228 published resources excluded; 3 look accidental | Review | Your decision — see §7 |
| Tracking | Only Ahrefs analytics; no GA4/GTM; `googleTagIds` empty | Backlog | Find the existing GA4 property first |
| Repo / template | Old loader, untyped legacy JS, no CI checks | Done in [PR #1](https://github.com/brandvm/terawulf/pull/1) | Install the new loader with the next release |

## 1. Deviations from wf-template

| Template expects | TeraWulf today | Status |
| --- | --- | --- |
| Three-piece loader with one `RELEASE` (head, Embeds 2a/2b, footer) | Two pieces: CSS link in G \| Embed Code at `@1.1.1`, `VER` in footer, `bv-dev` flags | `loader.html` updated in PR #1; **pasting it into Webflow is gated** |
| `src/index.ts` `run()` manifest + typed `src/modules/*` | One `@ts-nocheck` IIFE | Done (PR #1) |
| CI: type check, tests, dist drift check, then Pages deploy | Build + deploy only | Done (PR #1) |
| `src/styles.css` template TOC, `repo-css:` tags, no root font-size, no Webflow variable names | Untagged; sets `:root` font-size; redefines `--_colors---*` | Re-sectioned and tagged (PR #1). Root scale and colour overrides are **kept** and logged as `override-webflow`, because changing them resizes the live site |
| Libraries bundled with `pnpm add`, no CDN script tags; Finsweet via the recipe | Finsweet v1 **and** v2 loaded from CDN on /news and /careers; Phosphor icons CSS from jsDelivr | Phase 3 |
| Page logic in the repo | Page scripts in Webflow: popup video (Home/About/Careers), **resize → `location.reload()` on /our-operations**, Gmail share on Resources | Phase 3 (move into modules) |
| Style guide at `/design/style-guide` covers every class, `noindex`, out of the sitemap | Exists (draft) with `includeInSitemap: true`; no noindex in head | Style guide v2 (Phase 4) |
| `docs/handoff/`, GOTCHAS, skills | Not present | Done (PR #1) |
| Hero video: MP4 first, poster, phone encode, pause control (conventions §14, §9) | WebM first, no poster, no pause control | Phase 3 |
| Skip link to `#main`, one h1, labelled forms | One h1 everywhere ✓; no skip link; select unlabeled on /connect | Phase 3 |

## 2. Performance (homepage, Lighthouse 12, local)

**Mobile: 59 · FCP 4.5 s · LCP 8.7 s · TBT 120 ms · CLS 0.054 · SI 6.7 s · 6,523 KiB**
**Desktop: 86 · FCP 0.7 s · LCP 1.9 s · TBT 10 ms · CLS 0.01**

### 2.1 Hero and LCP (the biggest single win)
- The mobile LCP element is the hero logo `img` inside `.home-terawulf-logo-w`, which is `Simplified Logo.svg` with `loading="lazy"` and no width or height.
  - LCP breakdown: TTFB 0.48 s, load delay 1.3 s, load 0.2 s, **render delay 6.7 s**.
  - Lighthouse flags both `lcp-lazy-loaded` and "fetchpriority=high should be applied".
- **Why the render delay is so long:**
  - Webflow IX3 writes a head `<style>` that sets `visibility:hidden !important` on the hero elements until `html.w-mod-ix3` is set: `.section.s-page-hero .home-terawulf-logo-w`, `.max-width` (the h1), `.grouped-cta-w`, `.section-stats-w`, every `[data-gsap="text-animate"|"para-in"]`, `.parallax-content`, and the page headers.
  - IX3 only starts after jQuery, webflow.js chunks and GSAP + ScrollTrigger + SplitText + CustomEase have loaded and run. All of them load synchronously at the end of the body.
  - So nothing in the first screen can paint until all of that JavaScript has finished.
- **Fix (Webflow IX3, keeps the approved motion):**
  - Remove the "hide until animated" initial state from the hero logo, h1 and CTA only. Animate them from a visible state, for example a short y/opacity tween that starts at load. Keep every below-fold animation exactly as it is.
  - Set the hero logo to Eager, add `fetchpriority=high`, and give it width/height (the SVG viewBox is about 153×174).
  - Same treatment for the nav logo mark: Eager, sized 25×29.
- On inner pages the hero background images are also `loading="lazy"`: Our Mission bg, Smoke, Operations Hero, NEW, Our Impact BG and Expertise Background. Set them to Eager, add `fetchpriority=high` to the one that is the LCP, and set their dimensions.

### 2.2 Video (why both MP4 and WebM download)
Two different videos are involved. It is not one video being downloaded twice:

| Video | Sources (order) | Size | Notes |
| --- | --- | --- | --- |
| Home hero `video.home-hero-video` | **WebM** 7,600,647 B, then MP4 6,763,101 B | Chrome takes the WebM | `preload="auto"`, no poster, a 1080p-class encode |
| "Who we are" Webflow Background Video | **MP4** 337,574 B, then WebM 1,447,127 B | Chrome takes the MP4 | Webflow controls the source order; poster 59 KB |
| Popup "Moving at a Different Speed" | MP4 **31,115,928 B** on `s3.amazonaws.com` | Partly fetched (~150–180 KB) on load | Hidden, with no `preload` attribute, so it defaults to metadata |

The ~17 MB in your PageSpeed test is the hero WebM, plus the background MP4, plus the popup's range requests, plus the images below. That adds up to a full-length hero download on a slow-throttled run.

Fix: same files and same look.
1. Hero:
   - Put the MP4 first, or drop the larger WebM (template §14: "skip WebM if it's larger").
   - Add a poster, which is the first frame.
   - Set `preload="metadata"`.
   - Add a mobile encode of about 720p / 1.5–2 MB, chosen with `<source media>` or set by a repo module.
2. Popup: set `preload="none"`, and set the `src` only when it's clicked. Move the inline popup-video script into a repo module (`popup-video.ts`) that serves Home, About and Careers.
3. "Who we are" background video: start loading it only near the viewport. A `lazy-video` module would swap Webflow's Background Video `data-video-urls` in through IntersectionObserver, keeping the poster meanwhile.
4. Reduced motion: show the poster and don't autoplay. Add a pause control to the looping hero (WCAG 2.2.2).

### 2.3 Images
| Image | Size | Issue |
| --- | --- | --- |
| Resources mega-menu cover (CMS item "Google has an in-house expert…", `Screenshot … 4.17.10 PM.png`) | **2.8 MB PNG** | A CMS cover screenshot, `sizes=100vw`, appears in the nav on every page |
| `Why Background.jpg` (parallax) | 850 KB | No srcset; Lighthouse estimates 708 KB savings at 412 px |
| `Compute Infrastructure at Scale.webp` | 136 KB | Shown at 379 px wide; 120 KB savings |
| `Map.webp` | 15 KB ×2 | Fetched **twice** because DottedCanvas re-fetches it with `?_nocache` for CORS |

- Every `<img>` on every audited page is missing width/height. CLS is low today because the containers are sized, but Lighthouse still flags it.
- Image delivery savings: mobile ~750 KB, desktop ~950 KB.

Fix, without changing which images are used:
- Re-encode the screenshot covers as WebP/AVIF. Use the `webflow-compress-cms-image` skill on the Resources `cover` field, starting with the 21 featured/nav items.
- Set `sizes` on the mega-menu image. Compress `Why Background.jpg`.
- Set width/height on the hero logo, nav logo and card images.
- Add `crossorigin="anonymous"` to `img.interactive-canvas-image` so DottedCanvas doesn't need to re-fetch.

### 2.4 Render-blocking CSS and fonts
- Three Phosphor CSS files load as render-blocking links in the body (regular, light and bold; 12 KB each). They pull 147 KB + 144 KB of icon fonts, about 2.0 s of estimated savings on mobile.
  - 455 instances use the E \| Icon component, which outputs `<i class="ph-bold ph-…">`.
  - Fix: self-host one subset woff2 with only the glyphs actually used, inlined in the 2a Embed CSS; or swap the icon component to inline SVG.
- **A broken preload:** `<link rel="preload" href="" as="font">` in head code. Remove it, and preload the Satoshi Variable woff2 used above the fold.
- Lenis CSS ships in head code, but no Lenis JS is loaded anywhere. Remove it.
- Webflow-hosted GSAP files and the background video are served with **no cache TTL** (`cache-insight`, about 484 KB). That is Webflow CDN behaviour; nothing to change on our side.

### 2.5 JavaScript and animation
- **Forced reflow:**
  - `gsap.min.js` 49 ms
  - `SplitText.min.js` 11 ms
  - `ScrollTrigger.min.js` 18 ms
  - SplitText splits every `[data-gsap="text-animate"|"para-in"]` on load, including below-fold paragraphs (71 split word spans flagged on /about alone).
  - Fix in IX3: split lines rather than words where the motion allows, and scope SplitText to elements entering the viewport.
- **Our own bundle:** `terawulf@1.1.1/dist/index.js` is a **282 ms** long task on mobile. It comes from DottedCanvas's first paint: `getImageData` plus a per-dot `sqrt` × hotspot loop, all at load.
  - Fix in the repo (no Webflow change): start the canvas only when it's near the viewport, precompute the dot mask once per size, and drop the `_nocache` re-fetch.
  - The 200 ms polling was already removed in PR #1.
- `/our-operations` reloads the whole page on width resize. On iOS the address bar collapsing changes the viewport, so this can reload mid-scroll. Replace it with a debounced `ScrollTrigger.refresh()` in a module, or remove it if the layout doesn't need it.
- jQuery 3.5.1 and webflow.js are Webflow-managed and can't be deferred from our side.

## 3. Schema (structured data)
- **Site head `@graph`:** `Organization` with `@id https://www.terawulf.com/#organization`, `tickerSymbol: "WULF"`, founders, address, sameAs and contactPoint, plus `WebSite` with `@id #website`.
  - `tickerSymbol` is defined on `Corporation`, not `Organization`, which is why Ahrefs flags it.
  - **Fix:** change `"@type": "Organization"` to `"Corporation"` and keep the `@id`, `name`, `legalName`, `alternateName`, `logo`, founders, address, sameAs, contactPoint and `tickerSymbol` exactly as they are. Every page reference (`about`, `publisher`, `isPartOf`) still resolves, because Corporation is a subtype of Organization.
  - Optional, with your approval: `"tickerSymbol": "NASDAQ: WULF"`.
- **Careers page:** the `@id`/`url` is `https://www.terawulf.com/career#webpage`, but the page lives at **/careers**.
- **Resources template BlogPosting:**
  - `description` is empty when the CMS description is empty. The 2023 letters, for example, have `"description": ""`. Fall back to `subheading`.
  - Add `dateModified`, plus `publisher` → `#organization`.
  - Noindexed items still output BlogPosting. That's harmless.
- **Canonical vs URL:** the canonical is `https://www.terawulf.com` with no slash; the JSON-LD URL has one. There's no `og:url`. Align them.
- **Validation plan** after the change: Schema.org validator and Rich Results Test on `/`, `/about`, `/careers`, `/our-sites` (ItemList), `/wulf-compute` (Service) and two resource items (one indexed, one excluded).

## 4. AEO / GEO, current practice
- `robots.txt` returns 200 with an **empty body**: no `Sitemap:` line and no AI-crawler policy.
  - Fix in Webflow → SEO → robots.txt: allow all crawlers, explicitly allow GPTBot, ClaudeBot, PerplexityBot and Google-Extended, and add `Sitemap: https://www.terawulf.com/sitemap.xml`.
- Add an `llms.txt`:
  - Use Webflow's SEO setting if available, or a 301 to a hosted file.
  - Content: a company summary, the key pages (About, Our Sites, WULF Compute, Our Impact, News) and investor links.
- **Entity clarity:**
  - Corporation schema with `sameAs` (already present).
  - Add `knowsAbout` (AI/HPC data centers, zero-carbon power, bitcoin mining).
  - Give each campus in the `/our-sites` ItemList a `Place` with a `geo` and address.
- **Answer-ready content:**
  - Each static page already has one h1 and descriptive copy.
  - A short FAQ block on WULF Compute and Our Sites, with FAQPage schema, would give answer engines quotable facts (MW capacity, locations, power mix). **That is a content decision.**
- Resource pages that are only an external video link (all 13 indexed Videos) are thin for search and AI answers. See §7.

## 5. Redirects and internal links
| Old URL | Today | Fix |
| --- | --- | --- |
| `/bitcoin-mining-separating-fact-from-fiction-bitcoin-policy-summit-livestream-with-kerri-langlais/` | 301 → no-slash URL → 301 `/news` (2 hops; 4 from `http://terawulf.com`) | One 301 straight to `/news` for both the slash and no-slash forms. **Note:** a matching item exists at `/resources/bitcoin-mining-separating-fact-from-fiction-bitcoin-policy-summit-livestream-with-kerri-langlais`. Should the redirect point there instead of `/news`? Your call. |
| `/wulf-mining` | 301 → `/our-sites` | Keep the redirect. The **one internal link** is in the body of `/resources/powering-the-future-energy-solutions-for-ai-hpc-and-bitcoin-mining`; change its href to `/our-sites` |
| Kerri Langlais old URL (with slash) | Linked from a /news card (CMS `external-link` on the 2023-04-27 item, /news page 14) | Change that `external-link` to the final URL |

- No other internal link returned anything but 200.
- The http → https → www hops are Webflow's domain handling; they're fine.
- GSC 404 mapping is in the backlog.

## 6. Broken external links
**Hard-dead links (404, DNS or TLS failure).** Each is the `external-link` of a /news card, unless noted:

| Link | Status | Where | Replacement |
| --- | --- | --- | --- |
| `investors.terawulf.com/events-and-presentations/presentations/default.aspx` | 404 | Feb 2023 CEO letter body | **`https://investors.terawulf.com/news-events/presentations`** (200, "Presentations :: TeraWulf Inc.") — swap the href only |
| `afpkudos.com/cryptocurrency/terawulf-revolutionizing-cryptocurrency-mining-with-clean-energy/` | 404 (site is up, article removed) | Card 2023-06-12, /news p13 | None found → **content decision** |
| `coinpedia.org/news/terawulf-launches-americas-first-100-nuclear-powered-bitcoin-mining-facility-in-pennsylvania/` | 404 (site is up, article removed) | Card 2023-03-06, /news p15 | None found → **content decision**. Options: Bitcoin Magazine's coverage of the same news, or TeraWulf's own 2023-03-06 Nautilus press release |
| `bnnbreaking.com/…terawulf-and-hut-8-lead-februarys…` | 404 | Card 2024-03-04 | Content decision |
| `makeuseof.com/surprising-ways-bitcoin-mining-benefits-environment/` | 404 | Card 2023-07-17 | Content decision |
| `coindesk.com/layer2/miningweek/2022/03/24/7-wild-bitcoin-mining-rigs` | 404 | Card 2022-03-24 | Possibly moved on CoinDesk; check |
| `bollyinside.com/…nautilus-complex…` | Domain gone | Card 2023-03-06 | Content decision |
| `blog.bitmain.com/en/terawulf-signs-a-purchase-order…` | Domain gone | Item 2021-07-20 | Content decision |
| `cryptotvplus.com/2023/06/why-nuclear-powered-bitcoin-mining-matters/` | TLS certificate invalid | Card 2023-06-08 | Check in a browser |

**Bot-blocked links: probably fine, but check by hand.** These returned 401, 403, 406 or 999:
- BusinessWire (8 links, incl. the 2023 open letter)
- Forbes (4), WSJ (2), NYT (2), Axios (2), Time (2), Blockworks (2)
- DCD, Blockspace, Data Centre Magazine, BeInCrypto, Cryptonews, CEO Magazine, alejandrocremades.com
- 3 LinkedIn profiles on /about
- allaboutcookies.org, linked over http on the privacy policy

## 7. Resource indexing (no changes made, for your decision)
**Live sitemap flags:**
- Of 228 published Resources, **21 are included and 207 excluded**. A 229th item is a draft.
- Excluded items render `<meta name="robots" content="noindex">`. Included items have no robots meta.
- This is Webflow's per-item sitemap setting; there is no CMS noindex field.
- The template page itself is fine.

**The pattern:**
- **Included:** all 8 Blog posts with original bodies, plus the 13 newest Videos (2026-08-26 to 2026-09-15). None of the 13 has a body; each is only a link to YouTube.
- **Excluded:** all 126 Company News items, which are third-party press coverage linking out; 75 older Videos; 6 uncategorised items; 1 Blog.

**Exclusions that look accidental** (full list in the CSV, column `flags`):
1. Three items whose body is **original press-release text** (700–850 words, Company News). These are first-party content, so they are the strongest candidates to index:
   - `terawulf-announces-participation-in-upcoming-conferences-and-events` (2025-03-24, 729 words)
   - `terawulf-schedules-conference-call-for-fourth-quarter-and-year-end-2024-financial-results` (2025-02-19, 857 words)
   - `terawulf-announces-participation-in-upcoming-investor-and-industry-conferences` (2025-01-14, 799 words)
2. The **inclusion rule is inconsistent for Videos.** The 13 newest videos (Sept 2026) are indexed. Equivalent July–August 2026 videos are excluded, for example:
   - `how-were-financing-the-anthropic-data-center-terawulf-cfo-patrick-fleury`
   - `power-first-…-part-1` and `building-at-the-speed-of-ai-…-part-2`
   
   This looks like new items defaulting to "included", not an editorial choice. Decide on one rule for Videos.
3. **Duplicate pairs**, where the indexed copy is the suffixed slug (`-2`, `-3`, `-st517`, `-gmo4u`) and the clean slug is excluded:
   - CEO Excited About Anthropic Data Center Agreement
   - CEO on demand in AI infrastructure
   - AI's biggest bottleneck isn't chips
   - CEO on recent deals (3 copies)
   - Huge TeraWulf news CFO Q&A
   - Tip of the iceberg (2 excluded + 1 draft)
   - AI power play with Nazar Khan
   
   Decide which copy is canonical. Removing a copy needs a 301 for it.
4. One **Blog** item is excluded, `ai-is-booming----but-can-we-power-it` (2026-04-15), but it has no body. It is consistent with the rule if it's only an external link.
5. Excluded items are still linked from "related" blocks and /news cards. That's fine for noindex, but crawlers spend budget on them.

Titles, descriptions and indexing rules are untouched, as you asked.

## 8. Accessibility (axe, WCAG 2.2 AA, 13 pages × 3 widths)
| Rule | Where | Cause | Fix |
| --- | --- | --- | --- |
| `aria-prohibited-attr` (serious, every page, 4–21 each) | Headings/paragraphs/pills with `data-gsap="text-animate"` | IX3 SplitText adds `aria-label` to plain `div`/`p` | IX3 SplitText setting: turn off its aria option, or give the element `role="heading"`/`role="text"`. Words are split; screen readers read the label |
| `link-name` (serious, every page) | Resource cards (`.resources-link` overlay), footer CTA buttons mid-animation, footer credit link, mobile `.g-nav-menu-drawer`, social icons, mailto on /connect | Empty overlay links; icon-only links | `aria-label` from the CMS name on `.resources-link`; label icon links |
| `select-name` (**critical**) | `/connect` `#Reason-for-Inquiry` | No `<label>` | Add a label (it can be visually hidden) |
| `color-contrast` | /about (71 nodes), /careers (28), /our-impact (16), resources | Mostly split words captured mid-reveal (opacity); also the /news filter label | Recheck after the reveal finishes; fix the real failures in the Designer |
| `aria-hidden-focus` | /about values section (`#W/#U/#L`) | Focusable content inside an `aria-hidden` split mask | Remove `aria-hidden` from the mask, or make the children non-focusable |

Also:
- There's no skip link.
- The hero video has no pause control.
- Reduced motion doesn't stop video autoplay.
- One h1 per page ✓.

## 9. Tracking (backlog)
- Only Ahrefs Web Analytics is on the site. Its head comment wrongly says "Finsweet Attributes".
- There is no GA4/GTM tag, and Webflow `googleTagIds` is empty.
- Per your instruction, nothing is being added until the existing GA4 property under the relations@brandvm.com account has been found and inquiry tracking tested.

## 9b. Animation approach (decided 2026-10-09)

The site will move off Webflow interactions, every version: classic IX, IX2
and IX3. Motion moves to CSS first, with repo modules only where CSS can't do
it, and the approved motion and timing are kept. AGENTS.md › Project notes
has the rules.

Current inventory:
- **IX3:** on every page. 35–37 `data-gsap="text-animate"` and 3–5 `"para-in"` per page, hero reveal, page headers, parallax images, stats, timeline overlays, and the desktop-only smoke and home-transition scenes.
- **IX2:** one element on /about, `.image-overlay.is_left` in Our Vision.

Removing IX also removes the IX3 visibility gate, which is the main cause of the mobile LCP delay. Once no interactions are left, Webflow's four GSAP scripts can be switched off.

## 10. Fix order (each needs your go-ahead)
1. **Repo, next release `v1.2.0`, no visual change.** Merge PR #1 first.
   - Lazy DottedCanvas
   - Popup-video module with `preload=none`
   - Lazy background video
   - Remove the resize-reload from /our-operations, replaced by a module
   
   Then install the new loader and remove the old snippets, the duplicate `theme-color`, the empty font preload and the Lenis CSS.
2. **Webflow, hero and LCP:**
   - Eager hero/nav logos with sizes
   - Hero video: MP4 first, poster, `preload=metadata`
3. **Animation migration (all IX versions → CSS / repo modules), page by page:**
   - Inventory each interaction read-only first (trigger, targets, duration, ease, stagger, breakpoints)
   - Rebuild it in the repo and compare on staging (`wf:film`, `wf:baseline`)
   - Then remove it from Webflow. The hero comes first, because it is the LCP fix
   - The SplitText ARIA failures go away with IX3
4. **Images:** compress CMS covers and `Why Background.jpg`; add width/height.
5. **Icons:** a Phosphor subset to replace the three blocking CSS files.
6. **Schema:** Corporation (`NASDAQ: WULF`), Careers URL, BlogPosting fallbacks, `og:url`. Then validate.
7. **AEO/GEO:** robots.txt Sitemap line and AI-crawler policy, `llms.txt`, `knowsAbout`, campus `Place` data.
8. **Redirects and links:**
   - Kerri Langlais single hop to `/news`
   - `/wulf-mining` link in the body
   - CEO letter presentations link
   - Dead-link cards: unpublish + 301 to `/news` (after client approval, see CLIENT-APPROVALS.md)
9. **Accessibility:** link names, the select label, a skip link, the video pause control.
10. **Style guide v2** at `/design/style-guide-v2`; take the current style guide and components pages out of the sitemap.

Decisions so far: [`DECISIONS.md`](DECISIONS.md). Visible content changes wait for the client: [`CLIENT-APPROVALS.md`](CLIENT-APPROVALS.md).

Before and after each step:
- Lighthouse mobile and desktop on `/`, `/about`, `/our-sites` and `/news`;
- `wf:baseline compare` at 1440/820/390;
- `wf:a11y`.
