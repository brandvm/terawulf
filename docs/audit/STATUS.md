# Clean-up status: the single tracker

Updated 2026-10-09. Every request from the clean-up session and its state.
Staging = terawulff.webflow.io. **Release plan (decided 2026-10-09): small
batches.** Step 1 (v1.2.0, G | Components, grid guide removed, page scripts)
goes to production first, after G0 and a QA pass, with explicit confirmation.
Every later fix then goes staging → check → production as its own batch.
Webflow publishes everything saved, so only one batch is in progress at a
time, and nobody publishes the custom domain mid-batch.

Legend: ✅ done · 🟡 partly done · ⬜ not started · ⏸ on hold (needs a decision) · 💤 backlog (by decision)

The client's shared checklist (20 items) maps onto these rows. An item is
ticked there only once it is live on www.terawulf.com and verified.
Client rule: keep the approved design and all existing wording.

## A. Repo and template

| | Item | State | Notes |
| --- | --- | --- | --- |
| A1 | Repo on wf-template 0.1.0 | ✅ | PR #1. Deviations on purpose: no `wfc-css-wait` body hiding (LCP), Embed 2a pins the release (one CSS fetch, PR #3), no `is-loading` scroll lock |
| A2 | Modules optimized, not copied | ✅ | dotted-canvas, popup-video, autoplay-video, resize-reload, hash-scroll, session-modal |
| A3 | Release v1.2.0 tagged | ✅ | **Live in production since 2026-10-09 (batch 1)** |
| A4 | Rollback point | ✅ | Tag `rollback/2026-10-09-pre-cleanup`, `docs/rollback/2026-10-09/`, Webflow backup "Pre-cleanup 2026-10-09" |
| A5 | GitHub protection | ✅ | `master` via PR with passing tests; `v*` and `rollback/*` tags permanent |
| A6 | Finsweet through the repo recipe | ⬜ | /news and /careers load Finsweet v1 + v2 from a CDN; the template wants `recipes/finsweet/` bundled |
| A7 | Offer template-candidate GOTCHAS to wf-template | ⬜ | The template workflow asks for this |

## B. Webflow structure → wf-template conventions

| | Item | State | Notes |
| --- | --- | --- | --- |
| B1 | G \| Components (aria-hidden, Embeds 2a/2b) | ✅ | Live, all 15 pages |
| B2 | Grid guide removed (component and classes) | 🟡 | `Grid Guide W` is still used somewhere, probably inside a component |
| B3 | Delete G \| Embed Code definition | ⬜ | After production is confirmed |
| B4 | **Page shell as components** (G \| Page W: skip link › G \| Nav W › G \| Main W › `main#main` slot › G \| Footer W) | ⬜ | Asked for at 1b. Pages already have Page Wrapper › G \| Navigation W › G \| Main W (`main`) › G \| Footer W, so this is a conversion |
| B5 | Structure audit against `conventions.md` (sections, naming, variables, style guide rules) | ⬜ | Part of the first request; only the code side was audited |
| B6 | Move off all Webflow interactions (IX, IX2, IX3) | ⬜ | Inventory: `ix-inventory.md` (21 IX3 + IX2 pieces). Check whether scroll markers (`showMarkers: true`) render on published pages |

## C. Performance (Phase 3)

| | Item | State | Notes |
| --- | --- | --- | --- |
| C1 | Popup videos: nothing before a click | ✅ | Module + `preload="none"`; 0 KB on staging |
| C2 | Hero video: MP4 first, poster, `preload="metadata"`, mobile file | ✅ | Live 2026-10-09 (batch 5). Batch 5: poster, MP4 only (WebM dropped), centre-cropped mobile file 3.2 MB (was 7.2). `preload` left as is: autoplay ignores it |
| C3 | Below-fold video deferred | ✅ | Measured in batch 5: the only below-fold autoplay video is Home's 0.3 MB background, which the module already defers. About/Careers previews are in the first screen, so they were made smaller rather than deferred |
| C4 | About/Careers preview loops (59 MB file streaming) | ✅ | Live 2026-10-09 (batch 5). Batch 5: Careers → 29 s 720p clip, 56.5 → 3.9 MB (decided). About: posters + 960 px phone file, 11.9 → 8.0 MB |
| C5 | Hero/first-screen images eager + `fetchpriority`; sizes on images | ✅ | Live 2026-10-09 (batch 4): hero preloads on Our Sites (−420 ms LCP), Our Operations, Our Impact. Home logo, WULF Compute, fonts tested and dropped (no gain). `batch-4/README.md` |
| C6 | Compress the 2.8 MB nav PNG and the 850 KB JPG (same images) | ✅ | Live 2026-10-09. Nav PNG done in batch 3 (2.8 MB → 279 KB). Batch 4: Why Background 850 → 682 KB, Purpose-Built 985 → 310 KB |
| C7 | Preload Satoshi | ✅ decided: no | Measured in batch 4: −20–40 ms LCP, +30–100 ms FCP (fonts already `swap`). Not added |
| C8 | Phosphor icons: subset, not blocking | 🟡 in repo | Batch 6: 13-glyph subset inlined in styles.css (2 KB vs ~550 KB, 3 blocking CSS removed), pixel-identical. Ships as v1.3.0: merge, tag, Embed 2a edit |
| C9 | Animation: hero not hidden behind IX3; SplitText/ScrollTrigger cost | ⬜ | Done through B6 |
| C10 | /our-operations resize reload | ✅ | Reloads only across breakpoints |
| C11 | Lenis CSS removed | ✅ | |
| C12 | `crossorigin` on the canvas image | ⬜ | MANUAL-TODO row A (the API can't set it) |

## D. SEO, AEO/GEO and links

| | Item | State | Notes |
| --- | --- | --- | --- |
| D1 | Corporation schema, `NASDAQ: WULF`, same `@id`; validate static pages and resource template | ✅ | Live 2026-10-09 (batch 2); validated on 239 pages |
| D2 | Careers `/career` → `/careers`; BlogPosting `dateModified`; `og:url`; `&#39;` in 21 headlines | 🟡 | Careers and dateModified live (batch 2). Description fallback dropped: multi-line subheadings broke the JSON (GOTCHAS). og:url and the headline entities are still open |
| D3 | robots.txt (Sitemap line, AI crawlers), llms.txt, entity data | 🟡 | robots.txt live (batch 2). llms.txt drafted, waiting on client approval A2. Entity data still open |
| D4 | /design pages out of the sitemap, noindex | ✅ | Live (batch 2) |
| D5 | Kerri Langlais → one 301 to /news; card link → press release | ✅ | Live 2026-10-09 (batch 3) |
| D6 | `/wulf-mining` link in the "Powering the future" body → `/our-sites` | ✅ | Live (batch 3) |
| D7 | CEO letter link → investors presentations page | ✅ | Decided. Appears only in the Feb 2023 letter: checked all 229 Resources items and the 168-page crawl. Keep the link text |
| D8 | 8 dead-link cards: unpublish + 301 to /news | ✅ | Live (batch 3) |
| D9 | Duplicates: keep the clean slug, unpublish + 301 the others | ✅ | Decided, per-set list in DECISIONS |
| D10 | Exclude all 88 Videos from Google | ✅ | Decided. The client's "don't change indexing rules" means pages; every affected page is listed for the client in `CLIENT-PAGE-LIST.md` |
| D11 | FAQ draft (AEO/GEO new content) | ⬜ | Client approval, asked last |
| D12 | `/home` → `/` and `/leadership` → `/about#leadership`, trailing-slash versions too (one 301 each) | ✅ | From the client checklist. Both 404 today; `id="leadership"` exists on /about |
| D13 | `/terawulf-charitable-foundation` (404) | ⏸ | Client checklist: on hold until a destination is decided |
| D14 | Older resources 7–18 clicks deep | ⏸ | Client checklist: on hold until the approach is decided |
| D15 | 20 resource pages missing Open Graph descriptions | ⏸ | Client checklist: on hold until meta description copy is approved. Not the same as D2, which only adds a schema fallback |

## E. Accessibility and components

| | Item | State | Notes |
| --- | --- | --- | --- |
| E1 | Popup + timed popup: keyboard and screen reader | ✅ | In the modules |
| E2 | Skip link | 🟡 staged | Batch 6: in G \| Navigation, `#main` on every page; one `main` per page (card wrappers were `<main>`) |
| E3 | Hero video pause control; reduced motion | 🟡 | Reduced motion in the module; the pause control needs a component |
| E4 | Link names (cards, CTAs, icons), Connect select label, SplitText ARIA, contrast recheck | 🟡 staged | Batch 6: footer/Connect/share icons, menu button, CMS card links (bound to Title), all 6 Connect labels wired. Left: footer CTA buttons + SplitText ARIA/contrast → B6 |
| E5 | **Components updated for performance and accessibility** (video, icon, interactive image, buttons/cards) | ⬜ | Asked for in the first message |

## F. Style guide

| | Item | State | Notes |
| --- | --- | --- | --- |
| F1 | Read the current /design/style-guide | ⬜ | |
| F2 | Prototype → `/design/style-guide-v2` (new page, old one kept) | ⬜ | |

## G. Release to production

| | Item | State | Notes |
| --- | --- | --- | --- |
| G0 | Visual baseline of production (`wf:baseline save --live`) + `wf:outline` | ✅ | `baselines/production-2026-10-09/` (13 pages × 3 widths, 97 MB, not committed yet). One H1 per page |
| G1 | QA on staging for each batch: baseline compare, Lighthouse, axe, links, schema validators; navigation, video controls and forms still work | ✅ batch 1 | Visual (noise measured on production), outline, nav, mobile menu, popups, form, Lighthouse, CLS (staging-only shift from the stylesheet swap; production unchanged) |
| G2 | Production publish per batch (`safe-publish`), with explicit confirmation | ✅ batches 1–5 | Published 2026-10-09 after a staging recheck (an unidentified 17:05 UTC Webflow save was included and rechecked); verified live |
| G3 | Before/after report for the client: fresh crawl, mobile and desktop PageSpeed | ⬜ | Client checklist "Wrap-up"; the Ahrefs rerun is in the backlog |

## Backlog (by decision)

- 💤 Ahrefs crawl depth and rerun
- 💤 Search Console 404 mapping
- 💤 GA4 property and inquiry tracking

## Client checklist: tickable items

| Client item | Ticked |
| --- | --- |
| 207 resource pages are noindex | ✅ review done |
| Company schema uses tickerSymbol on Organization | ✅ batch 2 live |
| robots.txt is empty | ✅ batch 2 live |
| Dead investor presentations link | ✅ live (only occurrence: Feb 2023 letter) |
| `/home` and `/leadership` return 404 | ✅ batch 3 live (slash versions: Webflow strips the slash, then one redirect) |
| Redirect chain to /news | ✅ batch 3 live: one step |
| Internal links point through redirects | ✅ live (`/wulf-mining` was the only one found) |
| AFPKudos and Coinpedia links return 404 | ✅ cards removed, 301 to /news, no wording changed |
